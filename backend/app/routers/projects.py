import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, User
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.auth import get_current_user, require_roles
from app.ai_matcher import AISkillMatcher

router = APIRouter(prefix="/projects", tags=["Project Marketplace"])

def _to_project_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        title=project.title,
        department=project.department,
        description=project.description,
        required_skills=AISkillMatcher._parse_json_list(project.required_skills),
        status=project.status,
        owner=project.owner,
        created_at=project.created_at
    )

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all project opportunities with optional text search and department filter."""
    query = db.query(Project)

    if department:
        query = query.filter(Project.department == department)
    if status_filter:
        query = query.filter(Project.status == status_filter)

    projects = query.all()

    if search:
        q_lower = search.lower()
        filtered = []
        for p in projects:
            skills_str = " ".join(AISkillMatcher._parse_json_list(p.required_skills)).lower()
            if (q_lower in p.title.lower() or 
                q_lower in p.description.lower() or 
                q_lower in p.department.lower() or 
                q_lower in skills_str):
                filtered.append(p)
        projects = filtered

    return [_to_project_response(p) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Project Manager", "HR/Admin"]))
):
    """Create a new project opportunity (Project Managers & HR/Admin)."""
    new_proj = Project(
        title=project_in.title.strip(),
        department=project_in.department.strip(),
        description=project_in.description.strip(),
        required_skills=json.dumps(project_in.required_skills),
        status=project_in.status,
        owner=project_in.owner.strip() or current_user.name
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return _to_project_response(new_proj)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project details by ID."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return _to_project_response(proj)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Project Manager", "HR/Admin"]))
):
    """Update project details."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if update.title is not None: proj.title = update.title
    if update.department is not None: proj.department = update.department
    if update.description is not None: proj.description = update.description
    if update.required_skills is not None: proj.required_skills = json.dumps(update.required_skills)
    if update.status is not None: proj.status = update.status
    if update.owner is not None: proj.owner = update.owner

    db.commit()
    db.refresh(proj)
    return _to_project_response(proj)

@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Project Manager", "HR/Admin"]))
):
    """Delete project opportunity."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(proj)
    db.commit()
    return {"message": "Project deleted successfully", "id": project_id}
