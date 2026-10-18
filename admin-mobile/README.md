# Namma Pavagada — React Native Admin Data Collection CMS App

A production-grade mobile & tablet data collection and content management application built for authorized administrators of **Namma Pavagada**. The app enables on-the-ground survey teams and administrators to collect, verify, edit, and maintain high-fidelity local information across Pavagada Taluk.

---

## 🏛️ Architecture & Core Principles

- **Frontend Only**: Connects exclusively to the existing **Python/Flask REST API** (Port 5000). Zero backend code, database tables, or business logic were duplicated or modified.
- **Backend as Single Source of Truth**: All data models, status lifecycles (`PUBLISHED`, `DRAFT`, `TEMP_CLOSED`, `INACTIVE`, `ARCHIVED`), and verification schedules strictly mirror backend endpoints.
- **10-Step Category-First Wizard**: Guides data collectors from high-level civic domain down to granular subcategory-specific attributes.
- **Dynamic Form Dispatcher**: Automatically renders specialized interfaces for Hospitals, Clinics, Pharmacies, Police/Fire, Citizen Offices, Schools/Colleges, Theatres, Banks, APMC/Agriculture, Daily Trades, and Bus Transit.
- **Corridor Bus Transit Sequencer**: Specialized interface for bus routes with interactive stop ordering (Up/Down sequence) and departure timetable scheduling.
- **180-Day Freshness Barometer**: Proactively surfaces stale records that require re-verification based on the CMS governance policy.
- **Real-Time Duplicate Prevention**: Debounced fuzzy check against existing places before submission.

---

## 📱 Tech Stack

- **Framework**: React Native 0.76.7
- **Language**: TypeScript 5.7 (Strict mode, 100% typechecked)
- **Navigation**: React Navigation 7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **API Client**: Native `fetch` with Bearer JWT injection, 401 interception, and multipart photo upload support
- **State Management**: React Context (`AuthContext`) + Local storage

---

## 📁 Directory Structure

