from app.routes.auth_routes import auth_bp
from app.routes.category_routes import category_bp
from app.routes.location_routes import location_bp
from app.routes.bus_routes import bus_bp
from app.routes.hospital_routes import hospital_bp
from app.routes.education_routes import education_bp
from app.routes.theatre_routes import theatre_bp
from app.routes.history_routes import history_bp
from app.routes.photo_routes import photo_bp
from app.routes.search_routes import search_bp
from app.routes.admin_routes import admin_bp
from app.routes.health_routes import health_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(bus_bp)
    app.register_blueprint(hospital_bp)
    app.register_blueprint(education_bp)
    app.register_blueprint(theatre_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(photo_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(health_bp)
