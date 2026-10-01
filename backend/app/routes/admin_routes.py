from flask import Blueprint, request
from app.models.base import db
from app.models.location import Location
from app.models.bus_route import BusRoute
from app.models.bus_stop import BusStop
from app.models.hospital import Hospital
from app.models.education import EducationalInstitution
from app.models.theatre import Theatre
from app.models.historical_place import HistoricalPlace
from app.models.photo import Photo
from app.models.admin_user import AdminUser
from app.services.audit_service import audit_service
from app.services.photo_service import photo_service
from app.services.auth_service import auth_service
from app.middleware.auth_middleware import require_admin, require_roles
from app.middleware.error_handler import api_response, api_error

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/overview", methods=["GET"])
@require_admin
def get_overview():
    # Counts
    total_locations = Location.query.count()
    active_locations = Location.query.filter_by(status="ACTIVE").count()
    draft_locations = Location.query.filter_by(status="DRAFT").count()

    total_bus_routes = BusRoute.query.count()
    total_bus_stops = BusStop.query.count()
    total_hospitals = Hospital.query.count()
    total_schools = EducationalInstitution.query.filter_by(institution_type="SCHOOL").count()
    total_colleges = EducationalInstitution.query.filter(EducationalInstitution.institution_type != "SCHOOL").count()
    total_theatres = Theatre.query.count()
    total_historical_places = HistoricalPlace.query.count()
    total_photos = Photo.query.filter_by(status="ACTIVE").count()

    # Missing photos count from workflow
    photo_requests = photo_service.get_missing_photo_requests()
    incomplete_photos_count = sum(1 for r in photo_requests if not r["isComplete"])

    # Recent locations
    recent_locations = (
        Location.query.order_by(Location.created_at.desc())
        .limit(5)
        .all()
    )

    # Recent audit activities
    recent_logs, _ = audit_service.get_logs(limit=10)

    return api_response({
        "statistics": {
            "totalLocations": total_locations,
            "activeLocations": active_locations,
            "draftLocations": draft_locations,
            "totalBusRoutes": total_bus_routes,
            "totalBusStops": total_bus_stops,
            "totalHospitals": total_hospitals,
            "totalSchools": total_schools,
            "totalColleges": total_colleges,
            "totalTheatres": total_theatres,
            "totalHistoricalPlaces": total_historical_places,
            "totalPhotos": total_photos,
            "missingPhotosCount": incomplete_photos_count,
        },
        "recentLocations": [loc.to_dict() for loc in recent_locations],
        "recentActivities": recent_logs,
    })

@admin_bp.route("/audit-logs", methods=["GET"])
@require_admin
def get_audit_logs():
    entity_type = request.args.get("entityType")
    entity_id = request.args.get("entityId")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    logs, total = audit_service.get_logs(
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
        offset=offset,
    )
    return api_response({"items": logs, "total": total, "limit": limit, "offset": offset})

@admin_bp.route("/users", methods=["GET"])
@require_roles("SUPER_ADMIN")
def get_admin_users():
    users = AdminUser.query.order_by(AdminUser.created_at.desc()).all()
    return api_response([u.to_dict() for u in users])

@admin_bp.route("/users", methods=["POST"])
@require_roles("SUPER_ADMIN")
def create_admin_user():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("fullName") or data.get("full_name")
    role = data.get("role", "EDITOR")

    if not email or not password or not full_name:
        return api_error("Email, password, and full name are required.", "VALIDATION_ERROR", 400)

    creator = request.current_admin.get("email")
    try:
        user = auth_service.create_admin(email, password, full_name, role=role, creator_email=creator)
        return api_response(user.to_dict(), message="Admin user created.", status_code=201)
    except ValueError as e:
        return api_error(str(e), "CONFLICT", 409)

@admin_bp.route("/users/<int:user_id>/toggle-status", methods=["PATCH"])
@require_roles("SUPER_ADMIN")
def toggle_user_status(user_id):
    user = AdminUser.query.get(user_id)
    if not user:
        return api_error("User not found.", "NOT_FOUND", 404)

    # Protect self from deactivation
    curr_id = int(request.current_admin.get("sub"))
    if user.id == curr_id:
        return api_error("Cannot deactivate your own active account.", "FORBIDDEN", 403)

    user.is_active = not user.is_active
    db.session.commit()

    admin_email = request.current_admin.get("email")
    audit_service.log_action(
        admin_email=admin_email,
        action="UPDATE",
        entity_type="AdminUser",
        entity_id=str(user.id),
        new_values={"is_active": user.is_active},
        ip_address=request.remote_addr,
    )

    return api_response(user.to_dict(), message=f"Admin account is now {'active' if user.is_active else 'deactivated'}.")
