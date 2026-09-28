import uvicorn
import os
import sys

if __name__ == "__main__":
    print("=== Starting SkillSync FastAPI Backend Server ===")
    print("Interactive API Documentation: http://localhost:8000/docs")
    print("Frontend Web App URL:          http://localhost:8000/")
    print("=================================================")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
