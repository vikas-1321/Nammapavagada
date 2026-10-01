from flask import Blueprint, request
from app.services.education_service import education_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

education_bp = Blueprint("education", __name__, url_prefix="/api")

@education_bp.route("/schools", methods=["GET"])
def get_schools():
    search_query = request.args.get("q")
    items = education_service.get_institutions(inst_type="SCHOOL", status="ACTIVE", search_query=search_query)
    return api_response(items)

@education_bp.route("/colleges", methods=["GET"])
def get_colleges():
    search_query = request.args.get("q")
    # Returns colleges, polytechnics, PU colleges
    items = education_service.get_institutions(status="ACTIVE", search_query=search_query)
    colleges = [i for i in items if i.get("institutionType") != "SCHOOL"]
    return api_response(colleges)

@education_bp.route("/education/<inst_id>", methods=["GET"])
def get_institution(inst_id):
    try:
        inst = education_service.get_institution_by_id(inst_id)
        return api_response(inst.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@education_bp.route("/admin/schools", methods=["GET"])
@require_admin
def admin_get_schools():
    status = request.args.get("status", "ALL")
    search_query = request.args.get("q")
    items = education_service.get_institutions(inst_type="SCHOOL", status=status, search_query=search_query)
    return api_response(items)

@education_bp.route("/admin/colleges", methods=["GET"])
@require_admin
def admin_get_colleges():
    status = request.args.get("status", "ALL")
    search_query = request.args.get("q")
    items = education_service.get_institutions(status=status, search_query=search_query)
    colleges = [i for i in items if i.get("institutionType") != "SCHOOL"]
    return api_response(colleges)

@education_bp.route("/admin/education", methods=["POST"])
@require_admin
def admin_create_institution():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        inst = education_service.create_institution(data, admin_email=admin_email, ip=ip)
        return api_response(inst.to_dict(), message="Institution created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@education_bp.route("/admin/education/<inst_id>", methods=["PUT"])
@require_admin
def admin_update_institution(inst_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        inst = education_service.update_institution(inst_id, data, admin_email=admin_email, ip=ip)
        return api_response(inst.to_dict(), message="Institution updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
