# Namma Pavagada — REST API Reference & Integration Guide

> Complete technical specification for the Namma Pavagada REST API service, including endpoints, parameters, request/response bodies, authentication schemes, and status codes.

---

## 1. Overview & Conventions

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://api.nammapavagada.com/api`
- **Content Type**: `application/json` (except media uploads which use `multipart/form-data`)
- **Protocol**: HTTPS in production, HTTP for local development.

### Standard Response Envelope
Successful responses return JSON objects or arrays directly with appropriate HTTP status codes (200, 201).

### Standard Error Envelope
All error responses adhere to a consistent structure:
```json
{
  "error": true,
  "message": "Human-readable description of what went wrong",
  "status_code": 400
}
```

---

## 2. Authentication & Authorization

All administrative mutations and protected queries require a JSON Web Token (JWT) in the HTTP `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

### Roles & Access Levels
- `super_admin`: Full access to all endpoints, user management, and audit log inspection.
- `admin`: Full access to content management (locations, routes, services, history, photos).
- `editor`: Create and edit draft content; cannot archive or delete records.
- `public` (Unauthenticated): Read-only access to published content.

---

## 3. API Endpoints Catalog

### 3.1 Health & Diagnostics

#### `GET /health`
Returns the operational status of the API, database connectivity, and media storage status.
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-09-30T18:00:00Z",
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "connected",
    "engine": "sqlite"
  },
  "storage": {
    "provider": "local",
    "status": "operational"
  }
}
```

---

### 3.2 Authentication

#### `POST /auth/login`
Authenticates an administrator with email and password, returning an access JWT token.
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@nammapavagada.com",
  "password": "PavagadaAdmin@2026"
}
```
- **Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@nammapavagada.com",
    "full_name": "Pavagada Super Admin",
    "role": "super_admin"
  }
}
```

#### `GET /auth/me`
Retrieves the profile of the currently authenticated administrator.
- **Access**: Admin (JWT)
- **Response**: `200 OK`
```json
{
  "id": 1,
  "email": "admin@nammapavagada.com",
  "full_name": "Pavagada Super Admin",
  "role": "super_admin",
  "created_at": "2026-09-30T10:00:00Z"
}
```

---

### 3.3 Categories

#### `GET /categories`
Lists all active categories and module registries.
- **Access**: Public
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "slug": "heritage",
    "name": "Heritage & Forts",
    "name_kn": "ಪರಂಪರೆ ಮತ್ತು ಕೋಟೆಗಳು",
    "description": "Historical monuments, bastions, and archaeological sites",
    "icon": "Castle",
    "color": "amber",
    "badge_bg": "bg-amber-100 dark:bg-amber-950/60",
    "badge_text": "text-amber-800 dark:text-amber-300",
    "display_order": 1,
    "is_active": true
  }
]
```

#### `POST /categories`
Creates a new category module.
- **Access**: Admin (JWT)
- **Request Body**:
```json
{
  "slug": "agriculture",
  "name": "Agriculture & Markets",
  "name_kn": "ಕೃಷಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ",
  "description": "APMC market prices, groundnut and millets trading info",
  "icon": "Wheat",
  "color": "emerald",
  "badge_bg": "bg-emerald-100",
  "badge_text": "text-emerald-800",
  "display_order": 10
}
```

---

### 3.4 Locations & Landmarks

#### `GET /locations`
Retrieves a list of locations with optional category and search filters.
- **Query Parameters**:
  - `category` (string, optional): Filter by category slug (e.g., `heritage`, `temples`).
  - `status` (string, optional, admin only): `published`, `draft`, `archived`. Default: `published`.
  - `search` (string, optional): Full-text search on name and description.
- **Access**: Public
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "slug": "pavagada-fort",
    "name": "Pavagada Fort (Hill Fort)",
    "name_kn": "ಪಾವಗಡ ಕೋಟೆ (ಬೆಟ್ಟದ ಕೋಟೆ)",
    "category_slug": "heritage",
    "category_name": "Heritage & Forts",
    "short_description": "Magnificent multi-tiered 1420 CE granite hill fortress.",
    "latitude": 14.1022,
    "longitude": 77.2798,
    "elevation_m": 765,
    "primary_photo_url": "https://media.nammapavagada.com/locations/pavagada-fort.jpg",
    "primary_source_citation": "Lewis, Barry (Archaeological Survey); Tumakuru District Gazetteer",
    "status": "published",
    "is_featured": true
  }
]
```

