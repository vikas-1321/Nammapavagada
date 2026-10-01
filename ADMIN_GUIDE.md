# Namma Pavagada — Administrator CMS User Manual & Operational Guide

> A comprehensive handbook for Taluk administrators, municipal officers, and community volunteers managing content, transit, civic services, and photographic archives on the Namma Pavagada platform.

---

## 1. Introduction & Access

The **Namma Pavagada Admin CMS** is a dedicated backoffice interface allowing authorized personnel to curate, update, and publish data across the platform without writing code or editing database tables directly.

- **Development URL**: [http://localhost:5174](http://localhost:5174)
- **Production URL**: `https://admin.nammapavagada.com`

### Default Administrative Credentials (Local / Initial)
- **Email**: `admin@nammapavagada.com`
- **Password**: `PavagadaAdmin@2026`
- **Role**: `super_admin`

> [!IMPORTANT]
> Immediately upon logging into a production deployment, change your password by navigating to the **Users** management section.

---

## 2. Navigating the Admin CMS

The dashboard layout consists of:
1. **Collapsible Left Sidebar**: Grouped into **Content & Transit**, **Civic Services**, and **System Administration**.
2. **Top Header**: Displays your active role badge (`super_admin` or `admin`), the environment badge, quick links to the public site, and the Secure Sign Out button.
3. **Data Grid & Action Bar**: Search bars, category filters, and "+ Add" buttons located consistently at the top of every management page.

---

## 3. Managing Locations & Points of Interest

Located under **Locations** in the sidebar.

### 3.1 Adding a New Location
1. Click the **"+ Add Location"** button in the top right.
2. Fill out the location form:
   - **Name (English)**: Official name (e.g. `Sri Shani Mahatma Temple`).
   - **Name (Kannada)**: Local Kannada script title (e.g. `ಶ್ರೀ ಶನಿ ಮಹಾತ್ಮ ದೇವಾಲಯ`).
   - **Category**: Select appropriate module (Heritage, Temples, Parks, etc.).
   - **Short Description**: 1-2 concise sentences displayed on public preview cards.
   - **Full Description**: Detailed background, architectural details, and visiting advice.
   - **Coordinates**: Enter valid WGS84 GPS decimal coordinates:
     - Pavagada Latitude range: `14.000000` to `14.400000` (e.g. `14.102200`).
     - Pavagada Longitude range: `77.100000` to `77.500000` (e.g. `77.279800`).
   - **Primary Source Citation**: **Mandatory field**. Cite archaeological surveys, the Tumakuru District Gazetteer, or official taluk records.
   - **Status**:
     - `Draft`: Hidden from the public website; visible only in CMS for editing.
     - `Published`: Live immediately on the public website and interactive map.
     - `Archived`: Hidden from public view but retained in database for history.
   - **Featured on Homepage**: Check this box to highlight this place in the homepage hero carousel.
3. Click **"Create Location"**.

### 3.2 Editing or Changing Publication Status
- In the locations table, click **"Edit"** to open the pre-populated modal.
- Click the **Status Badge** (`Published` / `Draft`) to quickly toggle visibility.
- Clicking **"Archive"** safely retires a record without permanently deleting historical data.

---

## 4. Managing Bus Routes & Transit Schedules

Located under **Bus Transit** in the sidebar.

### 4.1 Creating a Route
1. Click **"+ Add Route"**.
2. Enter the Route Code (e.g. `KA-06-P1`), Route Name, Origin Stop, and Destination Stop.
3. Provide the travel distance (km), approximate duration (minutes), and standard passenger fare (INR).
4. Select the operator type: `KSRTC / Sarige`, `Private Express`, or `City Shuttle`.

### 4.2 Reordering Route Stops
1. Select a route from the list to expand its route sequence view.
2. Use the **Up** (↑) and **Down** (↓) arrows to reorder stops sequentially from origin to destination.
3. Add intermediate pickup stops using the **"+ Add Stop"** dropdown.

### 4.3 Adding Verified Bus Timings
1. In the **Timings & Schedules** tab of the selected route:
2. Click **"+ Add Timing"**.
3. Select departure time (24-hour format, e.g. `06:30`), arrival time (e.g. `09:00`), and bus class (`Karnataka Sarige`, `Rajahamsa Executive`).
4. Select the operational schedule: `All Days`, `Weekdays Only`, or `Sundays & Holidays`.
5. Check **"Verified Schedule"** if the timing has been cross-checked with the Pavagada KSRTC Depot controller.

---

## 5. Managing Civic Services & Emergency Directory

### 5.1 Hospital & Emergency Facilities (`Hospitals` Page)
- Manage Taluk General Hospital, Community Health Centers (CHCs), and Primary Health Centers (PHCs).
- **Critical Fields**:
  - `Emergency 24/7 Phone`: Direct landline/mobile number for the casualty ward.
  - `Bed Capacity`: Current registered beds.
  - Checkboxes for `24/7 Ambulance`, `Blood Bank`, and `ICU Availability`.
- Changes appear instantly on the public **Services** directory for citizens in need of urgent medical care.

### 5.2 Education Directory (`Education` Page)
- Curate Taluk government high schools, Pre-University (PU) colleges, first-grade degree colleges, and polytechnics.
- Record principal contact details, affiliation (Tumkur University, DTE Karnataka), and campus coordinates.

### 5.3 Cinema Theatres & Movie Schedules (`Theatres` Page)
- Update local cinema houses (e.g. Alankar, SLN).
- Set the **Currently Running Movie** title, poster, and screen sound format (Dolby Atmos, 7.1).
- Add daily showtimes (e.g. Morning 10:30 AM, Matinee 1:30 PM, First Show 6:30 PM, Second Show 9:30 PM).

---

## 6. History, Heritage & Academic Integrity

Located under **History & Forts** in the sidebar.

Pavagada possesses exceptional multi-tiered military fortifications dating from the 15th century. To preserve historical rigor:
1. **Eras Table**: Documents historical periods (Vijayanagara, Nayakas of Nidugal, Mysore Sultanate under Tipu Sultan, Mysore Wodeyars).
2. **Defenses & Bastions**: Documents specific structures (e.g. Lower Town Gate, Koneri Ranga Bastion, Citadel Gun Platform).
3. **Integrity Rule**: **Never delete or overwrite primary source citations** (e.g., Lewis, Barry 2007; Epigraphia Carnatica Vol. XII). If local folklore is submitted, record it distinctly as local tradition while preserving the academic archaeological record.

---

## 7. Photo Request Workflow & Asset Management

Located under **Photo Assets** in the sidebar.

### 7.1 The Photo Request Workflow
To ensure the public website only features authentic photographs of Pavagada rather than stock photos:
1. When any location is created without a photograph, the system automatically marks it as **"Photo Needed"**.
2. Navigate to **Photo Assets** and click the **"Missing Photos"** tab.
3. Click the **"📋 Copy Field Photographer Brief"** button.
4. Paste this brief into WhatsApp or email to dispatch to local volunteers or student photographers in Pavagada. The brief includes:
   - Target Landmark Name
   - Exact GPS coordinates with Google Maps links
   - Recommended vantage points and lighting advice (e.g., golden hour on eastern bastion)
   - Minimum resolution requirements (1920x1080 horizontal orientation)

### 7.2 Uploading Verified Photos
1. When field photos are received, click **"Upload Photo"**.
2. Select the image file (`.jpg`, `.png`, `.webp`, max 10MB).
3. Select the associated location from the dropdown.
4. Enter the **Photographer Credit** (e.g. `Photo by Chetan Kumar / Pavagada Trekking Club`).
5. Choose whether to set this image as the **Primary Hero Photo** for the place.
6. Click **"Upload & Publish"**. The photo is uploaded directly to Amazon S3 (or local media storage in development) and linked to the landmark.

---

## 8. Audit Trail & Revision History

Located under **Audit Logs** in the sidebar (accessible to `super_admin`).

- Every create, update, delete, and status change generates an immutable audit record.
- **Inspect Diffs**: Click **"View Diff"** on any log row to inspect side-by-side JSON diffs highlighting what values were changed before and after the modification.
- Helps resolve conflicting submissions or restore accidentally modified transit schedules.

---

## 9. Infrastructure Health Monitoring

Located under **Settings** in the sidebar.

Provides real-time diagnostic ping meters for:
1. **Backend REST API**: Connectivity and latency response.
2. **Relational Database**: Connection status to Amazon RDS PostgreSQL.
3. **Media Storage**: Operational status of Amazon S3 photo buckets and CORS headers.
