from flask import Blueprint, request
from app.services.business_service import business_service
from app.services.auth_service import auth_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

business_bp = Blueprint("businesses", __name__, url_prefix="/api")

def is_caller_admin() -> bool:
    """Helper to detect if request carries valid admin authorization token."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        try:
            auth_service.verify_token(token)
            return True
        except Exception:
            return False
    return False

# --- Public / Directory Endpoints ---

@business_bp.route("/businesses", methods=["GET"])
def list_businesses():
    building_id = request.args.get("buildingId") or request.args.get("building_id")
    category_id = request.args.get("categoryId") or request.args.get("category_id")
    subcategory = request.args.get("subcategory")
    query = request.args.get("q") or request.args.get("searchQuery")
    status = request.args.get("status", "ACTIVE")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    has_admin = is_caller_admin()

    items, total = business_service.list_businesses(
        building_id=building_id,
        category_id=category_id,
        subcategory=subcategory,
        query=query,
        status=status,
        limit=limit,
        offset=offset,
        include_restricted=has_admin,
    )
    return api_response({
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    })

@business_bp.route("/businesses/<business_id>", methods=["GET"])
def get_business(business_id):
    has_admin = is_caller_admin()
    try:
        biz = business_service.get_business_by_id(
            business_id,
            include_restricted=has_admin,
            include_children=True
        )
        return api_response(biz.to_dict(include_restricted=has_admin, include_children=True))
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

# --- Admin Mutation Endpoints ---

@business_bp.route("/businesses", methods=["POST"])
@business_bp.route("/admin/businesses", methods=["POST"])
@require_admin
def create_business():
    data = request.get_json() or {}
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    try:
        biz = business_service.create_business(data, admin_id=admin_id, admin_name=admin_name)
        return api_response(biz.to_dict(include_restricted=True, include_children=True), status_code=201)
    except Exception as e:
        return api_error(str(e), "CREATE_FAILED", 400)

@business_bp.route("/businesses/<business_id>", methods=["PUT", "PATCH"])
@business_bp.route("/admin/businesses/<business_id>", methods=["PUT", "PATCH"])
@require_admin
def update_business(business_id):
    data = request.get_json() or {}
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    try:
        biz = business_service.update_business(business_id, data, admin_id=admin_id, admin_name=admin_name)
        return api_response(biz.to_dict(include_restricted=True, include_children=True))
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
    except Exception as e:
        return api_error(str(e), "UPDATE_FAILED", 400)

@business_bp.route("/businesses/<business_id>", methods=["DELETE"])
@business_bp.route("/admin/businesses/<business_id>", methods=["DELETE"])
@require_admin
def delete_business(business_id):
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    archive_param = request.args.get("archive", "true").lower()
    archive_only = archive_param not in ("false", "0", "no")

    try:
        res = business_service.delete_business(
            business_id,
            admin_id=admin_id,
            admin_name=admin_name,
            archive_only=archive_only,
        )
        return api_response(res)
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

# --- Products & Footfall Observations ---

@business_bp.route("/businesses/<business_id>/products", methods=["POST"])
@require_admin
def add_product(business_id):
    data = request.get_json() or {}
    try:
        prod = business_service.add_product(business_id, data)
        return api_response(prod.to_dict(), status_code=201)
    except Exception as e:
        return api_error(str(e), "ADD_PRODUCT_FAILED", 400)

@business_bp.route("/businesses/<business_id>/footfall", methods=["POST"])
@require_admin
def add_footfall(business_id):
    data = request.get_json() or {}
    admin_info = getattr(request, "current_admin", {})
    admin_name = admin_info.get("email", "Admin")
    try:
        obs = business_service.add_footfall_observation(business_id, data, surveyor_name=admin_name)
        return api_response(obs.to_dict(), status_code=201)
    except Exception as e:
        return api_error(str(e), "ADD_FOOTFALL_FAILED", 400)
