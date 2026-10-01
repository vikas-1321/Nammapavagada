from flask import Blueprint, request
from app.services.location_service import location_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

location_bp = Blueprint("locations", __name__, url_prefix="/api")

# --- Public Endpoints ---

@location_bp.route("/locations", methods=["GET"])
def get_locations():
    category = request.args.get("category")
    search_query = request.args.get("searchQuery") or request.args.get("q")
    pdf_only = request.args.get("pdfOnly", "false").lower() in ("true", "1", "yes")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    locations, total = location_service.get_locations(
        category=category,
        search_query=search_query,
        status="ACTIVE",
        pdf_only=pdf_only,
        limit=limit,
        offset=offset,
    )
    return api_response({
        "items": locations,
        "total": total,
        "limit": limit,
        "offset": offset,
    })

@location_bp.route("/locations/<location_id>", methods=["GET"])
def get_location_by_id(location_id):
    try:
        loc = location_service.get_location_by_id(location_id, allow_any_status=False)
        return api_response(loc.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@location_bp.route("/locations/map/markers", methods=["GET"])
def get_map_markers():
    """Returns dynamic markers for Leaflet/interactive map."""
    category = request.args.get("category")
    search_query = request.args.get("q")
    markers = location_service.get_map_markers(category=category, search_query=search_query)
    return api_response(markers)

# --- Admin Endpoints ---

@location_bp.route("/admin/locations", methods=["GET"])
@require_admin
def admin_get_locations():
    category = request.args.get("category")
    search_query = request.args.get("q")
    status = request.args.get("status", "ALL")
    limit = int(request.args.get("limit", 200))
    offset = int(request.args.get("offset", 0))

    locations, total = location_service.get_locations(
        category=category,
        search_query=search_query,
        status=status,
        limit=limit,
        offset=offset,
    )
    return api_response({
        "items": locations,
        "total": total,
        "limit": limit,
        "offset": offset,
    })

@location_bp.route("/admin/locations/<location_id>", methods=["GET"])
@require_admin
def admin_get_location(location_id):
    try:
        loc = location_service.get_location_by_id(location_id, allow_any_status=True)
        return api_response(loc.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@location_bp.route("/admin/locations", methods=["POST"])
@require_admin
def admin_create_location():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.create_location(data, admin_email=admin_email, ip=ip)
        return api_response(loc.to_dict(), message="Location created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)
    except Exception as e:
        return api_error("Failed to create location.", "SERVER_ERROR", 500)

@location_bp.route("/admin/locations/<location_id>", methods=["PUT"])
@require_admin
def admin_update_location(location_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.update_location(location_id, data, admin_email=admin_email, ip=ip)
        return api_response(loc.to_dict(), message="Location updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND_OR_INVALID", 400)
    except Exception as e:
        return api_error("Failed to update location.", "SERVER_ERROR", 500)

@location_bp.route("/admin/locations/<location_id>/status", methods=["PATCH"])
@require_admin
def admin_set_location_status(location_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    if not new_status or new_status not in ("ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"):
        return api_error("Invalid status value. Must be ACTIVE, INACTIVE, DRAFT, or ARCHIVED.", "INVALID_STATUS", 400)

    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.set_status(location_id, new_status, admin_email=admin_email, ip=ip)
        return api_response(loc.to_dict(), message=f"Location status updated to {new_status}.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@location_bp.route("/admin/locations/<location_id>", methods=["DELETE"])
@require_admin
def admin_delete_location(location_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.set_status(location_id, "ARCHIVED", admin_email=admin_email, ip=ip)
        return api_response(None, message="Location archived successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