```text
admin-mobile/
├── App.tsx                     # Root application wrapper (SafeArea & AuthProvider)
├── index.js                    # React Native AppRegistry entry
├── package.json
├── tsconfig.json
└── src/
    ├── api/                    # API client layer (Single Source of Truth)
    │   ├── client.ts           # Base HTTP client, host auto-detection & 401 handler
    │   ├── authApi.ts          # Admin login & session verification
    │   ├── categoriesApi.ts    # Dynamic categories catalog
    │   ├── placesApi.ts        # Places CRUD, duplicate check, freshness audit
    │   ├── busApi.ts           # Corridor routes, stops reordering, timetable slots
    │   ├── tagsApi.ts          # Grouped taxonomy & custom tag creation
    │   ├── photosApi.ts        # Multipart photo upload, primary cover, captions
    │   ├── verificationApi.ts  # Verification audit submission
    │   └── index.ts
    ├── components/
    │   ├── common/             # Reusable UI primitives
    │   │   ├── AppButton.tsx   # Variants (primary, secondary, outline, danger)
    │   │   ├── AppTextInput.tsx# Form input with validation error states
    │   │   ├── AppCard.tsx     # Surface cards
    │   │   └── AppBadge.tsx    # Status & Freshness badges
    │   └── forms/              # Specialized form controllers
    │       ├── OperatingHoursEditor.tsx # 24/7 & day-by-day slot scheduler
    │       ├── TagSelector.tsx          # Grouped tags selector & custom creator
    │       ├── PhotoManager.tsx         # Cover photo selector & gallery
    │       ├── CoordinatesPicker.tsx    # GPS lat/long with Pavagada presets
    │       ├── DuplicateAlertModal.tsx  # Pre-submission duplicate warning
    │       └── QuickVerifyModal.tsx     # One-tap verification bottom sheet
    ├── constants/
    │   └── taxonomy.ts         # 10 Main categories, 60+ subcategories, color tokens
    ├── context/
    │   └── AuthContext.tsx     # Session lifecycle, token storage, auto-logout
    ├── forms/                  # Dynamic category-specific forms
    │   ├── HospitalForm.tsx        # Trauma, antivenom, ICU, ambulance, doctors
    │   ├── ClinicDoctorForm.tsx    # Consultation hours, walk-in, qualifications
    │   ├── PharmacyForm.tsx        # Jan Aushadhi, generic meds, delivery
    │   ├── FirePoliceForm.tsx      # Emergency desk, FIR assistance, lost & found
    │   ├── GovernmentOfficeForm.tsx# Repeatable Citizen Services catalog
    │   ├── EducationForm.tsx       # Board, medium, hostel, facilities
    │   ├── CinemaTheatreForm.tsx   # Screens, sound, movies & showtimes roster
    │   ├── BankAtmForm.tsx         # IFSC, 24/7 ATM, CDM, lockers
    │   ├── HotelRestaurantForm.tsx # Rooms, cuisine, veg/non-veg, UPI
    │   ├── AgricultureForm.tsx     # APMC wholesale days, auction hours, crops
    │   ├── DailyTradesForm.tsx     # Home service, emergency callout
    │   ├── BusStopForm.tsx         # Shelter, lighting, passing routes
    │   └── CategoryFormDispatcher.tsx # Polymorphic component dispatcher
    ├── navigation/
    │   ├── types.ts            # Route parameter types
    │   └── RootNavigator.tsx   # Bottom tabs + Native stack coordinator
    ├── screens/
    │   ├── auth/LoginScreen.tsx             # Admin authentication
    │   ├── dashboard/DashboardScreen.tsx     # KPI metrics & Freshness Barometer
    │   ├── categories/CategorySelectScreen.tsx    # Step 1: Main Category
    │   ├── categories/SubcategorySelectScreen.tsx # Step 2: Subcategory
    │   ├── forms/PlaceFormScreen.tsx        # Steps 3-10: Dynamic Wizard (Create & Edit)
    │   ├── places/ManagePlacesScreen.tsx    # Filterable registry & search
    │   ├── places/PlaceDetailScreen.tsx     # Record inspection
    │   ├── buses/BusRouteManageScreen.tsx   # Corridor Stop Sequencer & Timetable
    │   └── profile/ProfileScreen.tsx        # Backend URL configuration & session
    ├── theme/
    │   └── colors.ts           # Curated mobile data-entry palette
    ├── types/
    │   └── index.ts            # Domain TypeScript contracts
    └── utils/
        └── storage.ts          # Storage utility with memory fallback
```

---

## 🚀 Running the App

### 1. Prerequisites
Ensure the **backend server** is running on port 5000:
```bash
# In the repository root
python run.py
# Verify API is reachable at http://localhost:5000/api/health or http://localhost:5000/api/tags/grouped
```

### 2. Verify TypeScript Compilation
```bash
cd admin-mobile
npm run typecheck
```

### 3. Start React Native Metro Bundler
```bash
cd admin-mobile
npx react-native start
```

### 4. Run on Android or iOS
```bash
# Android Emulator (automatically uses http://10.0.2.2:5000/api)
npx react-native run-android

# iOS Simulator (automatically uses http://localhost:5000/api)
npx react-native run-ios
```

### 5. Physical Devices / LAN Testing
1. Open the app and navigate to **Settings** (Profile screen).
2. Enter your development computer's local Wi-Fi IP address (e.g. `http://192.168.1.100:5000/api`).
3. Tap **Test Connection** to verify reachability.
4. Tap **Apply URL** to save it.

---

## 🔒 Security & Admin Permissions
- Passwords are never stored on the device.
- All requests use standard JWT Bearer headers.
- If the token expires or backend returns `401 Unauthorized`, the app automatically flushes the stored session and returns the administrator to the login screen.
- Default administrator login for testing: `admin@nammapavagada.in` / `admin123`.
