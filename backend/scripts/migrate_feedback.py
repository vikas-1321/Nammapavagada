import sys
from app import create_app
from app.models import db, Feedback

app = create_app()
with app.app_context():
    db.create_all()
    has_tbl = db.inspect(db.engine).has_table("feedback")
    print(f"Feedback table in database: {has_tbl}")
    if not has_tbl:
        sys.exit(1)
