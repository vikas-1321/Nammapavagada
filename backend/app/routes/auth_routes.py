from flask import Blueprint, request
from app.services.auth_service import auth_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    ip = request.remote_addr

    try:
        result = auth_service.login(email, password, ip_address=ip)
        return api_response(result, message="Signed in successfully.")
    except (ValueError, PermissionError) as e:
        return api_error(str(e), "AUTHENTICATION_FAILED", 401)
    except Exception as e:
        return api_error("Login failed. Please try again.", "SERVER_ERROR", 500)

@auth_bp.route("/me", methods=["GET"])
@require_admin
def me():
    admin_id = request.current_admin.get("sub")
    user = auth_service.get_user_by_id(int(admin_id))
    if not user:
        return api_error("User not found.", "NOT_FOUND", 404)
    return api_response(user.to_dict())

@auth_bp.route("/logout", methods=["POST"])
@require_admin
def logout():
    return api_response(None, message="Logged out successfully.")
