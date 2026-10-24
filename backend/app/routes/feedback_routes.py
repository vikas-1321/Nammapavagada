from flask import Blueprint, request
from app.services.feedback_service import feedback_service
from app.middleware.auth_middleware import require_admin
from app.middleware.error_handler import api_response, api_error

feedback_bp = Blueprint("feedback", __name__)

def get_client_ip():
    """Extract real client IP considering proxies and load balancers."""
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.remote_addr or ""

# ---------------------------------------------------------------------------
# Public Feedback Submission API
# ---------------------------------------------------------------------------
@feedback_bp.route("/api/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return api_error("Invalid request body. Expected JSON object.", "INVALID_JSON", 400)

    ip_address = get_client_ip()
    user_agent = request.headers.get("User-Agent", "")

    feedback, err_msg, status_code = feedback_service.submit_feedback(
        data=data,
        ip_address=ip_address,
        user_agent=user_agent
    )

    if err_msg:
        code = "RATE_LIMITED" if status_code == 429 else "VALIDATION_ERROR"
        return api_error(err_msg, code, status_code)

    # Return public representation (exclude internal admin notes)
    response_data = feedback.to_dict(include_admin=False) if hasattr(feedback, "to_dict") else feedback
    return api_response(
        data=response_data,
        message="Thank you for helping us improve Namma Pavagada! Your feedback has been submitted successfully.",
        status_code=status_code
    )

# ---------------------------------------------------------------------------
# Administrative Feedback Management APIs
# ---------------------------------------------------------------------------
@feedback_bp.route("/api/admin/feedback", methods=["GET"])
@require_admin
def list_feedback():
    page = request.args.get("page", 1, type=int)
    limit = min(request.args.get("limit", 20, type=int), 100)
    status = request.args.get("status")
    category = request.args.get("category")
    search = request.args.get("search")
    start_date = request.args.get("startDate") or request.args.get("start_date")
    end_date = request.args.get("endDate") or request.args.get("end_date")

    result = feedback_service.get_feedback_list(
        page=page,
        limit=limit,
        status=status,
        category=category,
        search=search,
        start_date=start_date,
        end_date=end_date
    )
    return api_response(result)

@feedback_bp.route("/api/admin/feedback/<feedback_id>", methods=["GET"])
@require_admin
def get_feedback_detail(feedback_id):
    feedback = feedback_service.get_feedback_by_id(feedback_id)
    if not feedback:
        return api_error("Feedback not found.", "NOT_FOUND", 404)
    return api_response(feedback.to_dict(include_admin=True))

@feedback_bp.route("/api/admin/feedback/<feedback_id>", methods=["PATCH"])
@require_admin
def update_feedback(feedback_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    admin_notes = data.get("adminNotes") if "adminNotes" in data else data.get("admin_notes")

    current_admin = getattr(request, "current_admin", {})
    admin_email = current_admin.get("email", "admin@nammapavagada.in")
    admin_id = current_admin.get("sub") or current_admin.get("id")
    ip_address = get_client_ip()

    feedback, err_msg, status_code = feedback_service.update_feedback(
        feedback_id=feedback_id,
        status=status,
        admin_notes=admin_notes,
        admin_email=admin_email,
        admin_id=admin_id,
        ip_address=ip_address
    )

    if err_msg:
        return api_error(err_msg, "UPDATE_FAILED", status_code)

    return api_response(
        feedback.to_dict(include_admin=True),
        "Feedback entry updated successfully."
    )

@feedback_bp.route("/api/admin/feedback/<feedback_id>", methods=["DELETE"])
@require_admin
def delete_feedback(feedback_id):
    current_admin = getattr(request, "current_admin", {})
    admin_email = current_admin.get("email", "admin@nammapavagada.in")
    admin_id = current_admin.get("sub") or current_admin.get("id")
    ip_address = get_client_ip()

    success, err_msg, status_code = feedback_service.delete_feedback(
        feedback_id=feedback_id,
        admin_email=admin_email,
        admin_id=admin_id,
        ip_address=ip_address
    )

    if err_msg:
        return api_error(err_msg, "DELETE_FAILED", status_code)

    return api_response(None, "Feedback entry deleted successfully.")
