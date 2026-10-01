import os
from flask import Blueprint, send_from_directory
from app.models.base import db
from app.config.config import get_config
from app.services.s3_service import s3_service
from app.middleware.error_handler import api_response, api_error

health_bp = Blueprint("health", __name__, url_prefix="/api")
config = get_config()

@health_bp.route("/health", methods=["GET"])
def health_check():
    db_ok = False
    try:
        db.session.execute(db.text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_error = str(e)

    return api_response({
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "s3Storage": "active" if s3_service.is_s3_enabled() else "local_fallback",
        "region": config.AWS_REGION,
        "bucket": config.S3_BUCKET_NAME if s3_service.is_s3_enabled() else "local_disk",
        "environment": config.ENV,
    })

@health_bp.route("/media/<filename>", methods=["GET"])
def get_local_media(filename):
    """Serves uploaded media files when running with local fallback storage."""
    folder = config.LOCAL_UPLOAD_FOLDER
    if not os.path.exists(os.path.join(folder, filename)):
        return api_error("Media file not found.", "NOT_FOUND", 404)
    return send_from_directory(folder, filename)
