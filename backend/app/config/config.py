import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class Config:
    """Base configuration with safe local defaults and AWS readiness."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-npweb-pvg-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-pvg-secured-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRY_HOURS", "24")))

    # Database: Supports SQLite for local dev or PostgreSQL / AWS RDS for production
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'namma_pavagada.db')}"
    )
    # Fix postgres:// URL scheme if using older Heroku/Render format
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }

    # AWS S3 Settings
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION = os.getenv("AWS_REGION", "ap-south-1") # Default to Mumbai for Karnataka
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "namma-pavagada-media")
    S3_USE_LOCAL_FALLBACK = os.getenv("S3_USE_LOCAL_FALLBACK", "True").lower() in ("true", "1", "yes")

    # Local file upload directory when S3 is offline/unconfigured
    LOCAL_UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}

    # CORS Origins (Public frontend, Admin frontend, Local ports)
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"
        ).split(",")
    ]


class DevelopmentConfig(Config):
    DEBUG = True
    ENV = "development"


class StagingConfig(Config):
    DEBUG = False
    ENV = "staging"


class ProductionConfig(Config):
    DEBUG = False
    ENV = "production"
    # In production, require secure secrets
    S3_USE_LOCAL_FALLBACK = False


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "staging": StagingConfig,
    "production": ProductionConfig,
}

def get_config():
    env = os.getenv("FLASK_ENV", "development").lower()
    return CONFIG_MAP.get(env, DevelopmentConfig)
