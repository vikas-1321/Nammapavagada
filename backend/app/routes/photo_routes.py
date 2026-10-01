from flask import Blueprint, request
from app.services.photo_service import photo_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

photo_bp = Blueprint("photos", __name__, url_prefix="/api")

@photo_bp.route("/photos/<entity_type>/<entity_id>", methods=["GET"])
def get_photos(entity_type, entity_id):
    photos = photo_service.get_photos_for_entity(entity_type, entity_id)
    return api_response(photos)

@photo_bp.route("/admin/photos/upload", methods=["POST"])
@require_admin
def upload_photo():
    if "file" not in request.files:
        return api_error("No file provided in 'file' field.", "NO_FILE", 400)

    file = request.files["file"]
    if file.filename == "":
        return api_error("Empty filename.", "EMPTY_FILENAME", 400)

    entity_type = request.form.get("entityType", "location")
    entity_id = request.form.get("entityId")
    if not entity_id:
        return api_error("entityId is required.", "MISSING_ENTITY_ID", 400)

    photo_type = request.form.get("photoType", "Main Photo")
    caption = request.form.get("caption", "")
    alt_text = request.form.get("altText", "")
    is_primary = request.form.get("isPrimary", "false").lower() in ("true", "1", "yes")

    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        photo = photo_service.upload_photo(
            file_storage=file,
            entity_type=entity_type,
            entity_id=entity_id,
            photo_type=photo_type,
            caption=caption,
            alt_text=alt_text,
            is_primary=is_primary,
            admin_email=admin_email,
            ip=ip,
        )
        return api_response(photo.to_dict(), message="Photo uploaded successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "UPLOAD_ERROR", 400)
    except Exception as e:
        return api_error(f"Upload failed: {str(e)}", "SERVER_ERROR", 500)

@photo_bp.route("/admin/photos/<int:photo_id>/primary", methods=["PUT"])
@require_admin
def set_primary_photo(photo_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        photo = photo_service.set_primary(photo_id, admin_email=admin_email, ip=ip)
        return api_response(photo.to_dict(), message="Set as primary photo.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@photo_bp.route("/admin/photos/<int:photo_id>", methods=["PUT"])
@require_admin
def update_photo(photo_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        photo = photo_service.update_photo(photo_id, data, admin_email=admin_email, ip=ip)
        return api_response(photo.to_dict(), message="Photo details updated.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@photo_bp.route("/admin/photos/<int:photo_id>", methods=["DELETE"])
@require_admin
def delete_photo(photo_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        photo_service.delete_photo(photo_id, admin_email=admin_email, ip=ip)
        return api_response(None, message="Photo deleted successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@photo_bp.route("/admin/photos/requests", methods=["GET"])
@require_admin
def get_photo_requests():
    """Photo Request Workflow: Lists entities and their missing recommended authentic photos."""
    requests_list = photo_service.get_missing_photo_requests()
    return api_response(requests_list)
