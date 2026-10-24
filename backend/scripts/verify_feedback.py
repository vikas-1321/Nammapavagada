from app import create_app
from app.models import Feedback

app = create_app()
with app.app_context():
    items = Feedback.query.all()
    print(f"Total feedback records in RDS: {len(items)}")
    for f in items:
        print(f"[{f.id}] ({f.status}) Category: {f.category} | From: {f.name} ({f.email}) | Page: {f.page_path}")
        print(f"       Message: {f.message}")
