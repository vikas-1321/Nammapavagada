from flask import Blueprint, request
from app.services.tag_service import tag_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

tag_bp = Blueprint("tags", __name__, url_prefix="/api")

@tag_bp.route("/tags", methods=["GET"])
def get_tags():
    grouped = request.args.get("grouped", "false").lower() in ("true", "1", "yes")
    if grouped:
        return api_response(tag_service.get_tags_grouped())

    category = request.args.get("category")
    search_query = request.args.get("q")
    limit = int(request.args.get("limit", 200))
    tags = tag_service.get_tags(category=category, search_query=search_query, limit=limit)
    return api_response(tags)

@tag_bp.route("/tags/grouped", methods=["GET"])
def get_grouped_tags():
    return api_response(tag_service.get_tags_grouped())

@tag_bp.route("/admin/tags", methods=["POST"])
@require_admin
def create_tag():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        tag = tag_service.create_tag(data, admin_email=admin_email, ip=ip)
        return api_response(tag.to_dict(), message="Tag created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)
    except Exception as e:
        return api_error(str(e), "SERVER_ERROR", 500)
