from flask import Blueprint, request
from app.services.search_service import search_service
from app.middleware.error_handler import api_response

search_bp = Blueprint("search", __name__, url_prefix="/api")

@search_bp.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    limit = int(request.args.get("limit", 10))
    results = search_service.search_all(query, limit_per_entity=limit)
    return api_response(results)
