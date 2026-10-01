from flask import Blueprint, request
from app.services.theatre_service import theatre_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

theatre_bp = Blueprint("theatres", __name__, url_prefix="/api")

@theatre_bp.route("/theatres", methods=["GET"])
def get_theatres():
    search_query = request.args.get("q")
    theatres = theatre_service.get_theatres(status="ACTIVE", search_query=search_query)
    return api_response(theatres)

@theatre_bp.route("/theatres/<theatre_id>", methods=["GET"])
def get_theatre(theatre_id):
    try:
        th = theatre_service.get_theatre_by_id(theatre_id)
        return api_response(th.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@theatre_bp.route("/admin/theatres", methods=["GET"])
@require_admin
def admin_get_theatres():
    status = request.args.get("status", "ALL")
    search_query = request.args.get("q")
    theatres = theatre_service.get_theatres(status=status, search_query=search_query)
    return api_response(theatres)

@theatre_bp.route("/admin/theatres", methods=["POST"])
@require_admin
def admin_create_theatre():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        theatre = theatre_service.create_theatre(data, admin_email=admin_email, ip=ip)
        return api_response(theatre.to_dict(), message="Theatre added successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@theatre_bp.route("/admin/theatres/<theatre_id>", methods=["PUT"])
@require_admin
def admin_update_theatre(theatre_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        theatre = theatre_service.update_theatre(theatre_id, data, admin_email=admin_email, ip=ip)
        return api_response(theatre.to_dict(), message="Theatre updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
