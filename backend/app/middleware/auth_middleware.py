from functools import wraps
from flask import request, jsonify
from app.services.auth_service import auth_service

def require_admin(f):
    """
    Middleware decorator protecting administrative endpoints.
    Requires a valid 'Bearer <JWT>' token in the Authorization header.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Authorization token required. Please sign in as administrator.",
                }
            }), 401

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = auth_service.verify_token(token)
            # Attach admin info to request
            request.current_admin = payload
        except Exception as e:
            return jsonify({
                "success": False,
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": str(e),
                }
            }), 401

        return f(*args, **kwargs)

    return decorated_function

def require_roles(*allowed_roles):
    """
    Middleware decorator checking specific admin roles (e.g. 'SUPER_ADMIN', 'EDITOR').
    """
    def decorator(f):
        @wraps(f)
        @require_admin
        def decorated_function(*args, **kwargs):
            role = getattr(request, "current_admin", {}).get("role")
            if role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "FORBIDDEN",
                        "message": f"Insufficient privileges. Required role: {', '.join(allowed_roles)}.",
                    }
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
