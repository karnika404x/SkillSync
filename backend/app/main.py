from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.config import settings
from app.database import engine, Base, seed_initial_data
from app.routers import auth, employees, projects, matching, applications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables & Seed Data
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered internal talent & project marketplace API built with FastAPI.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)

# Mount React frontend static assets if built
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
REACT_DIST_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")
REACT_ASSETS_DIR = os.path.join(REACT_DIST_DIR, "assets")

if os.path.exists(REACT_ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=REACT_ASSETS_DIR), name="assets")

@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_provider": settings.AI_PROVIDER
    }

# Serve React App or fallback single page
@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    # Don't intercept API calls
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        return {"error": "Not Found"}

    react_index = os.path.join(REACT_DIST_DIR, "index.html")
    if os.path.exists(react_index):
        return FileResponse(react_index, media_type="text/html")

    root_index = os.path.join(PROJECT_ROOT, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index, media_type="text/html")

    return {"message": "SkillSync API is running. Visit /docs for OpenAPI documentation."}
