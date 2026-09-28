from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # e.g. EMP-1001
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Employee") # Employee, Project Manager, HR/Admin
    job_title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    experience_years = Column(Integer, default=0)
    
    # Store JSON arrays as Text strings
    skills = Column(Text, default="[]")
    interests = Column(Text, default="[]")
    hidden_skills = Column(Text, default="[]")
    training_completed = Column(Text, default="[]")
    
    knowledge_score = Column(Integer, default=75)
    communication_score = Column(Integer, default=75)
    recommendation_score = Column(Integer, default=75)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="employee", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="employee", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, default="[]") # JSON string array
    status = Column(String, default="Open") # Open, In Progress, Completed, Closed
    owner = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="project", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    employee_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="Pending") # Pending, Shortlisted, Accepted, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="applications")
    employee = relationship("User", back_populates="applications")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill = Column(String, nullable=False)
    status = Column(String, default="Not Started") # Not Started, In Progress, Completed
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("User", back_populates="learning_progress")
