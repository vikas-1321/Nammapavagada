# Namma Pavagada — Community Information Portal & Admin CMS

> A modern, decoupled digital portal and content management system for **Pavagada Taluk, Tumakuru District, Karnataka**.

[![CI/CD Pipeline](https://github.com/namma-pavagada/npweb/actions/workflows/deploy.yml/badge.svg)](https://github.com/namma-pavagada/npweb/actions)
[![Frontend](https://img.shields.io/badge/Public%20Frontend-React%2019%20%2B%20Vite%20%2B%20Tailwind-blue)](frontend/)
[![Admin CMS](https://img.shields.io/badge/Admin%20CMS-React%2019%20%2B%20Tailwind-purple)](admin-frontend/)
[![Backend](https://img.shields.io/badge/Backend%20API-Python%203.12%20%2B%20Flask-green)](backend/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-indigo)](database/)
[![Cloud](https://img.shields.io/badge/AWS-App%20Runner%20%2B%20RDS%20%2B%20S3-orange)](infrastructure/)

---

## 🏛️ Project Overview

**Namma Pavagada** is designed to provide authentic, verified civic and cultural information for residents, travelers, students, and researchers of Pavagada.

The project features a **fully decoupled multi-tier architecture**:
1. **Public Website (`frontend/`)**: High-performance, mobile-responsive SPA with interactive maps, transit schedules, emergency contacts, local institutions, and historical archives. Built with resilient offline fallbacks so the public site remains 100% operational even if the backend is down.
2. **Admin CMS (`admin-frontend/`)**: Dedicated, authenticated portal allowing non-technical administrators to manage points of interest, bus timings, hospital contacts, movie showtimes, historical citations, and photo assets without touching source code.
3. **REST API Backend (`backend/`)**: Python 3.12 Flask service built with clean layered architecture, JWT authentication, bcrypt password hashing, input validation, and automatic audit logging.
4. **Relational Database (`database/`)**: Relational PostgreSQL schema (with local SQLite development support) preserving referential integrity and authentic local citations.
5. **AWS Cloud Infrastructure (`infrastructure/`)**: Production-ready AWS CloudFormation templates for VPC, Multi-AZ RDS PostgreSQL, S3 media bucket with CORS, App Runner containerized API, and CloudFront static hosting.

---

## 📁 Repository Structure

```text
NPWeb/
├── frontend/                 # Public web portal (React + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # UI components (Header, Footer, Map, Modals, Cards)
│   │   ├── pages/           # Public pages (Home, Places, Buses, Services, History)
│   │   ├── services/        # API client and resilient offline fallback data handlers
│   │   └── types/           # TypeScript definitions
│   └── package.json
│
├── admin-frontend/           # Admin CMS Dashboard (React + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # Admin UI (Sidebar, Header, Status Badges, Modals)
│   │   ├── context/         # AuthContext (JWT session management)
│   │   ├── pages/           # CMS management pages (Locations, Buses, Hospitals, etc.)
│   │   ├── services/        # Admin REST API client
│   │   └── types/           # Admin TypeScript interfaces
│   └── package.json
│
├── backend/                  # REST API Service (Python 3.12 Flask)
│   ├── app/
│   │   ├── config/          # Environment configuration (Dev, Staging, Prod)
│   │   ├── middleware/      # JWT auth guard, role check, error handlers
│   │   ├── models/          # SQLAlchemy ORM models (Locations, Buses, Audits, etc.)
│   │   ├── routes/          # REST route blueprints
│   │   └── services/        # Business logic, S3 integration, audit logging
│   ├── tests/               # Pytest automated API test suite
│   ├── requirements.txt
│   └── run.py               # WSGI application entrypoint
│
├── database/                 # Relational schema and seed data
│   ├── schema.sql           # DDL for PostgreSQL / RDS and SQLite
│   └── seed_data.py         # Authentic Pavagada dataset seeder
│
├── infrastructure/           # Cloud & DevOps templates
│   ├── aws/cloudformation/  # Modular CloudFormation templates (VPC, RDS, S3, App Runner, CloudFront)
│   ├── docker/              # Dockerfiles and Nginx SPA routing configs
│   └── scripts/             # AWS deployment and S3 CORS setup scripts
│
├── docker-compose.yml        # Multi-container local orchestration
└── package.json              # Monorepo scripts for root orchestration
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.11 or v3.12
- **npm** or **pnpm** / **yarn**
- **Git**

---

### Step 1: Clone & Configure

```bash
git clone https://github.com/namma-pavagada/npweb.git
cd npweb
```

---

### Step 2: Set Up Backend

```bash
# Navigate to backend
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run database seeder (populates SQLite DB with authentic Pavagada data)
python ../database/seed_data.py

# Run API test suite
pytest -v -p no:cacheprovider tests/test_api.py

# Start backend REST API server (runs on http://localhost:5000)
python run.py
```

---

### Step 3: Set Up Public Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
# Public site will be live at: http://localhost:5173
```

---

### Step 4: Set Up Admin Dashboard

Open a third terminal window:

```bash
cd admin-frontend
npm install
npm run dev
# Admin dashboard will be live at: http://localhost:5174
```

---

## 🔑 Default Administrator Credentials

For local development and initial deployment:

- **Login URL**: [http://localhost:5174](http://localhost:5174)
- **Username / Email**: `admin@nammapavagada.com`
- **Password**: `PavagadaAdmin@2026`
- **Role**: `super_admin`

> [!WARNING]
> Please change this default password immediately after initial deployment using the Admin Dashboard **Users** page or by updating the database record.

---

## 🚀 Monorepo Root Commands

The root `package.json` provides handy convenience scripts:

| Command | Description |
| :--- | :--- |
| `npm run dev:public` | Starts the Public Website development server (`:5173`) |
| `npm run dev:admin` | Starts the Admin CMS development server (`:5174`) |
| `npm run dev:backend` | Starts the Flask Backend API server (`:5000`) |
| `npm run test:backend` | Executes the Pytest automated backend API test suite |
| `npm run seed:db` | Populates the local database with verified Pavagada records |
| `npm run build:all` | Compiles production builds for both frontends (`frontend/dist` & `admin-frontend/dist`) |

---

## 🐳 Docker Compose (One-Click Local Deployment)

To run the entire decoupled stack (PostgreSQL, Backend API, Public Frontend, and Admin CMS) via Docker:

```bash
docker-compose up --build -d
```

- Public Portal: `http://localhost:3000`
- Admin CMS: `http://localhost:3001`
- Backend API: `http://localhost:5000/api`
- PostgreSQL: `localhost:5432`

---

## 📸 Photo Request Workflow

To maintain visual authenticity without placeholder images:
1. When a location or landmark is created without a primary photograph, the system records it as a **Photo Request**.
2. Administrators can visit the **Photos** page in the CMS to review all locations missing authentic photography.
3. Clicking **"Copy Request Checklist"** generates a formatted markdown brief for field volunteers and local photographers detailing the required landmarks, coordinates, and photo orientation guidelines.
4. When photos are collected, administrators upload them directly to Amazon S3 (or local media storage in dev mode) and link them to the location.

---

## 📖 Complete Documentation Catalog

- **[System Architecture](ARCHITECTURE.md)**: Decoupled multi-tier design, component responsibilities, data flow diagrams, and SOLID implementation.
- **[REST API Documentation](API_DOCUMENTATION.md)**: Full API catalog, endpoints, query parameters, request/response formats, and error codes.
- **[Database Specification](DATABASE.md)**: Relational schema, ER diagrams, entity dictionaries, indexing, and migration guide.
- **[AWS Deployment Guide](AWS_DEPLOYMENT.md)**: Step-by-step production hosting with CloudFormation, App Runner, RDS PostgreSQL, S3, and CloudFront.
- **[Administrator User Guide](ADMIN_GUIDE.md)**: CMS manual for managing locations, transit routes, civic directories, movie shows, and photo assets.

---

## 📜 Historical Integrity & Primary Sources

All historical, geographic, and transit records in this system are derived from authentic documented sources:
- **Lewis, Barry**: Archaeological surveys of Chitradurga & Pavagada Fortifications.
- **Vivek, R. & Sagar, K.**: Regional heritage and epigraphical reports of Tumakuru district.
- **Cheluvarajan, P.**: Taluk gazetteer and local revenue records.
- **Karnataka State Road Transport Corporation (KSRTC)**: Verified Taluk bus schedules.
- **Taluk Health Office & General Hospital Pavagada**: Emergency contacts and department directories.

Fabrication of historical narratives or speculative folklore is strictly prohibited in this codebase.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
