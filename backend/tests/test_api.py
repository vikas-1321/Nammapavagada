import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import json
from app import create_app
from app.config.config import Config
from app.models.base import db
from app.models.admin_user import AdminUser
from app.models.location import Location
from app.models.category import Category
from app.models.bus_route import BusRoute
from app.models.bus_stop import BusStop
from app.models.bus_timing import BusTiming
from app.models.audit_log import AuditLog

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret-key-123"

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()

        # Seed minimal required category & admin
        admin = AdminUser(email="testadmin@pavagada.com", full_name="Test Admin", role="SUPER_ADMIN")
        admin.set_password("AdminPass@123")
        db.session.add(admin)

        cat = Category(
            id="FORT_HERITAGE",
            name="Fort Heritage",
            short_code="FORT",
            badge_color_class="bg-earth-brown text-white",
            border_class="border-earth-brown",
        )
        db.session.add(cat)

        loc = Location(
            id="test-fort-apex",
            code="PVG-TEST-01",
            name="Pavagada Test Fort",
            category_id="FORT_HERITAGE",
            summary="A historic defense fort",
            address="Fort Hill, Pavagada",
            latitude=14.1025,
            longitude=77.2798,
            status="ACTIVE",
        )
        db.session.add(loc)

        route = BusRoute(
            id="test-route-1",
            route_code="TEST-01",
            source="Pavagada",
            destination="Bengaluru",
            status="ACTIVE",
        )
        db.session.add(route)

        db.session.commit()

        with app.test_client() as client:
            yield client

        db.drop_all()

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert data["data"]["database"] == "connected"

def test_public_locations(client):
    res = client.get("/api/locations")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["items"]) == 1
    assert data["data"]["items"][0]["id"] == "test-fort-apex"

def test_map_markers(client):
    res = client.get("/api/locations/map/markers")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]) == 1
    assert data["data"][0]["coordinates"] == [14.1025, 77.2798]

def test_unauthorized_admin_access(client):
    # Attempting to access protected admin endpoint without token must return 401
    res = client.get("/api/admin/locations")
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNAUTHORIZED"

def test_admin_login_success(client):
    res = client.post("/api/auth/login", json={
        "email": "testadmin@pavagada.com",
        "password": "AdminPass@123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data["data"]
    assert data["data"]["user"]["email"] == "testadmin@pavagada.com"

def test_admin_login_invalid_password(client):
    res = client.post("/api/auth/login", json={
        "email": "testadmin@pavagada.com",
        "password": "WrongPassword"
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "AUTHENTICATION_FAILED"

def test_admin_location_crud_and_audit(client):
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "testadmin@pavagada.com",
        "password": "AdminPass@123"
    })
    token = login_res.get_json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Location
    create_res = client.post("/api/admin/locations", headers=headers, json={
        "id": "new-heritage-site",
        "name": "New Heritage Site",
        "category": "FORT_HERITAGE",
        "summary": "Newly discovered stone structure",
        "address": "North Ridge, Pavagada",
        "coordinates": {"latitude": 14.1050, "longitude": 77.2810},
    })
    assert create_res.status_code == 201
    loc_data = create_res.get_json()["data"]
    assert loc_data["name"] == "New Heritage Site"

    # 3. Update Location
    update_res = client.put("/api/admin/locations/new-heritage-site", headers=headers, json={
        "summary": "Updated summary with new historical details"
    })
    assert update_res.status_code == 200
    assert update_res.get_json()["data"]["summary"] == "Updated summary with new historical details"

    # 4. Change Status
    status_res = client.patch("/api/admin/locations/new-heritage-site/status", headers=headers, json={
        "status": "INACTIVE"
    })
    assert status_res.status_code == 200
    assert status_res.get_json()["data"]["status"] == "INACTIVE"

    # 5. Verify Public API excludes INACTIVE location
    pub_res = client.get("/api/locations")
    active_ids = [item["id"] for item in pub_res.get_json()["data"]["items"]]
    assert "new-heritage-site" not in active_ids

    # 6. Verify Audit Logs
    audit_res = client.get("/api/admin/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.get_json()["data"]["items"]
    assert len(logs) >= 3 # CREATE, UPDATE, STATUS_CHANGE
    actions = [l["action"] for l in logs]
    assert "CREATE" in actions
    assert "STATUS_CHANGE" in actions

def test_bus_route_and_timing_management(client):
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "testadmin@pavagada.com",
        "password": "AdminPass@123"
    })
    token = login_res.get_json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add Timing
    timing_res = client.post("/api/admin/buses/routes/test-route-1/timings", headers=headers, json={
        "departureTime": "07:30 AM",
        "arrivalTime": "11:30 AM",
        "dayType": "MON_SAT",
        "busType": "EXPRESS",
        "remarks": "Test express run"
    })
    assert timing_res.status_code == 201
    timing_id = timing_res.get_json()["data"]["id"]

    # 3. Verify Route Details has timing
    route_res = client.get("/api/buses/routes/test-route-1")
    assert route_res.status_code == 200
    timings = route_res.get_json()["data"]["timings"]
    assert len(timings) == 1
    assert timings[0]["departureTime"] == "07:30 AM"

    # 4. Delete Timing
    del_res = client.delete(f"/api/admin/buses/timings/{timing_id}", headers=headers)
    assert del_res.status_code == 200

    # 5. Edit Route
    update_res = client.put("/api/admin/buses/routes/test-route-1", headers=headers, json={
        "operator": "APSRTC",
        "frequencyNote": "Every 45 minutes"
    })
    assert update_res.status_code == 200
    assert update_res.get_json()["data"]["operator"] == "APSRTC"

    # 6. Create Stop, Add to Route, and Remove it
    create_stop_res = client.post("/api/admin/buses/stops", headers=headers, json={
        "stopName": "Pavagada Bus Stand",
        "locationArea": "Town Center",
        "latitude": 14.1025,
        "longitude": 77.2798
    })
    assert create_stop_res.status_code == 201
    stop_id = create_stop_res.get_json()["data"]["id"]

    add_stop_res = client.post("/api/admin/buses/routes/test-route-1/stops", headers=headers, json={
        "stopId": stop_id,
        "isMajorStop": True
    })
    assert add_stop_res.status_code == 201

    rem_stop_res = client.delete(f"/api/admin/buses/routes/test-route-1/stops/{stop_id}", headers=headers)
    assert rem_stop_res.status_code == 200

    # 7. Create a temporary route and delete it
    create_tmp_res = client.post("/api/admin/buses/routes", headers=headers, json={
        "routeCode": "PVG-TMP-99",
        "source": "Pavagada",
        "destination": "Challakere",
        "operator": "KSRTC"
    })
    assert create_tmp_res.status_code == 201
    tmp_id = create_tmp_res.get_json()["data"]["id"]

    del_route_res = client.delete(f"/api/admin/buses/routes/{tmp_id}", headers=headers)
    assert del_route_res.status_code == 200
