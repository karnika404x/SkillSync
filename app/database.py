import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_initial_data(db_session=None):
    """Seed initial sample projects and employees if database is empty."""
    from app.models import User, Project, Application, LearningProgress
    from app.auth import get_password_hash

    close_session = False
    if db_session is None:
        db_session = SessionLocal()
        close_session = True

    try:
        # Check if users exist
        if db_session.query(User).count() == 0:
            demo_password_hash = get_password_hash("demo123")
            
            initial_employees = [
                User(
                    id="EMP-1001",
                    name="Sarah Johnson",
                    email="sarah.johnson@techbyte.com",
                    hashed_password=demo_password_hash,
                    role="Employee",
                    job_title="Frontend Developer",
                    department="Engineering",
                    experience_years=2,
                    skills=json.dumps(["React", "JavaScript", "Python", "NLP"]),
                    interests=json.dumps(["AI/ML", "Data Analytics"]),
                    hidden_skills=json.dumps(["Python", "NLP"]),
                    knowledge_score=82,
                    communication_score=78,
                    recommendation_score=75,
                    training_completed=json.dumps(["React Advanced"])
                ),
                User(
                    id="EMP-1002",
                    name="Rohan Verma",
                    email="rohan.verma@techbyte.com",
                    hashed_password=demo_password_hash,
                    role="Project Manager",
                    job_title="Backend Developer",
                    department="Engineering",
                    experience_years=4,
                    skills=json.dumps(["Python", "SQL", "APIs", "Docker", "AWS"]),
                    interests=json.dumps(["Cloud", "AI/ML"]),
                    hidden_skills=json.dumps(["AWS", "Docker"]),
                    knowledge_score=90,
                    communication_score=72,
                    recommendation_score=85,
                    training_completed=json.dumps(["AWS Fundamentals"])
                ),
                User(
                    id="EMP-1003",
                    name="Aisha Khan",
                    email="aisha.khan@techbyte.com",
                    hashed_password=demo_password_hash,
                    role="HR/Admin",
                    job_title="Data Analyst",
                    department="Data & AI",
                    experience_years=3,
                    skills=json.dumps(["SQL", "Data Analytics", "Python", "Statistics"]),
                    interests=json.dumps(["AI/ML", "Analytics"]),
                    hidden_skills=json.dumps(["Python"]),
                    knowledge_score=88,
                    communication_score=91,
                    recommendation_score=80,
                    training_completed=json.dumps(["Machine Learning Basics"])
                ),
                User(
                    id="EMP-1004",
                    name="Dev Patel",
                    email="dev.patel@techbyte.com",
                    hashed_password=demo_password_hash,
                    role="Employee",
                    job_title="UI/UX Designer",
                    department="Design",
                    experience_years=2,
                    skills=json.dumps(["UI/UX", "Figma", "Research", "Communication"]),
                    interests=json.dumps(["Product", "Frontend"]),
                    hidden_skills=json.dumps([]),
                    knowledge_score=76,
                    communication_score=93,
                    recommendation_score=82,
                    training_completed=json.dumps(["Design Systems"])
                ),
                User(
                    id="EMP-1005",
                    name="Meera Iyer",
                    email="meera.iyer@techbyte.com",
                    hashed_password=demo_password_hash,
                    role="Employee",
                    job_title="Software Engineer",
                    department="Platform",
                    experience_years=5,
                    skills=json.dumps(["JavaScript", "React", "APIs", "Docker", "AWS"]),
                    interests=json.dumps(["Cloud", "Product"]),
                    hidden_skills=json.dumps(["AWS", "Docker"]),
                    knowledge_score=86,
                    communication_score=80,
                    recommendation_score=88,
                    training_completed=json.dumps(["Cloud Practitioner"])
                ),
            ]
            db_session.add_all(initial_employees)
            db_session.commit()

        # Check if projects exist
        if db_session.query(Project).count() == 0:
            initial_projects = [
                Project(
                    id=1,
                    title="AI Customer Analytics Platform",
                    department="Data & AI",
                    description="Build a platform that turns customer data into actionable insights using machine learning.",
                    required_skills=json.dumps(["Python", "Machine Learning", "SQL", "Cloud"]),
                    status="Open",
                    owner="Priya Mehta"
                ),
                Project(
                    id=2,
                    title="Smart HR Insights Dashboard",
                    department="Human Resources",
                    description="Create analytics dashboards for workforce trends, skills, and internal mobility.",
                    required_skills=json.dumps(["React", "Data Analytics", "SQL", "Communication"]),
                    status="Open",
                    owner="Arjun Rao"
                ),
                Project(
                    id=3,
                    title="Internal Knowledge Assistant",
                    department="Engineering",
                    description="Build a searchable assistant for company documents and team knowledge.",
                    required_skills=json.dumps(["Python", "NLP", "APIs", "RAG"]),
                    status="Open",
                    owner="Neha Kapoor"
                ),
                Project(
                    id=4,
                    title="Cloud Migration Initiative",
                    department="Platform",
                    description="Support migration planning, cloud deployment, and reliability improvements.",
                    required_skills=json.dumps(["AWS", "Docker", "DevOps", "Networking"]),
                    status="Open",
                    owner="Kabir Singh"
                ),
                Project(
                    id=5,
                    title="Employee Experience Portal",
                    department="People Ops",
                    description="Improve employee self-service with a responsive internal web portal.",
                    required_skills=json.dumps(["React", "JavaScript", "UI/UX", "REST APIs"]),
                    status="Open",
                    owner="Aditi Shah"
                ),
            ]
            db_session.add_all(initial_projects)
            db_session.commit()

    finally:
        if close_session:
            db_session.close()