#### `GET /locations/map`
Returns a lightweight GeoJSON-friendly payload optimized for Leaflet map markers.
- **Access**: Public
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "slug": "pavagada-fort",
    "name": "Pavagada Fort (Hill Fort)",
    "category": "heritage",
    "latitude": 14.1022,
    "longitude": 77.2798,
    "primary_photo_url": "https://media.nammapavagada.com/locations/pavagada-fort.jpg"
  }
]
```

#### `POST /locations`
Creates a new location.
- **Access**: Admin (JWT)
- **Request Body**:
```json
{
  "name": "Sri Shani Mahatma Temple",
  "name_kn": "ಶ್ರೀ ಶನಿ ಮಹಾತ್ಮ ದೇವಾಲಯ",
  "category_id": 2,
  "short_description": "Prominent regional pilgrimage shrine at Pavagada town center.",
  "full_description": "Detailed architectural and spiritual history...",
  "latitude": 14.1042,
  "longitude": 77.2758,
  "address": "Town Center, Pavagada 561202",
  "elevation_m": 645,
  "best_time_to_visit": "October to March",
  "visiting_hours": "06:00 AM - 08:30 PM",
  "entry_fee": "Free",
  "primary_source_citation": "Tumakuru District Gazetteer (Religious Institutions)",
  "status": "published",
  "is_featured": true
}
```

#### `PUT /locations/:id`
Updates an existing location and records an audit log.
- **Access**: Admin (JWT)

#### `PATCH /locations/:id/status`
Changes the status of a location (`published`, `draft`, `archived`).
- **Access**: Admin (JWT)
- **Request Body**: `{ "status": "archived" }`

---

### 3.5 Bus Transit & Schedules

#### `GET /buses/routes`
Lists all public bus transit routes with stops and verified departure timings.
- **Access**: Public
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "route_number": "KA-06-P1",
    "name": "Pavagada to Tumakuru (Express)",
    "origin_stop": "Pavagada KSRTC Bus Stand",
    "destination_stop": "Tumakuru KSRTC Central Stand",
    "distance_km": 105.0,
    "duration_minutes": 150,
    "fare_inr": 125,
    "operator_type": "KSRTC / Sarige",
    "stops": [
      { "id": 1, "stop_name": "Pavagada KSRTC Bus Stand", "sequence_order": 1 },
      { "id": 2, "stop_name": "Lingadahalli Cross", "sequence_order": 2 },
      { "id": 3, "stop_name": "Koratagere Bus Stand", "sequence_order": 3 },
      { "id": 4, "stop_name": "Tumakuru KSRTC Central Stand", "sequence_order": 4 }
    ],
    "timings": [
      { "id": 1, "departure_time": "05:45", "arrival_time": "08:15", "bus_type": "Karnataka Sarige", "day_type": "All Days" },
      { "id": 2, "departure_time": "06:30", "arrival_time": "09:00", "bus_type": "Rajahamsa Executive", "day_type": "All Days" }
    ]
  }
]
```

#### `POST /buses/routes/:id/timings`
Adds a verified departure timing to a bus route.
- **Access**: Admin (JWT)
- **Request Body**:
```json
{
  "departure_time": "14:15",
  "arrival_time": "16:45",
  "bus_type": "Karnataka Sarige",
  "day_type": "All Days"
}
```

---

### 3.6 Civic & Emergency Services

