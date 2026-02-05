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

    # Supabase project configuration
    SUPABASE_URL: AnyHttpUrl = Field(alias="VITE_SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None

    # OpenRouter API key for AI analysis
    OPENROUTER_API_KEY: str | None = None

    # Comma-separated list of allowed origins for CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"

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

