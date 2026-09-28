from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, User
from app.schemas import ShortlistRequest, TalentMatchResult, MatchExplanation
from app.auth import get_current_user
from app.ai_matcher import AISkillMatcher

router = APIRouter(prefix="/matching", tags=["AI Skill Matching"])

@router.post("/shortlist", response_model=List[TalentMatchResult])
def generate_shortlist(
    request: ShortlistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run AI Skill Matching engine for a specific project.
    Returns ranked shortlist with explainable match scores and breakdown.
    """
    proj = db.query(Project).filter(Project.id == request.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    employees = db.query(User).all()
    if not employees:
        return []

    return AISkillMatcher.shortlist_candidates(proj, employees, top_n=request.top_n or 10)

@router.get("/explain", response_model=MatchExplanation)
def explain_match(
    project_id: int = Query(..., description="Target project ID"),
    employee_id: str = Query(..., description="Target employee ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a detailed, explainable match breakdown for a specific employee and project pair.
    """
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    emp = db.query(User).filter(User.id == employee_id.upper()).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    return AISkillMatcher.calculate_match(emp, proj)
