from typing import List
import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field


# Ensure both root and backend .env files are loaded before settings are evaluated
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
BACKEND_DIR = os.path.dirname(__file__)

load_dotenv(os.path.join(ROOT_DIR, ".env"))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))


class Settings(BaseSettings):
    """
    Central configuration for the backend.

    Values are loaded from environment variables and optional .env files.
    """

    # Supabase project configuration (kept for backward compatibility)
    SUPABASE_URL: AnyHttpUrl = Field(alias="VITE_SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str | None = Field(default=None, alias="SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_ANON_KEY: str | None = Field(default=None, alias="VITE_SUPABASE_ANON_KEY")
    SUPABASE_JWT_SECRET: str | None = Field(default=None, alias="SUPABASE_JWT_SECRET")

    # Custom JWT secret for password-based auth
    JWT_SECRET: str = Field(default="your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Google Gemini API key for medical image analysis
    GEMINI_API_KEY: str | None = None

    # RapidAPI key for map services
    RAPIDAPI_KEY: str | None = None

    # Comma-separated list of allowed origins for CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    @property
    def allowed_origins(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    class Config:
        case_sensitive = False
        extra = "ignore"


settings = Settings()

# Validate critical settings on startup
if settings.JWT_SECRET == "your-secret-key-change-in-production":
    import warnings
    import sys
    
    # Check if we're in production (you can customize this check)
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    
    if is_production:
        raise RuntimeError(
            "CRITICAL: JWT_SECRET is using the default value in production. "
            "Please set a strong JWT_SECRET in your backend/.env file."
        )
    else:
        warnings.warn(
            "JWT_SECRET is using the default value. Please set a strong JWT_SECRET in your backend/.env file for production.",
            RuntimeWarning
        )


