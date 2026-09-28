import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db, seed_initial_data
from app.models import User, Project, Application, LearningProgress
from app.schemas import LoginRequest, Token, EmployeeResponse
from app.auth import verify_password, create_access_token, get_current_user
from app.ai_matcher import AISkillMatcher

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate employee/manager using employee_id and password.
    Supports standard demo login (EMP-1001, EMP-1002, EMP-1003, etc.).
    """
    emp_id = request.employee_id.strip().upper()
    user = db.query(User).filter(User.id == emp_id).first()

    if not user:
        # Fallback to demo default user if requested ID is new in demo mode
        user = db.query(User).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Employee ID or Password"
            )

    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID or Password"
        )

    # Allow role switching for demo UI flexibility
    selected_role = request.role if request.role in ["Employee", "Project Manager", "HR/Admin"] else user.role

    access_token = create_access_token(
        data={"sub": user.id, "role": selected_role}
    )

    user_payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": selected_role,
        "job_title": user.job_title,
        "department": user.department,
        "experience_years": user.experience_years,
        "skills": AISkillMatcher._parse_json_list(user.skills),
        "interests": AISkillMatcher._parse_json_list(user.interests),
        "hidden_skills": AISkillMatcher._parse_json_list(user.hidden_skills)
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_payload
    }

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return EmployeeResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        job_title=current_user.job_title,
        department=current_user.department,
        experience_years=current_user.experience_years,
        skills=AISkillMatcher._parse_json_list(current_user.skills),
        interests=AISkillMatcher._parse_json_list(current_user.interests),
        hidden_skills=AISkillMatcher._parse_json_list(current_user.hidden_skills),
        training_completed=AISkillMatcher._parse_json_list(current_user.training_completed),
        knowledge_score=current_user.knowledge_score,
        communication_score=current_user.communication_score,
        recommendation_score=current_user.recommendation_score,
        created_at=current_user.created_at
    )

@router.post("/reset-demo")
def reset_demo_data(db: Session = Depends(get_db)):
    """Reset database tables and re-seed clean initial demo data."""
    db.query(Application).delete()
    db.query(LearningProgress).delete()
    db.query(Project).delete()
    db.query(User).delete()
    db.commit()

    seed_initial_data(db)
    return {"message": "Demo database successfully reset to factory defaults."}
