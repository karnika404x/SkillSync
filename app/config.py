import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillSync API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skillsync-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for demo ease
    
    # Database (SQLite by default for portable demo, customizable via env)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillsync.db")
    
    # AI Engine settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "hybrid") # hybrid (TF-IDF + rule-based), ollama, gemini, openai
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
