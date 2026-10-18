from flask import Blueprint, request
from app.services.location_service import location_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

location_bp = Blueprint("locations", __name__, url_prefix="/api")

# --- Public Endpoints ---

@location_bp.route("/locations", methods=["GET"])
@location_bp.route("/places", methods=["GET"])
def get_locations():
    category = request.args.get("category")
    subcategory = request.args.get("subcategory")
    area = request.args.get("area")
    tags = request.args.get("tags")
    search_query = request.args.get("searchQuery") or request.args.get("q")
    pdf_only = request.args.get("pdfOnly", "false").lower() in ("true", "1", "yes")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    locations, total = location_service.get_locations(
        category=category,
        subcategory=subcategory,
        area=area,
        tags=tags,
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
@location_bp.route("/places/<location_id>", methods=["GET"])
def get_location_by_id(location_id):
    try:
        loc = location_service.get_location_by_id(location_id, allow_any_status=False)
        return api_response(loc.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@location_bp.route("/locations/map/markers", methods=["GET"])
@location_bp.route("/places/map/markers", methods=["GET"])
def get_map_markers():
    """Returns dynamic markers for Leaflet/interactive map."""
    category = request.args.get("category")
    search_query = request.args.get("q")
    markers = location_service.get_map_markers(category=category, search_query=search_query)
    return api_response(markers)

# --- Admin Endpoints ---

@location_bp.route("/admin/locations", methods=["GET"])
@location_bp.route("/admin/places", methods=["GET"])
@require_admin
def admin_get_locations():
    category = request.args.get("category")
    subcategory = request.args.get("subcategory")
    area = request.args.get("area")
    tags = request.args.get("tags")
    verification_status = request.args.get("verification") or request.args.get("verificationStatus")
    needs_verification = request.args.get("needsVerification", "false").lower() in ("true", "1", "yes")
    search_query = request.args.get("q") or request.args.get("searchQuery")
    status = request.args.get("status", "ALL")
    limit = int(request.args.get("limit", 200))
    offset = int(request.args.get("offset", 0))

    locations, total = location_service.get_locations(
        category=category,
        subcategory=subcategory,
        area=area,
        tags=tags,
        search_query=search_query,
        status=status,
        verification_status=verification_status,
        needs_verification=needs_verification,
        limit=limit,
        offset=offset,
    )
    return api_response({
        "items": locations,
        "total": total,
        "limit": limit,
        "offset": offset,
    })

@location_bp.route("/admin/locations/check-duplicate", methods=["GET"])
@location_bp.route("/admin/places/check-duplicate", methods=["GET"])
@require_admin
def admin_check_duplicate():
    name = request.args.get("name", "")
    category_id = request.args.get("category")
    area = request.args.get("area")
    exclude_id = request.args.get("excludeId")

    duplicates = location_service.check_duplicate(
        name=name,
        category_id=category_id,
        area=area,
        exclude_id=exclude_id,
    )
    return api_response({
        "hasDuplicates": len(duplicates) > 0,
        "duplicates": duplicates,
    })

@location_bp.route("/admin/locations/freshness", methods=["GET"])
@location_bp.route("/admin/places/freshness", methods=["GET"])
@require_admin
def admin_get_freshness():
    stats = location_service.get_data_freshness_stats()
    return api_response(stats)

@location_bp.route("/admin/locations/<location_id>/verify", methods=["POST"])
@location_bp.route("/admin/places/<location_id>/verify", methods=["POST"])
@require_admin
def admin_verify_location(location_id):
    data = request.get_json() or {}
    status = data.get("status", "VERIFIED")
    source = data.get("source", "Admin Verification")
    verified_by = data.get("verifiedBy") or request.current_admin.get("email")
    notes = data.get("notes", "")
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.verify_location(
            location_id=location_id,
            verification_status=status,
            source=source,
            verified_by=verified_by,
            notes=notes,
            admin_email=admin_email,
            ip=ip,
        )
        return api_response(loc.to_dict(), message="Record verified successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
    except Exception as e:
        return api_error(str(e), "SERVER_ERROR", 500)

@location_bp.route("/admin/locations/<location_id>/duplicate", methods=["POST"])
@location_bp.route("/admin/places/<location_id>/duplicate", methods=["POST"])
@require_admin
def admin_duplicate_location(location_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.duplicate_location(location_id, admin_email=admin_email, ip=ip)
        return api_response(loc.to_dict(), message="Location duplicated as draft.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
    except Exception as e:
        return api_error(str(e), "SERVER_ERROR", 500)

@location_bp.route("/admin/locations/<location_id>", methods=["GET"])
@location_bp.route("/admin/places/<location_id>", methods=["GET"])
@require_admin
def admin_get_location(location_id):
    try:
        loc = location_service.get_location_by_id(location_id, allow_any_status=True)
        return api_response(loc.to_dict())
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@location_bp.route("/admin/locations", methods=["POST"])
@location_bp.route("/admin/places", methods=["POST"])
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
        return api_error(f"Failed to create location: {str(e)}", "SERVER_ERROR", 500)

@location_bp.route("/admin/locations/<location_id>", methods=["PUT"])
@location_bp.route("/admin/places/<location_id>", methods=["PUT"])
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
        return api_error(f"Failed to update location: {str(e)}", "SERVER_ERROR", 500)

@location_bp.route("/admin/locations/<location_id>/status", methods=["PATCH"])
@location_bp.route("/admin/places/<location_id>/status", methods=["PATCH"])
@require_admin
def admin_set_location_status(location_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    valid_statuses = ("ACTIVE", "PUBLISHED", "INACTIVE", "DRAFT", "ARCHIVED", "TEMPORARILY_CLOSED")
    if not new_status or new_status not in valid_statuses:
        return api_error(f"Invalid status value. Must be one of {valid_statuses}.", "INVALID_STATUS", 400)

    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.set_status(location_id, new_status, admin_email=admin_email, ip=ip)
        return api_response(loc.to_dict(), message=f"Location status updated to {new_status}.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@location_bp.route("/admin/locations/<location_id>", methods=["DELETE"])
@location_bp.route("/admin/places/<location_id>", methods=["DELETE"])
@require_admin
def admin_delete_location(location_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        loc = location_service.set_status(location_id, "ARCHIVED", admin_email=admin_email, ip=ip)
        return api_response(None, message="Location archived successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
