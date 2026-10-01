from flask import jsonify

def api_response(data=None, message=None, status_code=200):
    payload = {"success": True}
    if data is not None:
        payload["data"] = data
    if message:
        payload["message"] = message
    return jsonify(payload), status_code

def api_error(message: str, code: str = "BAD_REQUEST", status_code: int = 400, details=None):
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details:
        payload["error"]["details"] = details
    return jsonify(payload), status_code

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return api_error(str(e.description) if hasattr(e, "description") else "Bad request.", "BAD_REQUEST", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return api_error("Unauthorized access.", "UNAUTHORIZED", 401)

    @app.errorhandler(403)
    def forbidden(e):
        return api_error("Permission denied.", "FORBIDDEN", 403)

    @app.errorhandler(404)
    def not_found(e):
        return api_error("Requested resource not found.", "NOT_FOUND", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return api_error("HTTP method not allowed.", "METHOD_NOT_ALLOWED", 405)

    @app.errorhandler(500)
    def internal_server_error(e):
        return api_error("An unexpected internal error occurred. Please try again later.", "INTERNAL_ERROR", 500)
