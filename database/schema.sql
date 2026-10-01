-- =============================================================================
-- NAMMA PAVAGADA - RELATIONAL DATABASE SCHEMA (AWS RDS / PostgreSQL & MySQL)
-- =============================================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'SUPER_ADMIN', -- SUPER_ADMIN, EDITOR, VIEWER
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_code VARCHAR(20) NOT NULL,
    badge_color_class VARCHAR(100) DEFAULT 'bg-forest-green text-white',
    border_class VARCHAR(100) DEFAULT 'border-forest-green',
    description TEXT,
    is_future_module BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 3. Locations Table (Central source for cards, map markers, search, details)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(80) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    kannada_name VARCHAR(250),
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON UPDATE CASCADE,
    summary TEXT NOT NULL,
    full_description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_meters INT,
    era VARCHAR(150),
    built_year_or_century VARCHAR(100),
    patron_ruler VARCHAR(200),
    architectural_style VARCHAR(200),
    pdf_source_doc VARCHAR(250),
    conservation_priority VARCHAR(80),
    contact_authority VARCHAR(150),
    contact_phone VARCHAR(50),
    contact_website VARCHAR(250),
    open_time VARCHAR(30),
    close_time VARCHAR(30),
    operating_days VARCHAR(100),
    hours_notes TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    key_attributes_json TEXT NOT NULL DEFAULT '[]',
    verified_source VARCHAR(250),
    is_pdf_authoritative BOOLEAN DEFAULT FALSE,
    primary_photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category_id);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);

-- 4. Bus Transportation Tables
CREATE TABLE IF NOT EXISTS bus_routes (
    id VARCHAR(80) PRIMARY KEY,
    route_code VARCHAR(50) UNIQUE NOT NULL,
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    via_json TEXT NOT NULL DEFAULT '[]',
    operator VARCHAR(80) NOT NULL DEFAULT 'KSRTC',
    frequency_note TEXT,
    status_note TEXT,
    is_timetable_live BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS bus_stops (
    id VARCHAR(80) PRIMARY KEY,
    stop_name VARCHAR(150) NOT NULL,
    kannada_name VARCHAR(200),
    location_area VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(80) NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
    stop_id VARCHAR(80) NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
    stop_sequence INT NOT NULL DEFAULT 1,
    is_major_stop BOOLEAN DEFAULT FALSE,
    arrival_estimate_minutes INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_route_stops_sequence ON route_stops(route_id, stop_sequence);

CREATE TABLE IF NOT EXISTS bus_timings (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(80) NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
    stop_id VARCHAR(80) REFERENCES bus_stops(id) ON DELETE SET NULL,
    departure_time VARCHAR(30) NOT NULL,
    arrival_time VARCHAR(30),
    day_type VARCHAR(30) NOT NULL DEFAULT 'DAILY', -- DAILY, MON_SAT, MON_FRI, SUNDAY, HOLIDAY
    bus_type VARCHAR(50) DEFAULT 'ORDINARY',
    remarks VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 5. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    kannada_name VARCHAR(250),
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone VARCHAR(50),
    emergency_phone VARCHAR(50),
    opening_hours VARCHAR(100),
    services_json TEXT NOT NULL DEFAULT '[]',
    departments_json TEXT NOT NULL DEFAULT '[]',
    website VARCHAR(250),
    primary_photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 6. Educational Institutions Table (Schools, Colleges, Polytechnics)
CREATE TABLE IF NOT EXISTS educational_institutions (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    kannada_name VARCHAR(250),
    institution_type VARCHAR(50) NOT NULL DEFAULT 'COLLEGE',
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone VARCHAR(50),
    website VARCHAR(250),
    courses_json TEXT NOT NULL DEFAULT '[]',
    facilities_json TEXT NOT NULL DEFAULT '[]',
    opening_hours VARCHAR(100),
    affiliation VARCHAR(150),
    primary_photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 7. Theatres Table
CREATE TABLE IF NOT EXISTS theatres (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    kannada_name VARCHAR(250),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone VARCHAR(50),
    website VARCHAR(250),
    screens_count INT DEFAULT 1,
    current_movies_json TEXT NOT NULL DEFAULT '[]',
    show_timings_json TEXT NOT NULL DEFAULT '[]',
    ticket_info_json TEXT NOT NULL DEFAULT '{}',
    primary_photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 8. History & Heritage Tables
CREATE TABLE IF NOT EXISTS history_eras (
    id VARCHAR(80) PRIMARY KEY,
    era_name VARCHAR(200) NOT NULL,
    kannada_title VARCHAR(250),
    time_range VARCHAR(100) NOT NULL,
    primary_rulers_json TEXT NOT NULL DEFAULT '[]',
    key_events_json TEXT NOT NULL DEFAULT '[]',
    summary TEXT NOT NULL,
    pdf_evidence TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS historical_places (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    kannada_name VARCHAR(250),
    era_id VARCHAR(80),
    classification VARCHAR(50) NOT NULL DEFAULT 'DEFENSE', -- DEFENSE, RELIGIOUS, ROYAL
    description TEXT NOT NULL,
    pdf_source VARCHAR(250) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    elevation_meters INT,
    primary_photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 9. Photos & Media Metadata Table (Amazon S3 Reference)
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- location, bus_route, hospital, school, college, theatre, history
    entity_id VARCHAR(80) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    url VARCHAR(800) NOT NULL,
    alt_text VARCHAR(255),
    caption VARCHAR(500),
    photo_type VARCHAR(80),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    file_size_bytes INT,
    mime_type VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX IF NOT EXISTS idx_photos_entity ON photos(entity_type, entity_id);

-- 10. Audit Logs Table (Full admin accountability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT,
    admin_email VARCHAR(120) NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    previous_value_json TEXT,
    new_value_json TEXT,
    ip_address VARCHAR(60),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
