# ClinixOne Product Documentation

## 1. Product Overview

ClinixOne is a full-stack healthcare management platform with role-based access for:
- Patient
- Doctor
- Admin

Core goals:
- Help patients book and manage appointments
- Help doctors monitor schedules and no-show risk
- Track medicine adherence and patient activity timeline
- Upload and manage medical reports
- Provide a modern, responsive web UI with secure API and PostgreSQL persistence

High-level stack:
- Frontend: React 19 + React Router + Tailwind CSS + Vite
- Backend: Node.js + Express + PostgreSQL
- AI Service: Flask + XGBoost pipeline for no-show prediction

---

## 2. System Architecture

### 2.1 Frontend
- Entry: `src/main.jsx`
- App Router: `src/App.jsx`
- Pages: `src/pages/*`
- Feature components: `src/components/*`
- Data hooks: `src/hooks/*`
- API layer: `src/services/*`

### 2.2 Backend API
- Server entry: `server/index.js`
- DB setup script: `server/setupDatabase.js`
- Upload storage: `server/uploads/reports/`
- Static file serving: `/uploads/*`

### 2.3 Database
- Schema definition: `database/schema.sql`
- PostgreSQL extension used: `pgcrypto` (for UUID generation)

### 2.4 AI Microservice
- Flask API: `ai-service/app.py`
- Model pipeline: `ai-service/no_show_pipeline.py`
- Dataset: `Medical_Appointment_No_Shows.csv`
- Artifacts: `ai-service/artifacts/*`

---

## 3. User Roles and Access

### 3.1 Patient
Can:
- Access patient dashboard routes
- Search doctors and book appointments
- Cancel appointments
- Create/toggle medicine reminders
- View adherence progress and activity feed
- Upload and view medical reports

Cannot:
- Access doctor or admin dashboards

### 3.2 Doctor
Can:
- Access doctor dashboard
- View appointment list and patient roster
- See AI no-show risk per appointment
- Send reminder actions
- View appointment summary with patient info/history
- View and mark notifications as read

Cannot:
- Access patient dashboard or admin dashboard

### 3.3 Admin
Can:
- Access dedicated admin dashboard path
- Logout or switch account

Current limitation:
- No admin CRUD management endpoints are currently implemented

---

## 4. Frontend Route Map

Defined in `src/App.jsx`.

Public routes:
- `/` -> Landing page
- `/login` -> Login page
- `/register` -> Register page

Protected routes:
- `/dashboard/*` -> Patient dashboard only
- `/doctor-dashboard` -> Doctor dashboard only
- `/admin-dashboard` -> Admin dashboard only

Route guard behavior:
- Uses localStorage token key: `clinix_session_token`
- Uses localStorage role key: `clinix_user_role`
- Redirects unauthenticated users to `/login`
- Redirects unauthorized role to role-specific home route

---

## 5. Patient Dashboard Sections

Patient dashboard page: `src/pages/DashboardPage.jsx`

Internal section routes handled by path parsing:
- `/dashboard` -> Dashboard overview
- `/dashboard/appointments` -> Appointment management and booking flow
- `/dashboard/history` -> Activity/medical history feed
- `/dashboard/reports` -> Report upload and listing
- `/dashboard/settings` -> Profile display settings
- `/dashboard/reminders` -> Medicine reminders

Main section modules:
- Appointments: `useAppointments`, `AppointmentsCard`, `BookingFlow`
- Reminders: `useReminders`, `MedicineReminderCard`
- History: `useActivities`, `ActivityFeed`
- Reports: `reportService` with file upload/list APIs
- Settings: local display-name persistence in localStorage

Sidebar navigation source:
- `src/components/layout/Sidebar.jsx`

---

## 6. Doctor Dashboard Features

Doctor page: `src/pages/DoctorDashboardPage.jsx`

Capabilities:
- Dashboard summary cards:
  - Today's appointments
  - Unique patients
  - Unread notifications
  - High no-show risk count
- Appointment table with:
  - Date/time/patient/type/status
  - AI no-show risk label and probability
  - Actions: Send Reminder, View Summary
- Notifications panel:
  - Stored notifications
  - Auto-generated lab-report notifications
  - Mark-read action for persisted notifications
- Patient summary panel:
  - Loads by selecting appointment summary action

