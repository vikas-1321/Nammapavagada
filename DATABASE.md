# Namma Pavagada — Relational Database Architecture & Schema Specification

> Comprehensive specification of relational models, Entity-Relationship (ER) diagrams, indexing strategies, audit persistence, and migration workflows for PostgreSQL (Amazon RDS) and SQLite.

---

## 1. Database Philosophy & Design Principles

The Namma Pavagada database is engineered around four guiding tenets:
1. **Referential Integrity**: Strong foreign key constraints and cascade rules prevent orphaned transit stops, show schedules, or photo associations.
2. **Historical Authenticity Enforcement**: Historical records and location entries mandate non-nullable citation attributes (`primary_source_citation`) to prevent unverified local folklore from polluting the digital archive.
3. **Immutable Audit Trail**: The `audit_logs` table serves as an append-only ledger capturing user identity, IP address, timestamp, and full before/after JSON diffs for every state mutation.
4. **Dual-Engine Portability**: Schema DDL (`database/schema.sql`) and ORM mappings (`app/models/`) are designed for complete cross-compatibility between local **SQLite 3** development and high-availability **Amazon RDS PostgreSQL** production.

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    ADMIN_USERS ||--o{ AUDIT_LOGS : performs
    ADMIN_USERS ||--o{ PHOTOS : uploads
    CATEGORIES ||--o{ LOCATIONS : classifies
    LOCATIONS ||--o{ PHOTOS : exhibits
    LOCATIONS ||--o{ HISTORICAL_PLACES : references
    
    BUS_ROUTES ||--o{ ROUTE_STOPS : contains
    BUS_STOPS ||--o{ ROUTE_STOPS : serves
    BUS_ROUTES ||--o{ BUS_TIMINGS : schedules

    THEATRES ||--o{ THEATRE_SHOWS : screens
    HISTORY_ERAS ||--o{ HISTORICAL_PLACES : periodizes

    ADMIN_USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string role
        boolean is_active
        timestamp created_at
    }

    CATEGORIES {
        int id PK
        string slug UK
        string name
        string name_kn
        string icon
        string color
        int display_order
        boolean is_active
    }

    LOCATIONS {
        int id PK
        string slug UK
        int category_id FK
        string name
        string name_kn
        text short_description
        text full_description
        decimal latitude
        decimal longitude
        int elevation_m
        string status
        boolean is_featured
        string primary_photo_url
        text primary_source_citation
        timestamp created_at
    }

    BUS_ROUTES {
        int id PK
        string route_number UK
        string name
        string origin_stop
        string destination_stop
        decimal distance_km
        int duration_minutes
        string operator_type
        boolean is_active
    }

    BUS_STOPS {
        int id PK
        string name
        string name_kn
        decimal latitude
        decimal longitude
        boolean is_terminal
    }

    ROUTE_STOPS {
        int id PK
        int route_id FK
        int stop_id FK
        int sequence_order
    }

    BUS_TIMINGS {
        int id PK
        int route_id FK
        string departure_time
        string arrival_time
        string bus_type
        string day_type
        boolean is_verified
    }

    HOSPITALS {
        int id PK
        string name
        string facility_type
        string emergency_phone
        int bed_capacity
        boolean has_ambulance_24x7
        boolean has_blood_bank
        boolean has_icu
        decimal latitude
        decimal longitude
    }

    THEATRES {
        int id PK
        string name
        int total_seats
        string sound_system
        string currently_running_movie
    }

    THEATRE_SHOWS {
        int id PK
        int theatre_id FK
        string show_name
        string show_time
    }

    HISTORY_ERAS {
        int id PK
        string era_name
        string century_range
        string primary_ruler
        text primary_source_citation
    }

    HISTORICAL_PLACES {
        int id PK
        string structure_name
        int era_id FK
        int location_id FK
        string defense_level
        text primary_source_citation
    }

    PHOTOS {
        int id PK
        int location_id FK
        string file_url
        string storage_provider
        int file_size_bytes
        string photographer_credit
    }

    AUDIT_LOGS {
        int id PK
        int admin_user_id FK
        string action
        string entity_type
        int entity_id
        json old_data
        json new_data
        string ip_address
        timestamp created_at
    }
```

---

## 3. Data Dictionary

### 3.1 `admin_users`
Stores administrative identities and security roles.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL / INTEGER | PK, Auto | Unique administrator ID. |
| `email` | VARCHAR(190) | UNIQUE, NOT NULL | Login credential. |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hash with salt. |
| `full_name` | VARCHAR(120) | NOT NULL | Display name. |
| `role` | VARCHAR(32) | NOT NULL, DEFAULT 'admin' | `super_admin`, `admin`, `editor`. |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Account status flag. |
| `last_login_at` | TIMESTAMP | NULL | Last successful session timestamp. |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |

### 3.2 `categories`
Dynamic registry of modules and POI classifications.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL / INTEGER | PK, Auto | Unique category ID. |
| `slug` | VARCHAR(64) | UNIQUE, NOT NULL | URL-safe slug (`heritage`, `transit`, `temples`). |
| `name` | VARCHAR(100) | NOT NULL | English category title. |
| `name_kn` | VARCHAR(100) | NULL | Kannada localized category title. |
| `description` | TEXT | NULL | Explanatory description. |
| `icon` | VARCHAR(64) | NOT NULL, DEFAULT 'MapPin' | Lucide icon identifier. |
| `color` | VARCHAR(32) | NOT NULL, DEFAULT 'indigo' | Tailwind color family. |
| `badge_bg` | VARCHAR(64) | NULL | Tailwind CSS background badge class. |
| `badge_text` | VARCHAR(64) | NULL | Tailwind CSS text badge class. |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sorting weight for navigation menus. |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Public visibility toggle. |

### 3.3 `locations`
Core master table for places, landmarks, institutions, and tourist attractions.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL / INTEGER | PK, Auto | Primary key. |
| `slug` | VARCHAR(120) | UNIQUE, NOT NULL | URL slug (e.g. `pavagada-fort`). |
| `category_id` | INTEGER | FK -> `categories.id` | Associated category module. |
| `name` | VARCHAR(190) | NOT NULL | Official English name. |
| `name_kn` | VARCHAR(190) | NULL | Official Kannada name. |
| `short_description` | TEXT | NOT NULL | 1-2 sentence card summary. |
| `full_description` | TEXT | NOT NULL | Comprehensive long-form narrative. |
| `latitude` | DECIMAL(9, 6) | NOT NULL | WGS84 Latitude (14.000 to 14.400). |
| `longitude` | DECIMAL(9, 6) | NOT NULL | WGS84 Longitude (77.100 to 77.500). |
| `elevation_m` | INTEGER | NULL | Altitude in meters above mean sea level. |
| `address` | VARCHAR(255) | NULL | Physical address or landmark proximity. |
| `best_time_to_visit` | VARCHAR(100) | NULL | Seasonal recommendation. |
| `visiting_hours` | VARCHAR(100) | NULL | Operating hours. |
| `entry_fee` | VARCHAR(64) | NULL, DEFAULT 'Free' | Fee schedule. |
| `primary_source_citation` | TEXT | NOT NULL | Primary academic or gazetteer citation. |
| `primary_photo_url` | VARCHAR(512) | NULL | Direct URL to hero image on S3 / CDN. |
| `status` | VARCHAR(32) | NOT NULL, DEFAULT 'published' | `published`, `draft`, `archived`. |
| `is_featured` | BOOLEAN | NOT NULL, DEFAULT false | Flag for homepage spotlight. |

### 3.4 Transit Tables (`bus_routes`, `bus_stops`, `route_stops`, `bus_timings`)
- `bus_routes`: Transit route definition between major nodes.
- `bus_stops`: Master list of verified physical bus stops in Pavagada Taluk.
- `route_stops`: Sequential junction table mapping stops to routes with `sequence_order` (1, 2, 3...).
- `bus_timings`: Verified daily trip departures with `departure_time` (HH:MM), `arrival_time`, `bus_type` (Sarige, Rajahamsa), and `day_type` (All Days, Weekdays).

### 3.5 Services Tables (`hospitals`, `education_institutions`, `theatres`, `theatre_shows`)
- `hospitals`: Emergency 24/7 contacts, bed capacity, ICU availability, ambulance contact.
- `education_institutions`: Taluk schools, government PU colleges, polytechnics, affiliated universities.
- `theatres` & `theatre_shows`: Local cinemas, screen facilities, sound systems, daily show timings.

### 3.6 History & Heritage Tables (`history_eras`, `historical_places`)
- `history_eras`: Chronological eras (Nayak Dynasty, Vijayanagara, Maratha, Mysore Sultanate) with verified date ranges and academic citations.
- `historical_places`: Specific defense bastions, watchtowers, rock inscriptions, and hill gates linked to parent locations.

### 3.7 Media & Auditing (`photos`, `audit_logs`)
- `photos`: Metadata for media assets hosted in Amazon S3 or local disk. Includes file size, storage provider (`s3` vs `local`), photographer credit, and associated location ID.
- `audit_logs`: Immutable ledger storing `admin_user_id`, `action` (`CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`), `entity_type`, `entity_id`, before/after JSON blobs (`old_data`, `new_data`), user IP address, and timestamp.

---

## 4. Indexing Strategy & Performance Optimizations

To guarantee low latency even as records scale, the following indices are maintained:

```sql
-- Fast slug resolution for public routing
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Public filter optimization
CREATE INDEX idx_locations_cat_status ON locations(category_id, status);
CREATE INDEX idx_locations_featured ON locations(is_featured) WHERE is_featured = true;

-- Spatial bounding box acceleration
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);

-- Transit search optimization
CREATE INDEX idx_bus_timings_route ON bus_timings(route_id, departure_time);
CREATE INDEX idx_route_stops_sequence ON route_stops(route_id, sequence_order);

-- Audit log chronological queries
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

## 5. Migration Guide: SQLite to Amazon RDS PostgreSQL

### Development Environment (SQLite)
During local development, SQLite is utilized for zero-configuration startup:
```bash
# Path: backend/namma_pavagada.db
python database/seed_data.py
```

### Production Deployment (Amazon RDS PostgreSQL)
1. Provision the RDS instance using CloudFormation (`infrastructure/aws/cloudformation/02-rds-postgres.yaml`).
2. Export the RDS connection string into `backend/.env`:
   ```env
   DATABASE_URL=postgresql://npadmin:YourStrongPassword@np-postgres-db.c0123456789.ap-south-1.rds.amazonaws.com:5432/namma_pavagada
   ```
3. Initialize the production schema:
   ```bash
   psql -h <rds_endpoint> -U npadmin -d namma_pavagada -f database/schema.sql
   ```
4. Run the seed script targeting RDS to populate authentic verified initial data:
   ```bash
   python database/seed_data.py
   ```
5. Verify initial records:
   ```sql
   SELECT count(*) FROM locations;  -- Returns 10 authentic locations
   SELECT count(*) FROM bus_routes; -- Returns 3 verified transit routes
   ```
