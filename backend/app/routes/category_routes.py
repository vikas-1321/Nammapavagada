from flask import Blueprint, request
from app.models.base import db
from app.models.category import Category
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error
from app.services.audit_service import audit_service

category_bp = Blueprint("categories", __name__, url_prefix="/api")

@category_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.display_order.asc(), Category.name.asc()).all()
    return api_response([c.to_dict() for c in categories])

@category_bp.route("/categories/<category_id>", methods=["GET"])
def get_category(category_id):
    cat = Category.query.get(category_id)
    if not cat:
        return api_error(f"Category '{category_id}' not found.", "NOT_FOUND", 404)
    return api_response(cat.to_dict())

@category_bp.route("/admin/categories", methods=["POST"])
@require_admin
def create_category():
    data = request.get_json() or {}
    cat_id = data.get("id", "").strip().upper()
    name = data.get("name", "").strip()
    if not cat_id or not name:
        return api_error("Category ID and name are required.", "VALIDATION_ERROR", 400)

    if Category.query.get(cat_id):
        return api_error(f"Category '{cat_id}' already exists.", "CONFLICT", 409)

    cat = Category(
        id=cat_id,
        name=name,
        short_code=data.get("shortCode", cat_id[:4]),
        badge_color_class=data.get("badgeColorClass", "bg-forest-green text-white"),
        border_class=data.get("borderClass", "border-forest-green"),
        description=data.get("description", ""),
        is_future_module=bool(data.get("isFutureModule", False)),
        display_order=int(data.get("displayOrder", 0)),
        status=data.get("status", "ACTIVE"),
    )
    db.session.add(cat)
    db.session.commit()

    admin_email = request.current_admin.get("email")
    audit_service.log_action(
        admin_email=admin_email,
        action="CREATE",
        entity_type="Category",
        entity_id=cat.id,
        new_values=cat.to_dict(),
        ip_address=request.remote_addr,
    )

    return api_response(cat.to_dict(), message="Category created.", status_code=201)

@category_bp.route("/admin/categories/<category_id>", methods=["PUT"])
@require_admin
def update_category(category_id):
    cat = Category.query.get(category_id)
    if not cat:
        return api_error(f"Category '{category_id}' not found.", "NOT_FOUND", 404)

    data = request.get_json() or {}
    old_val = cat.to_dict()

    if "name" in data:
        cat.name = data["name"].strip()
    if "shortCode" in data:
        cat.short_code = data["shortCode"].strip()
    if "badgeColorClass" in data:
        cat.badge_color_class = data["badgeColorClass"]
    if "borderClass" in data:
        cat.border_class = data["borderClass"]
    if "description" in data:
        cat.description = data["description"]
    if "isFutureModule" in data:
        cat.is_future_module = bool(data["isFutureModule"])
    if "displayOrder" in data:
        cat.display_order = int(data["displayOrder"])
    if "status" in data:
        cat.status = data["status"]

    db.session.commit()

    admin_email = request.current_admin.get("email")
    audit_service.log_action(
        admin_email=admin_email,
        action="UPDATE",
        entity_type="Category",
        entity_id=cat.id,
        old_values=old_val,
        new_values=cat.to_dict(),
        ip_address=request.remote_addr,
    )

    return api_response(cat.to_dict(), message="Category updated.")
