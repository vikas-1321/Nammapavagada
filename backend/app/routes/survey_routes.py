from flask import Blueprint, request
from app.services.survey_gamification_service import survey_gamification_service
from app.services.building_service import building_service
from app.services.business_service import business_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

survey_bp = Blueprint("survey", __name__, url_prefix="/api/survey")

@survey_bp.route("/dashboard-stats", methods=["GET"])
@require_admin
def get_dashboard_stats():
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    stats = survey_gamification_service.get_dashboard_stats(admin_id=admin_id)
    return api_response(stats)

@survey_bp.route("/profile", methods=["GET"])
@require_admin
def get_surveyor_profile():
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Surveyor")
    if not admin_id:
        return api_error("Admin identity not recognized", "UNAUTHORIZED", 401)

    profile = survey_gamification_service.get_or_create_profile(admin_id, admin_name)
    return api_response(profile.to_dict())

@survey_bp.route("/bulk-sync", methods=["POST"])
@require_admin
def bulk_sync_surveys():
    """
    Offline sync endpoint: Accepts batches of offline building and business drafts.
    Reconciles temporary client IDs to server IDs and commits transactions safely.
    """
    payload = request.get_json() or {}
    admin_info = getattr(request, "current_admin", {})
    admin_id = int(admin_info.get("sub")) if admin_info.get("sub") else None
    admin_name = admin_info.get("email", "Admin")

    buildings_data = payload.get("buildings") or []
    businesses_data = payload.get("businesses") or []

    id_mapping = {} # client_id -> server_id
    synced_buildings = []
    synced_businesses = []
    errors = []

    # 1. Sync buildings first
    for b_item in buildings_data:
        client_bld_id = b_item.get("id") or b_item.get("clientDraftId")
        try:
            # Check if building with this ID or Code already exists
            existing = None
            if b_item.get("id") and not b_item.get("id").startswith("draft_"):
                from app.models.building import Building
                existing = Building.query.get(b_item["id"])

            if existing:
                b = building_service.update_building(existing.id, b_item, admin_id=admin_id, admin_name=admin_name)
                server_id = b.id
            else:
                # Remove client-side draft ID if it was temporary
                if client_bld_id and client_bld_id.startswith("draft_"):
                    b_item.pop("id", None)
                b = building_service.create_building(b_item, admin_id=admin_id, admin_name=admin_name)
                server_id = b.id

            if client_bld_id:
                id_mapping[client_bld_id] = server_id

            synced_buildings.append({
                "clientDraftId": client_bld_id,
                "serverId": server_id,
                "code": b.code,
                "name": b.name,
            })
        except Exception as e:
            errors.append({"entity": "Building", "clientDraftId": client_bld_id, "error": str(e)})

    # 2. Sync businesses (reconciling buildingId and floorId/unitId)
    for biz_item in businesses_data:
        client_biz_id = biz_item.get("id") or biz_item.get("clientDraftId")
        # Reconcile buildingId if it was a draft ID
        orig_bld_id = biz_item.get("buildingId") or biz_item.get("building_id")
        if orig_bld_id in id_mapping:
            biz_item["buildingId"] = id_mapping[orig_bld_id]

        try:
            existing = None
            if biz_item.get("id") and not biz_item.get("id").startswith("draft_"):
                from app.models.business import Business
                existing = Business.query.get(biz_item["id"])

            if existing:
                biz = business_service.update_business(existing.id, biz_item, admin_id=admin_id, admin_name=admin_name)
                server_id = biz.id
            else:
                if client_biz_id and client_biz_id.startswith("draft_"):
                    biz_item.pop("id", None)
                biz = business_service.create_business(biz_item, admin_id=admin_id, admin_name=admin_name)
                server_id = biz.id

            if client_biz_id:
                id_mapping[client_biz_id] = server_id

            synced_businesses.append({
                "clientDraftId": client_biz_id,
                "serverId": server_id,
                "name": biz.name,
                "buildingId": biz.building_id,
            })
        except Exception as e:
            errors.append({"entity": "Business", "clientDraftId": client_biz_id, "error": str(e)})

    return api_response({
        "success": len(errors) == 0,
        "syncedBuildingsCount": len(synced_buildings),
        "syncedBusinessesCount": len(synced_businesses),
        "syncedBuildings": synced_buildings,
        "syncedBusinesses": synced_businesses,
        "idMapping": id_mapping,
        "errors": errors,
    })

