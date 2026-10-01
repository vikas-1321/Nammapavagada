from flask import Blueprint, request
from app.services.history_service import history_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

history_bp = Blueprint("history", __name__, url_prefix="/api")

@history_bp.route("/history/eras", methods=["GET"])
def get_eras():
    eras = history_service.get_eras(status="ACTIVE")
    return api_response(eras)

@history_bp.route("/history/eras/<era_id>", methods=["GET"])
def get_era(era_id):
    try:
        era = history_service.get_era_by_id(era_id)
        return api_response(era.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@history_bp.route("/history/places", methods=["GET"])
def get_places():
    classification = request.args.get("classification")
    places = history_service.get_places(classification=classification, status="ACTIVE")
    return api_response(places)

@history_bp.route("/admin/history/eras", methods=["GET"])
@require_admin
def admin_get_eras():
    status = request.args.get("status", "ALL")
    eras = history_service.get_eras(status=status)
    return api_response(eras)

@history_bp.route("/admin/history/eras", methods=["POST"])
@require_admin
def admin_create_era():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        era = history_service.create_era(data, admin_email=admin_email, ip=ip)
        return api_response(era.to_dict(), message="Historical era created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@history_bp.route("/admin/history/eras/<era_id>", methods=["PUT"])
@require_admin
def admin_update_era(era_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        era = history_service.update_era(era_id, data, admin_email=admin_email, ip=ip)
        return api_response(era.to_dict(), message="Historical era updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@history_bp.route("/admin/history/places", methods=["POST"])
@require_admin
def admin_create_place():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        place = history_service.create_place(data, admin_email=admin_email, ip=ip)
        return api_response(place.to_dict(), message="Historical structure added successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)
