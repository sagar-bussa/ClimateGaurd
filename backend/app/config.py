import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Search for .env in current folder, parent folder (root), or system env
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

env_files = []
if (BASE_DIR / ".env").exists():
    env_files.append(str(BASE_DIR / ".env"))
if (ROOT_DIR / ".env").exists():
    env_files.append(str(ROOT_DIR / ".env"))

class Settings(BaseSettings):
    # API Keys (Stored privately in backend/.env or root .env, never exposed to client)
    OPENWEATHER_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Supabase (PostgreSQL)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    # Operational flags
    DEMO_MODE: bool = False
    ENVIRONMENT: str = "development"
    CACHE_TTL_SECONDS: int = 600  # 10 minutes cache
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = {
        "env_file": env_files if env_files else None,
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()
