from flask import Flask
from flask_cors import CORS
from app.config.config import get_config
from app.models.base import db
from app.middleware.error_handler import register_error_handlers
from app.routes import register_blueprints

def create_app(config_class=None):
    """Application factory for Namma Pavagada Backend API."""
    app = Flask(__name__)

    # Load configuration
    cfg = config_class or get_config()
    app.config.from_object(cfg)

    # Enable CORS for public frontend and admin frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}}, # allow all in dev or origins list
        supports_credentials=True,
    )

    # Initialize extensions
    db.init_app(app)

    # Register error handlers and blueprints
    register_error_handlers(app)
    register_blueprints(app)

    # Add security headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

    return app