Logout clears:
- `clinix_session_token`
- `clinix_patient_id`
- `clinix_user_name`
- `clinix_user_role`

---

## 7. Admin Dashboard Features

Admin page: `src/pages/AdminDashboardPage.jsx`

Current features:
- Dedicated admin landing screen
- Quick actions:
  - Switch account
  - Logout

Current status:
- Minimal shell, no admin analytics or management APIs yet

---

## 8. Authentication and Session Design

Frontend auth:
- Hook: `src/hooks/useAuth.js`
- Service: `src/services/authService.js`

Auth flow:
- Register -> `POST /api/auth/register`
- Login -> `POST /api/auth/login`
- Logout -> `POST /api/auth/logout` (auth required)

Session storage keys:
- `clinix_session_token`
- `clinix_user_role`
- `clinix_user_name`
- `clinix_patient_id` (patient only)
- Additional helper keys:
  - `clinix_pending_email`
  - `clinix_pending_role`
  - `clinix_remember_me`
  - `clinix_register_cooldown_until`

Security implementation:
- JWT bearer auth on protected APIs
- Role-based middleware on doctor-only endpoints
- Password hashing via bcrypt (salt rounds 10)

---

## 9. Backend API Endpoints

Server file: `server/index.js`

### 9.1 Health
- `GET /api/health`
  - DB connectivity check

### 9.2 Authentication
- `POST /api/auth/register`
  - Request: `fullName, email, phone, password, role`
  - Creates user in `users`
  - If role is patient -> inserts row into `patients`
  - If role is doctor -> inserts row into `doctors`
- `POST /api/auth/login`
  - Request: `email, password, role(optional)`
  - Returns JWT token and user metadata
- `POST /api/auth/logout`
  - Requires auth
  - Returns success (client clears local session)

### 9.3 Doctor Discovery and Slots
- `GET /api/doctors`
  - Optional query: `search`
  - Search across doctor name/specialization/hospital
- `GET /api/doctors/:doctorId/slots?date=YYYY-MM-DD`
  - Builds available 30-minute slots from doctor `available_hours`
  - Excludes already booked scheduled/confirmed slots

### 9.4 Appointment APIs (Patient)
- `POST /api/appointments/check-slot`
  - Request: `doctor_id, appointment_date, appointment_time`
  - Returns `{ available: boolean }`
- `GET /api/patient/appointments?patient_id=...`
  - Returns upcoming appointments (date >= current_date)
- `POST /api/patient/appointments`
  - Creates appointment
  - Also inserts activity: `appointment booked`
- `PATCH /api/patient/appointments/:appointmentId/cancel`
  - Sets appointment status to `cancelled`

### 9.5 Medicine Reminder APIs (Patient)
- `GET /api/patient/reminders?patient_id=...`
- `POST /api/patient/reminders`
- `PATCH /api/patient/reminders/:reminderId/status`

### 9.6 Activity APIs (Patient)
- `GET /api/patient/activities?patient_id=...&limit=...`
- `POST /api/patient/activities`

### 9.7 Report APIs (Patient)
- `GET /api/patient/reports?userId=...`
  - Returns report metadata + public URL
- `POST /api/patient/reports`
  - Multipart upload using Multer (`file` + `userId`)
  - Saves metadata in `medical_reports`

### 9.8 Doctor Dashboard APIs
- `GET /api/doctor/dashboard` (doctor role required)
  - Aggregates:
    - Summary metrics
    - Appointments with no-show risk
    - Distinct patient list
    - Notification stream
- `POST /api/doctor/appointments/:appointmentId/send-reminder` (doctor)
  - Inserts patient activity + doctor notification
- `GET /api/doctor/appointments/:appointmentId/summary` (doctor)
  - Detailed appointment + patient history
- `PATCH /api/doctor/notifications/:notificationId/read` (doctor)
  - Marks notification read

---

## 10. No-Show Risk Scoring Logic

Backend function:
- `predictNoShowRiskViaAI()` calls AI service endpoint `/predict/no-show`
- If AI fails, uses fallback heuristic `calculateNoShowRisk()`

Features sent from backend doctor dashboard calculation:
- `patientNoShowRate`
- `daysSinceLastVisit`
- `appointmentHour`
- `hasRecentLabResult`