#### `GET /services/hospitals`
Lists verified hospitals and emergency trauma centers.
- **Access**: Public
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Pavagada Taluk General Hospital",
    "name_kn": "ಪಾವಗಡ ತಾಲ್ಲೂಕು ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆ",
    "facility_type": "Government Taluk Hospital",
    "emergency_phone": "08136-244222",
    "primary_phone": "08136-244222",
    "bed_capacity": 100,
    "has_ambulance_24x7": true,
    "has_blood_bank": true,
    "has_icu": true,
    "latitude": 14.1015,
    "longitude": 77.2762,
    "address": "Hospital Road, Pavagada, Karnataka 561202"
  }
]
```

#### `GET /services/education`
Lists verified schools, pre-university colleges, degree colleges, and polytechnics.
- **Access**: Public

#### `GET /services/theatres`
Lists local cinema theatres, screen specifications, and daily show schedules.
- **Access**: Public

---

### 3.7 Historical Archives & Heritage

#### `GET /history/eras`
Returns chronological historical eras of Pavagada with primary academic citations.
- **Access**: Public

#### `GET /history/places`
Returns fortified structures, defense bastions, and inscriptions.
- **Access**: Public

---

### 3.8 Photos & Asset Management

#### `POST /photos/upload`
Uploads a high-resolution image to Amazon S3 (or local media storage in dev mode).
- **Access**: Admin (JWT)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary image file (`.jpg`, `.jpeg`, `.png`, `.webp`, max 10MB)
  - `title`: Short descriptive title
  - `location_id` (optional): ID of associated location
  - `caption` (optional): Contextual caption
  - `photographer_credit` (optional): Attribution to volunteer/photographer
- **Response**: `201 Created`
```json
{
  "id": 12,
  "title": "Pavagada Fort Upper Citadel Bastion",
  "file_url": "https://media.nammapavagada.com/photos/2026/09/pavagada_citadel_bastion.jpg",
  "thumbnail_url": "https://media.nammapavagada.com/photos/2026/09/thumbs/pavagada_citadel_bastion.jpg",
  "storage_provider": "s3",
  "file_size_bytes": 2450820,
  "photographer_credit": "Pavagada Heritage Club Volunteer",
  "created_at": "2026-09-30T18:00:00Z"
}
```

#### `GET /photos/missing-requests`
Returns all locations in the system that lack authentic photography.
- **Access**: Admin (JWT)
- **Response**: `200 OK`
```json
[
  {
    "location_id": 4,
    "location_name": "Pavagada Solar Park (Shakti Sthala)",
    "category": "solar_park",
    "latitude": 14.2811,
    "longitude": 77.4147,
    "request_status": "pending_photography",
    "photography_notes": "Needs landscape panoramic view of solar array from observation tower."
  }
]
```

---

### 3.9 Admin Management & Audit Logs

#### `GET /admin/stats`
Dashboard summary statistics.
- **Access**: Admin (JWT)
- **Response**: `200 OK`
```json
{
  "total_locations": 10,
  "published_locations": 10,
  "draft_locations": 0,
  "missing_photos_count": 2,
  "bus_routes_count": 3,
  "hospitals_count": 1,
  "audit_logs_count": 14
}
```

#### `GET /admin/audit-logs`
Chronological audit trail of all data modifications.
- **Access**: Super Admin (JWT)
- **Query Parameters**: `entity_type`, `action`, `limit`, `offset`
- **Response**: `200 OK`
```json
[
  {
    "id": 14,
    "admin_user": "admin@nammapavagada.com",
    "action": "UPDATE",
    "entity_type": "locations",
    "entity_id": 1,
    "old_data": { "elevation_m": 750 },
    "new_data": { "elevation_m": 765 },
    "ip_address": "127.0.0.1",
    "created_at": "2026-09-30T18:05:00Z"
  }
]
```

---

## 4. HTTP Status Codes Reference

| Code | Status | Meaning |
| :--- | :--- | :--- |
| `200` | OK | Request succeeded and data is returned. |
| `201` | Created | Resource successfully created (e.g. location, timing, photo). |
| `400` | Bad Request | Missing required fields, invalid coordinate range, or schema violation. |
| `401` | Unauthorized | Missing or expired JWT token in `Authorization` header. |
| `403` | Forbidden | Authenticated user lacks sufficient permissions (e.g. non-super-admin accessing user controls). |
| `404` | Not Found | Requested entity ID or slug does not exist. |
| `409` | Conflict | Duplicate slug, route number, or email. |
| `422` | Unprocessable Entity | Semantically invalid data (e.g. departure time later than arrival time). |
| `500` | Internal Server Error | Uncaught server exception (automatically logged with stack trace). |
