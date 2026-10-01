import os
from app import create_app
from app.models.base import db

app = create_app()

if __name__ == "__main__":
    # Ensure tables are created if running standalone
    with app.app_context():
        db.create_all()

    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("FLASK_ENV", "development").lower() == "development"

    print(f"==================================================")
    print(f"  Namma Pavagada Backend REST API")
    print(f"  Listening on http://{host}:{port}")
    print(f"  API Docs / Health: http://{host}:{port}/api/health")
    print(f"==================================================")

    app.run(host=host, port=port, debug=debug)
