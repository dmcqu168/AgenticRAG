from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Agentic RAG"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["*"]  # In production, replace with your frontend URL
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    CHROMA_DB_PATH: str = "./chroma_db"
    
    # LLM Settings
    OPENAI_API_KEY: Optional[str] = None
    MODEL_NAME: str = "gpt-4"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