Fallback output:
- Probability in percent
- Label in `Low | Medium | High`

AI output (when available):
- Probability percent from XGBoost model
- Label from model (`Low | Medium | High`)
- Source tracked as `xgboost`

---

## 11. SQL Schema Details

Schema file: `database/schema.sql`

### 11.1 users
Columns:
- `user_id uuid PK default gen_random_uuid()`
- `name text not null`
- `email text unique not null`
- `password_hash text not null`
- `phone text`
- `role text not null check (patient|doctor|admin)`
- `created_at timestamptz not null default now()`

### 11.2 patients
Columns:
- `patient_id uuid PK references users(user_id) on delete cascade`
- `age int`
- `gender text`
- `medical_history text`

### 11.3 doctors
Columns:
- `doctor_id uuid PK references users(user_id) on delete cascade`
- `name text`
- `specialization text`
- `experience int`
- `availability text`
- `rating decimal(3,2) default 4.5`
- `consultation_fee int default 500`
- `qualification text`
- `hospital text`
- `available_hours jsonb` with default weekday schedule

### 11.4 appointments
Columns:
- `appointment_id uuid PK default gen_random_uuid()`
- `patient_id uuid not null references patients(patient_id)`
- `doctor_id uuid not null references doctors(doctor_id)`
- `appointment_date date not null`
- `appointment_time time not null`
- `status text not null default 'scheduled'`
- `visit_type text default 'in-clinic' check ('online','in-clinic')`
- `consultation_reason text`
- `consultation_fee int`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 11.5 medicine_reminders
Columns:
- `reminder_id uuid PK default gen_random_uuid()`
- `patient_id uuid not null references patients(patient_id)`
- `medicine_name text not null`
- `dosage text not null`
- `reminder_time time not null`
- `status text not null default 'pending'`

### 11.6 activities
Columns:
- `activity_id uuid PK default gen_random_uuid()`
- `patient_id uuid not null references patients(patient_id)`
- `activity_type text not null`
- `description text not null`
- `activity_time timestamptz not null default now()`

### 11.7 medical_reports
Columns:
- `report_id uuid PK default gen_random_uuid()`
- `patient_id uuid not null references patients(patient_id)`
- `file_name text not null`
- `file_path text not null`
- `mime_type text`
- `created_at timestamptz not null default now()`

### 11.8 doctor_notifications
Columns:
- `notification_id uuid PK default gen_random_uuid()`
- `doctor_id uuid not null references doctors(doctor_id)`
- `title text not null`
- `message text not null`
- `type text not null default 'info'`
- `is_read boolean not null default false`
- `created_at timestamptz not null default now()`

### 11.9 Indexes
- `idx_users_email`
- `idx_doctors_specialization`
- `idx_appointments_patient_date`
- `idx_appointments_doctor_date`
- `idx_reminders_patient`
- `idx_activities_patient_time`
- `idx_doctor_notifications_doctor_created`

---

## 12. AI Service Details

### 12.1 API (`ai-service/app.py`)
Endpoints:
- `GET /health`
  - Ensures model is trained
  - Returns model status and artifact path
- `POST /predict/no-show`
  - Ensures model exists
  - Accepts payload and maps legacy backend fields when provided
  - Returns:
    - `probability_percent`
    - `label`
    - `model`
    - `risk_score`
    - `risk_label`
    - `band`

### 12.2 Training Pipeline (`ai-service/no_show_pipeline.py`)
Input dataset:
- `Medical_Appointment_No_Shows.csv`

Target:
- `No-show` mapped to binary (`Yes`=1, `No`=0)

Engineered features:
- `days_before_booking`
- `appointment_weekday`

Feature set used:
- `Age`
- `Gender`
- `Scholarship`
- `Hipertension`
- `Diabetes`
- `Alcoholism`
- `SMS_received`
- `days_before_booking`
- `appointment_weekday`
- `Neighbourhood`

Model:
- `XGBClassifier`
- Params:
  - `n_estimators=220`
  - `max_depth=5`
  - `learning_rate=0.06`
  - `subsample=0.9`
  - `colsample_bytree=0.9`

Pipeline:
- Categorical: OneHotEncoder (ignore unknown)
- Numeric: passthrough
- Train/test split: 80/20 stratified

