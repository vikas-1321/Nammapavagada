from flask import Blueprint, request
from app.services.bus_service import bus_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

bus_bp = Blueprint("buses", __name__, url_prefix="/api")

# --- Public Endpoints ---

@bus_bp.route("/buses/routes", methods=["GET"])
def get_routes():
    search_query = request.args.get("q")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    routes, total = bus_service.get_routes(status="ACTIVE", search_query=search_query, limit=limit, offset=offset)
    return api_response({"items": routes, "total": total})

@bus_bp.route("/buses/routes/<route_id>", methods=["GET"])
def get_route(route_id):
    try:
        route = bus_service.get_route_by_id(route_id)
        return api_response(route.to_dict(include_details=True))
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@bus_bp.route("/buses/stops", methods=["GET"])
def get_stops():
    search_query = request.args.get("q")
    stops = bus_service.get_stops(search_query=search_query, status="ACTIVE")
    return api_response(stops)

# --- Admin Route Endpoints ---

@bus_bp.route("/admin/buses/routes", methods=["GET"])
@require_admin
def admin_get_routes():
    status = request.args.get("status", "ALL")
    search_query = request.args.get("q")
    routes, total = bus_service.get_routes(status=status, search_query=search_query)
    return api_response({"items": routes, "total": total})

@bus_bp.route("/admin/buses/routes", methods=["POST"])
@require_admin
def admin_create_route():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        route = bus_service.create_route(data, admin_email=admin_email, ip=ip)
        return api_response(route.to_dict(include_details=False), message="Bus route created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@bus_bp.route("/admin/buses/routes/<route_id>", methods=["PUT"])
@require_admin
def admin_update_route(route_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        route = bus_service.update_route(route_id, data, admin_email=admin_email, ip=ip)
        return api_response(route.to_dict(include_details=False), message="Bus route updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@bus_bp.route("/admin/buses/routes/<route_id>", methods=["DELETE"])
@require_admin
def admin_delete_route(route_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        bus_service.delete_route(route_id, admin_email=admin_email, ip=ip)
        return api_response(None, message="Bus route deleted successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

# --- Admin Stop Endpoints ---

@bus_bp.route("/admin/buses/stops", methods=["POST"])
@require_admin
def admin_create_stop():
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        stop = bus_service.create_stop(data, admin_email=admin_email, ip=ip)
        return api_response(stop.to_dict(), message="Bus stop created successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@bus_bp.route("/admin/buses/stops/<stop_id>", methods=["PUT"])
@require_admin
def admin_update_stop(stop_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        stop = bus_service.update_stop(stop_id, data, admin_email=admin_email, ip=ip)
        return api_response(stop.to_dict(), message="Bus stop updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@bus_bp.route("/admin/buses/routes/<route_id>/stops", methods=["POST"])
@require_admin
def admin_add_stop_to_route(route_id):
    data = request.get_json() or {}
    stop_id = data.get("stopId") or data.get("stop_id")
    if not stop_id:
        return api_error("stopId is required.", "VALIDATION_ERROR", 400)

    seq = data.get("sequence")
    is_major = bool(data.get("isMajorStop", data.get("is_major", False)))
    estimate_mins = data.get("arrivalEstimateMinutes")
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        route_stop = bus_service.add_stop_to_route(
            route_id=route_id,
            stop_id=stop_id,
            sequence=seq,
            is_major=is_major,
            estimate_mins=estimate_mins,
            admin_email=admin_email,
            ip=ip,
        )
        return api_response(route_stop.to_dict(), message="Stop linked to route successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "BAD_REQUEST", 400)

@bus_bp.route("/admin/buses/routes/<route_id>/stops/<stop_id>", methods=["DELETE"])
@require_admin
def admin_remove_stop_from_route(route_id, stop_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        route_data = bus_service.remove_stop_from_route(route_id, stop_id, admin_email=admin_email, ip=ip)
        return api_response(route_data, message="Stop removed from route successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@bus_bp.route("/admin/buses/routes/<route_id>/stops/<stop_id>", methods=["PUT"])
@require_admin
def admin_update_route_stop(route_id, stop_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        route_data = bus_service.update_route_stop(route_id, stop_id, data, admin_email=admin_email, ip=ip)
        return api_response(route_data, message="Route stop updated successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

@bus_bp.route("/admin/buses/routes/<route_id>/reorder-stops", methods=["PUT"])
@require_admin
def admin_reorder_stops(route_id):
    data = request.get_json() or {}
    stop_ids = data.get("stopIds", [])
    if not isinstance(stop_ids, list):
        return api_error("stopIds array is required.", "VALIDATION_ERROR", 400)

    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        route_data = bus_service.reorder_route_stops(route_id, stop_ids, admin_email=admin_email, ip=ip)
        return api_response(route_data, message="Stops reordered successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)

# --- Admin Timings Endpoints ---

@bus_bp.route("/admin/buses/routes/<route_id>/timings", methods=["POST"])
@require_admin
def admin_add_timing(route_id):
    data = request.get_json() or {}
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        timing = bus_service.add_timing(route_id, data, admin_email=admin_email, ip=ip)
        return api_response(timing.to_dict(), message="Timing added successfully.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "VALIDATION_ERROR", 400)

@bus_bp.route("/admin/buses/timings/<int:timing_id>", methods=["DELETE"])
@require_admin
def admin_delete_timing(timing_id):
    admin_email = request.current_admin.get("email")
    ip = request.remote_addr

    try:
        bus_service.delete_timing(timing_id, admin_email=admin_email, ip=ip)
        return api_response(None, message="Timing deleted successfully.")
    except ValueError as e:
        return api_error(str(e), "NOT_FOUND", 404)
