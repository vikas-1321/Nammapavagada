from flask import Blueprint, request
from app.services.building_service import building_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

building_bp = Blueprint("buildings", __name__, url_prefix="/api")

# --- Map & Public Endpoints ---

@building_bp.route("/buildings", methods=["GET"])
def list_buildings():
    query = request.args.get("q") or request.args.get("searchQuery")
    building_type = request.args.get("type") or request.args.get("buildingType")
    area = request.args.get("area")
    status = request.args.get("status", "ACTIVE")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    min_lat = float(request.args.get("minLat")) if request.args.get("minLat") else None
    max_lat = float(request.args.get("maxLat")) if request.args.get("maxLat") else None
    min_lng = float(request.args.get("minLng")) if request.args.get("minLng") else None
    max_lng = float(request.args.get("maxLng")) if request.args.get("maxLng") else None

    items, total = building_service.list_buildings(
        query=query,
        building_type=building_type,
        area=area,
        status=status,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lng=min_lng,
        max_lng=max_lng,
        limit=limit,
        offset=offset,
    )
    return api_response({
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    })

@building_bp.route("/buildings/map/markers", methods=["GET"])
def get_building_markers():
    building_type = request.args.get("type") or request.args.get("buildingType")
    query = request.args.get("q")
    markers = building_service.get_map_markers(building_type=building_type, query=query)
    return api_response(markers)

@building_bp.route("/buildings/<building_id>", methods=["GET"])
def get_building(building_id):
    try:
        bld = building_service.get_building_by_id(building_id, include_children=True)
        return api_response(bld.to_dict(include_children=True))
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

# --- Proximity & Duplicate Check ---

@building_bp.route("/buildings/check-duplicate", methods=["POST"])
@require_admin
def check_duplicate():
    data = request.get_json() or {}
    lat = data.get("latitude")
    lng = data.get("longitude")
    if lat is None or lng is None:
        return api_error("latitude and longitude are required", "INVALID_INPUT", 400)

    name = data.get("name")
    radius = float(data.get("radiusMeters", 50.0))

    result = building_service.check_duplicate_building(
        lat=float(lat),
        lng=float(lng),
        name=name,
        radius_meters=radius,
    )
    return api_response(result)

# --- Admin / Surveyor Mutation Endpoints ---

@building_bp.route("/buildings", methods=["POST"])
@building_bp.route("/admin/buildings", methods=["POST"])
@require_admin
def create_building():
    data = request.get_json() or {}
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    try:
        building = building_service.create_building(data, admin_id=admin_id, admin_name=admin_name)
        return api_response(building.to_dict(include_children=True), status_code=201)
    except Exception as e:
        return api_error(str(e), "CREATE_FAILED", 400)

@building_bp.route("/buildings/<building_id>", methods=["PUT", "PATCH"])
@building_bp.route("/admin/buildings/<building_id>", methods=["PUT", "PATCH"])
@require_admin
def update_building(building_id):
    data = request.get_json() or {}
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    try:
        building = building_service.update_building(building_id, data, admin_id=admin_id, admin_name=admin_name)
        return api_response(building.to_dict(include_children=True))
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
    except Exception as e:
        return api_error(str(e), "UPDATE_FAILED", 400)

@building_bp.route("/buildings/<building_id>", methods=["DELETE"])
@building_bp.route("/admin/buildings/<building_id>", methods=["DELETE"])
@require_admin
def delete_building(building_id):
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    # Default to safe archive workflow
    archive_param = request.args.get("archive", "true").lower()
    archive_only = archive_param not in ("false", "0", "no")
    force = request.args.get("force", "false").lower() in ("true", "1", "yes")

    try:
        res = building_service.delete_building(
            building_id,
            admin_id=admin_id,
            admin_name=admin_name,
            archive_only=archive_only,
            force=force,
        )
        return api_response(res)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            return api_error(msg, "NOT_FOUND", 404)
        return api_error(msg, "DELETE_CONFLICT", 409)

# --- Floor & Unit Sub-resources ---

@building_bp.route("/buildings/<building_id>/floors", methods=["POST"])
@require_admin
def add_floor(building_id):
    data = request.get_json() or {}
    try:
        floor = building_service.add_floor(building_id, data)
        return api_response(floor.to_dict(include_units=True), status_code=201)
    except Exception as e:
        return api_error(str(e), "ADD_FLOOR_FAILED", 400)

@building_bp.route("/buildings/<building_id>/floors/<floor_id>/units", methods=["POST"])
@require_admin
def add_unit(building_id, floor_id):
    data = request.get_json() or {}
    try:
        unit = building_service.add_unit(building_id, floor_id, data)
        return api_response(unit.to_dict(include_business=True), status_code=201)
    except Exception as e:
        return api_error(str(e), "ADD_UNIT_FAILED", 400)

@building_bp.route("/buildings/<building_id>/photos", methods=["POST"])
@require_admin
def add_building_photo(building_id):
    data = request.get_json() or {}
    url = data.get("url")
    if not url:
        return api_error("Photo URL is required", "INVALID_INPUT", 400)

    admin_info = getattr(request, "current_admin", {})
    admin_name = admin_info.get("email", "Admin")

    try:
        photo = building_service.add_photo(
            building_id=building_id,
            photo_url=url,
            photo_type=data.get("photoType", "Front View"),
            caption=data.get("caption"),
            is_primary=bool(data.get("isPrimary", False)),
            surveyor_name=admin_name,
        )
        return api_response(photo.to_dict(), status_code=201)
    except Exception as e:
        return api_error(str(e), "ADD_PHOTO_FAILED", 400)