Artifacts generated:
- `ai-service/artifacts/no_show_xgb_pipeline.joblib`
- `ai-service/artifacts/training_report.json`
- `ai-service/artifacts/feature_importance.csv`
- optional plot: `ai-service/artifacts/feature_importance.png`

Risk labels from probability:
- `< 0.4` -> Low
- `< 0.7` -> Medium
- `>= 0.7` -> High

---

## 13. Runtime and Configuration

### 13.1 Node scripts (`package.json`)
- `npm run dev` -> Vite frontend
- `npm run server` -> Express backend
- `npm run dev:server` -> Backend watch mode
- `npm run db:setup` -> Create/apply PostgreSQL schema
- `npm run ai:install` -> Create Python 3.9 venv and install AI deps
- `npm run ai:train` -> Train model artifacts
- `npm run ai:serve` -> Serve Flask AI API
- `npm run build` -> Frontend production build
- `npm run preview` -> Preview built frontend
- `npm run lint` -> ESLint

### 13.2 Env variables (`.env.example`)
- `VITE_API_BASE_URL`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `AI_SERVICE_URL`

### 13.3 Frontend build config
- `vite.config.js`: React plugin only
- `tailwind.config.js`:
  - Custom color system (pink/rose theme)
  - Fonts: Space Grotesk, Manrope
  - Custom `fadeUp` animation
  - Custom soft shadow

---

## 14. Key Product Flows

### 14.1 Patient Booking Flow
1. Patient logs in
2. Opens Appointments section
3. Searches doctor or lists doctors
4. Selects date/time slot
5. Checks slot availability
6. Creates appointment
7. Activity log entry is automatically recorded

### 14.2 Reminder Flow
1. Patient adds medicine reminder
2. Reminder appears in reminder list
3. Patient toggles reminder status (pending/completed)
4. UI and DB sync through reminder status endpoint

### 14.3 Report Upload Flow
1. Patient uploads file from dashboard
2. Backend stores file on disk and inserts metadata in `medical_reports`
3. List endpoint returns report records with generated public URL

### 14.4 Doctor Daily Workflow
1. Doctor logs in and opens doctor dashboard
2. Dashboard fetches appointments + notifications + patient list
3. Backend computes no-show risk per appointment (AI or fallback)
4. Doctor sends reminders and reviews appointment summaries
5. Notifications can be marked read

---

## 15. Security and Data Handling

Implemented:
- JWT-based auth (`Authorization: Bearer <token>`)
- Role middleware for doctor routes
- Bcrypt password hashing
- CORS allowlist
- SQL parameterized queries
- Filename sanitization for uploads

Data storage notes:
- Session and user role data kept in localStorage
- Report files stored in server filesystem under `server/uploads/reports/`

---

## 16. Known Gaps and Current Limitations

- Admin module is a shell (no management APIs)
- No appointment reschedule endpoint (cancel supported)
- No payment gateway integration
- No real-time socket notifications
- No explicit email/SMS delivery integration for reminders
- Doctor profile and patient profile edit APIs are not implemented
- Doctor dashboard uses random `hasRecentLabResult` signal for risk feature input
- AI service fallback can diverge from trained model output when service is unavailable

---

## 17. Local Development Runbook

Prerequisites:
- Node.js
- PostgreSQL
- Python 3.9 (for AI scripts as configured)

Recommended local sequence:
1. `npm install`
2. Configure `.env.local` using `.env.example`
3. `npm run db:setup`
4. Start backend: `npm run dev:server`
5. Start frontend: `npm run dev`
6. For AI service:
   - `npm run ai:install`
   - `npm run ai:train`
   - `npm run ai:serve`

Service defaults:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- AI service: `http://localhost:8001`

---

## 18. File Map (Major)

Frontend:
- `src/App.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/DoctorDashboardPage.jsx`
- `src/pages/AdminDashboardPage.jsx`
- `src/components/appointment/*`
- `src/components/dashboard/*`
- `src/components/auth/*`
- `src/services/*`
- `src/hooks/*`

Backend:
- `server/index.js`
- `server/setupDatabase.js`

Database:
- `database/schema.sql`

AI:
- `ai-service/app.py`
- `ai-service/no_show_pipeline.py`
- `Medical_Appointment_No_Shows.csv`

---

This document reflects the current implementation in the repository as of March 30, 2026.