from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    employee_id: str
    password: str
    role: Optional[str] = "Employee"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenData(BaseModel):
    employee_id: Optional[str] = None
    role: Optional[str] = None


# --- Employee / User Schemas ---
class EmployeeBase(BaseModel):
    name: str
    email: str
    role: str = "Employee"
    job_title: str
    department: str
    experience_years: int = 0
    skills: List[str] = []
    interests: List[str] = []
    hidden_skills: List[str] = []
    training_completed: List[str] = []
    knowledge_score: int = 75
    communication_score: int = 75
    recommendation_score: int = 75

class EmployeeCreate(EmployeeBase):
    id: str
    password: str = "demo123"

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    hidden_skills: Optional[List[str]] = None
    training_completed: Optional[List[str]] = None

class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    department: str
    description: str
    required_skills: List[str]
    status: str = "Open"
    owner: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    status: Optional[str] = None
    owner: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Application Schemas ---
class ApplicationCreate(BaseModel):
    project_id: int

class ApplicationResponse(BaseModel):
    id: int
    project_id: int
    employee_id: str
    status: str
    created_at: datetime
    project: Optional[ProjectResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- AI Skill Matching Schemas ---
class MatchScoreComponent(BaseModel):
    skill_overlap_score: float
    vector_similarity_score: float
    experience_score: float
    interest_score: float
    performance_score: float

class MatchExplanation(BaseModel):
    score: int
    status_label: str
    hits: List[str]
    missing: List[str]
    interest_aligned: bool
    components: MatchScoreComponent

class TalentMatchResult(BaseModel):
    employee: EmployeeResponse
    match_score: int
    explanation: MatchExplanation

class ShortlistRequest(BaseModel):
    project_id: int
    top_n: Optional[int] = 10


# --- Hidden Talent & Upskilling Schemas ---
class HiddenTalentCandidate(BaseModel):
    employee: EmployeeResponse
    discoverable_skills: List[str]
    potential_project_matches: List[Dict[str, Any]]

class UpskillingItem(BaseModel):
    employee_id: str
    employee_name: str
    project_id: int
    project_title: str
    missing_skill: str
    suggested_action: str
    learning_status: str

class LearningProgressUpdate(BaseModel):
    employee_id: str
    skill: str
    status: str # "Not Started", "In Progress", "Completed"
