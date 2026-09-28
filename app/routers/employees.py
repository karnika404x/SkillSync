import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Project, LearningProgress
from app.schemas import (
    EmployeeResponse, EmployeeUpdate, EmployeeCreate,
    HiddenTalentCandidate, UpskillingItem, LearningProgressUpdate
)
from app.auth import get_current_user, get_password_hash
from app.ai_matcher import AISkillMatcher

router = APIRouter(prefix="/employees", tags=["Employees & Talent"])

def _to_employee_response(user: User) -> EmployeeResponse:
    return EmployeeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        job_title=user.job_title,
        department=user.department,
        experience_years=user.experience_years,
        skills=AISkillMatcher._parse_json_list(user.skills),
        interests=AISkillMatcher._parse_json_list(user.interests),
        hidden_skills=AISkillMatcher._parse_json_list(user.hidden_skills),
        training_completed=AISkillMatcher._parse_json_list(user.training_completed),
        knowledge_score=user.knowledge_score,
        communication_score=user.communication_score,
        recommendation_score=user.recommendation_score,
        created_at=user.created_at
    )

@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all workforce employees, optionally filtered by department."""
    query = db.query(User)
    if department:
        query = query.filter(User.department == department)
    employees = query.all()
    return [_to_employee_response(emp) for emp in employees]

@router.get("/hidden-talent", response_model=List[HiddenTalentCandidate])
def get_hidden_talent(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Surfaces employees with discoverable or hidden skills beyond their job title."""
    employees = db.query(User).all()
    projects = db.query(Project).all()
    return AISkillMatcher.discover_hidden_talent(employees, projects)

@router.get("/upskilling", response_model=List[UpskillingItem])
def get_upskilling_matrix(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Identifies skill gaps and returns learning actions across projects."""
    employees = db.query(User).all()
    projects = db.query(Project).all()

    # Load existing learning progress records from database
    progress_records = db.query(LearningProgress).all()
    records_dict = {f"{r.employee_id}|{r.skill}": r.status for r in progress_records}

    return AISkillMatcher.generate_upskilling_matrix(employees, projects, records_dict)

@router.post("/upskilling")
def update_learning_progress(
    update: LearningProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update learning status (Not Started, In Progress, Completed) for an employee's skill gap."""
    record = db.query(LearningProgress).filter(
        LearningProgress.employee_id == update.employee_id,
        LearningProgress.skill == update.skill
    ).first()

    if record:
        record.status = update.status
    else:
        record = LearningProgress(
            employee_id=update.employee_id,
            skill=update.skill,
            status=update.status
        )
        db.add(record)
    
    db.commit()
    return {"message": "Learning progress updated successfully", "employee_id": update.employee_id, "skill": update.skill, "status": update.status}

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee details by ID."""
    emp = db.query(User).filter(User.id == employee_id.upper()).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _to_employee_response(emp)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update employee profile attributes."""
    emp = db.query(User).filter(User.id == employee_id.upper()).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if update.name is not None: emp.name = update.name
    if update.job_title is not None: emp.job_title = update.job_title
    if update.department is not None: emp.department = update.department
    if update.experience_years is not None: emp.experience_years = update.experience_years
    if update.skills is not None: emp.skills = json.dumps(update.skills)
    if update.interests is not None: emp.interests = json.dumps(update.interests)
    if update.hidden_skills is not None: emp.hidden_skills = json.dumps(update.hidden_skills)
    if update.training_completed is not None: emp.training_completed = json.dumps(update.training_completed)

    db.commit()
    db.refresh(emp)
    return _to_employee_response(emp)
