from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Project, User
from app.schemas import ApplicationCreate, ApplicationResponse, ProjectResponse
from app.auth import get_current_user
from app.ai_matcher import AISkillMatcher

router = APIRouter(prefix="/applications", tags=["Project Applications"])

def _to_application_response(app: Application) -> ApplicationResponse:
    proj_resp = None
    if app.project:
        proj_resp = ProjectResponse(
            id=app.project.id,
            title=app.project.title,
            department=app.project.department,
            description=app.project.description,
            required_skills=AISkillMatcher._parse_json_list(app.project.required_skills),
            status=app.project.status,
            owner=app.project.owner,
            created_at=app.project.created_at
        )
    return ApplicationResponse(
        id=app.id,
        project_id=app.project_id,
        employee_id=app.employee_id,
        status=app.status,
        created_at=app.created_at,
        project=proj_resp
    )

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_project(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Express interest in a project opportunity."""
    proj = db.query(Project).filter(Project.id == app_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = db.query(Application).filter(
        Application.project_id == app_in.project_id,
        Application.employee_id == current_user.id
    ).first()

    if existing:
        return _to_application_response(existing)

    new_app = Application(
        project_id=app_in.project_id,
        employee_id=current_user.id,
        status="Pending"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return _to_application_response(new_app)

@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List project applications for current employee or specified project."""
    query = db.query(Application)
    
    if project_id:
        query = query.filter(Application.project_id == project_id)
    else:
        query = query.filter(Application.employee_id == current_user.id)

    apps = query.all()
    return [_to_application_response(a) for a in apps]
