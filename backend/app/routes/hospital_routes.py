from flask import Blueprint, request
from app.services.hospital_service import hospital_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

hospital_bp = Blueprint("hospitals", __name__, url_prefix="/api")

@hospital_bp.route("/hospitals", methods=["GET"])
def get_hospitals():
    search_query = request.args.get("q")
    hospitals = hospital_service.get_hospitals(status="ACTIVE", search_query=search_query)
    return api_response(hospitals)

@hospital_bp.route("/hospitals/<hospital_id>", methods=["GET"])
def get_hospital(hospital_id):
    try:
        hosp = hospital_service.get_hospital_by_id(hospital_id)
        return api_response(hosp.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@hospital_bp.route("/admin/hospitals", methods=["GET"])
@require_admin
def admin_get_hospitals():
    status = request.args.get("status", "ALL")
    search_query = request.args.get("q")
    hospitals = hospital_service.get_hospitals(status=status, search_query=search_query)
    return api_response(hospitals)

@hospital_bp.route("/admin/hospitals", methods=["POST"])
@require_admin
def admin_create_hospital():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        hosp = hospital_service.create_hospital(data, admin_email=admin_email, ip=ip)
        return api_response(hosp.to_dict(), message="Hospital created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@hospital_bp.route("/admin/hospitals/<hospital_id>", methods=["PUT"])
@require_admin
def admin_update_hospital(hospital_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        hosp = hospital_service.update_hospital(hospital_id, data, admin_email=admin_email, ip=ip)
        return api_response(hosp.to_dict(), message="Hospital updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
