# ClinixOne – Comprehensive Project Documentation

**Project Name:** ClinixOne Healthcare Management Platform  
**Version:** 1.0.0 (Development)  
**Last Updated:** April 26, 2026  
**Status:** Active Development (Sprint 1 & Sprint 2)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Routes & Connections](#api-routes--connections)
6. [Frontend Structure](#frontend-structure)
7. [Backend Structure](#backend-structure)
8. [Authentication & Authorization](#authentication--authorization)
9. [Sprint 1: User Stories 1-3](#sprint-1-user-stories-1-3)
10. [Sprint 2: User Stories 4-6](#sprint-2-user-stories-4-6)

---

## Project Overview

### What is ClinixOne?

ClinixOne is a **full-stack healthcare management platform** designed to revolutionize the way patients, doctors, and administrators interact within a healthcare ecosystem. The platform provides:

- **Centralized Health Management:** Patients can monitor their appointments, medications, and health activities from a single dashboard
- **Efficient Appointment Booking:** Streamlined appointment scheduling with real-time doctor availability
- **Doctor Dashboard:** Doctors can manage their daily consultations, view patient information, and monitor appointment risks
- **AI-Powered No-Show Prediction:** Machine learning model predicts which patients are likely to miss appointments
- **Administrative Control:** Administrators can monitor system metrics and manage clinic operations
- **Responsive Web Interface:** Modern, user-friendly React-based frontend with Tailwind CSS styling

### Core Objectives

1. **Improve Patient Engagement:** Provide patients with easy access to healthcare services
2. **Optimize Doctor Efficiency:** Help doctors manage their schedules and patient interactions
3. **Enable Data-Driven Decisions:** Use AI/ML for predictive analytics (no-show risk)
4. **Centralize Healthcare Information:** Create a unified platform for all healthcare stakeholders
5. **Ensure Data Security:** Implement role-based access control and secure authentication

---

## Tech Stack

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 19.2.0 | Component-based UI library |
| **Routing** | React Router | 7.13.1 | Client-side navigation and route protection |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| **Build Tool** | Vite | 7.3.1 | Fast module bundler |
| **3D Graphics** | Three.js | 0.183.2 | WebGL 3D rendering for landing page |
| **3D React Binding** | React Three Fiber | 9.5.0 | React wrapper for Three.js |
| **3D Utilities** | @react-three/drei | 10.7.7 | Helper components for Three.js |
| **Animations** | Framer Motion | 12.38.0 | Smooth React component animations |
| **Animation Library** | GSAP | 3.14.2 | Professional animation timeline library |
| **Post-Processing** | Postprocessing | 6.38.3 | 3D effects and visual enhancements |
| **Icons** | Lucide React | 0.577.0 | Modern icon library |
| **Notifications** | React Hot Toast | 2.6.0 | Toast notifications |
| **HTTP Client** | Fetch API | Built-in | API communication |

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime for backend |
| **Framework** | Express.js | 5.2.1 | REST API framework |
| **Database** | PostgreSQL | 12+ | Relational database |
| **Database Driver** | pg | 8.20.0 | PostgreSQL client for Node.js |
| **Authentication** | JWT (jsonwebtoken) | 9.0.3 | Token-based authentication |
| **Password Hashing** | bcryptjs | 3.0.3 | Secure password encryption |
| **File Upload** | Multer | 2.1.1 | Multipart/form-data handling |
| **CORS** | cors | 2.8.6 | Cross-origin resource sharing |
| **Environment Config** | dotenv | 17.3.1 | Environment variable management |
| **HTTP Logging** | morgan | 1.10.1 | HTTP request logging |

### AI/ML Services

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Flask | Latest | Python web framework for AI service |
| **ML Library** | XGBoost | Latest | Machine learning model for prediction |
| **Environment** | Python | 3.9 | Python version for AI service |
| **Virtual Environment** | venv | Built-in | Python virtual environment |

### Development & Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.39.1 | Code linting and style checking |
| Autoprefixer | 10.4.27 | CSS vendor prefix automation |
| PostCSS | 8.5.8 | CSS transformation tool |
| npm/yarn | Latest | Dependency management |

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            React 19 + React Router + Tailwind             │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ Landing Page │ Auth Pages │ Patient Dashboard  │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ Doctor Dashboard │ Admin Dashboard │ Components │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│                     HTTP/REST (Fetch API)                        │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER (Backend)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js Server (Node.js)                             │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ Authentication │ Doctor Discovery │ Appointments │    │   │
│  │  │ Reminders      │ Reports          │ Activities   │    │   │
│  │  │ Notifications  │ Dashboard APIs   │ AI Interface │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│                         JWT Token                                │
│                     Role-Based Middleware                        │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                     │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ Users │ Patients │ Doctors │ Appointments        │    │   │
│  │  │ Medicine Reminders │ Activities │ Medical Reports│    │   │
│  │  │ Doctor Notifications │ Indexes │ Relationships   │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML SERVICE LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Flask Server (Python 3.9)                               │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ XGBoost Model │ No-Show Prediction │ API Endpoint│   │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   FILE STORAGE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Medical Reports Directory (server/uploads/reports/)     │   │
│  │ Accessible via: /uploads/reports/{filename}             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User accesses web application** → Served by Vite dev server or built static files
2. **Authentication** → User logs in/registers via `/api/auth/login` or `/api/auth/register`
3. **Token storage** → JWT token stored in localStorage with role information
4. **Route protection** → React Router guards routes based on user role
5. **API calls** → Frontend services communicate with Express API with JWT bearer token
6. **Database operations** → Express API queries PostgreSQL database
7. **AI prediction** → Optional call to Flask AI service for no-show predictions
8. **Response handling** → API returns data to frontend, updates React state, re-renders UI

---

## Database Schema

### Overview

The ClinixOne database is built on **PostgreSQL** with the following design principles:

- **Relational Design:** Normalized tables with proper foreign key relationships
- **Role-Based Data:** Separate tables for patients and doctors referencing the users table
- **UUID Primary Keys:** Using PostgreSQL's `pgcrypto` extension for secure UUID generation
- **Indexes:** Strategic indexes for optimized query performance
- **Timestamps:** All entities tracked with creation and update timestamps

### Database Tables

#### 1. **Users Table**

Stores authentication and basic information for all users (patients, doctors, admins).

```sql
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `user_id`: Unique identifier (UUID)
- `name`: Full name of the user
- `email`: Unique email address (indexed)
- `password_hash`: bcrypt hashed password
- `phone`: Contact phone number
- `role`: User role (patient/doctor/admin)
- `created_at`: Account creation timestamp

**Relationships:**
- Referenced by `patients` table
- Referenced by `doctors` table

---

#### 2. **Patients Table**

Extends user information with patient-specific data.

```sql
CREATE TABLE public.patients (
  patient_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
  age INT,
  gender TEXT,
  medical_history TEXT
);
```

**Columns:**
- `patient_id`: Foreign key to users.user_id
- `age`: Patient age
- `gender`: Patient gender
- `medical_history`: Text field for medical history notes

**Relationships:**
- Primary key references `users.user_id`
- Referenced by `appointments` table
- Referenced by `medicine_reminders` table
- Referenced by `activities` table
- Referenced by `medical_reports` table

---

#### 3. **Doctors Table**

Extends user information with doctor-specific data and scheduling capabilities.

```sql
CREATE TABLE public.doctors (
  doctor_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
  name TEXT,
  specialization TEXT,
  experience INT,
  availability TEXT,
  rating DECIMAL(3,2) DEFAULT 4.5,
  consultation_fee INT DEFAULT 500,
  qualification TEXT,
  hospital TEXT,
  available_hours JSONB DEFAULT '{...}'
);
```

**Columns:**
- `doctor_id`: Foreign key to users.user_id
- `name`: Doctor's name
- `specialization`: Medical specialization (e.g., Cardiologist, Pediatrician)
- `experience`: Years of experience
- `availability`: General availability indicator
- `rating`: Doctor rating (0.00-5.00)
- `consultation_fee`: Fee per consultation in currency units
- `qualification`: Medical qualifications and credentials
- `hospital`: Associated hospital/clinic
- `available_hours`: JSONB object containing:
  - `working_days`: Array of working days ['mon', 'tue', 'wed', etc.]
  - `working_hours`: Object with day keys containing start/end times
  - `break_times`: Object with day keys containing break periods
  - `consultation_modes`: Array of consultation types ['online', 'in-clinic']
  - `slot_interval_minutes`: Duration of appointment slots (typically 30)

**Example `available_hours` Structure:**
```json
{
  "working_days": ["mon", "tue", "wed", "thu", "fri"],
  "working_hours": {
    "mon": {"start": "09:00", "end": "17:00"},
    "tue": {"start": "09:00", "end": "17:00"},
    "wed": {"start": "09:00", "end": "17:00"},
    "thu": {"start": "09:00", "end": "17:00"},
    "fri": {"start": "09:00", "end": "17:00"},
    "sat": {"start": "10:00", "end": "14:00"},
    "sun": null
  },
  "break_times": {
    "mon": [],
    "tue": [],
    ...
  },
  "consultation_modes": ["online", "in-clinic"],
  "slot_interval_minutes": 30
}
```

**Relationships:**
- Primary key references `users.user_id`
- Referenced by `appointments` table
- Referenced by `doctor_notifications` table

---

#### 4. **Appointments Table**

Stores appointment bookings between patients and doctors.

```sql
CREATE TABLE public.appointments (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  visit_type TEXT DEFAULT 'in-clinic' CHECK (visit_type IN ('online', 'in-clinic')),
  consultation_reason TEXT,
  consultation_fee INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `appointment_id`: Unique identifier (UUID)
- `patient_id`: Foreign key to patients.patient_id
- `doctor_id`: Foreign key to doctors.doctor_id
- `appointment_date`: Date of appointment (YYYY-MM-DD format)
- `appointment_time`: Time of appointment (HH:MM:SS format)
- `status`: Current status - 'scheduled', 'completed', 'cancelled', 'confirmed'
- `visit_type`: 'online' or 'in-clinic'
- `consultation_reason`: Reason for the appointment (patient's chief complaint)
- `consultation_fee`: Fee charged for this appointment
- `notes`: Additional notes from doctor or patient
- `created_at`: When appointment was booked
- `updated_at`: When appointment was last modified

**Indexes:**
- `idx_appointments_patient_date`: Optimizes queries for patient appointments by date
- `idx_appointments_doctor_date`: Optimizes queries for doctor appointments by date

**Relationships:**
- References `patients.patient_id`
- References `doctors.doctor_id`

---

#### 5. **Medicine Reminders Table**

Stores medicine reminders for patients.

```sql
CREATE TABLE public.medicine_reminders (
  reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  reminder_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);
```

**Columns:**
- `reminder_id`: Unique identifier (UUID)
- `patient_id`: Foreign key to patients.patient_id
- `medicine_name`: Name of the medicine
- `dosage`: Dosage (e.g., "500mg", "2 tablets")
- `reminder_time`: Time to remind (HH:MM:SS format)
- `status`: 'pending', 'active', 'completed', 'skipped'

**Index:**
- `idx_reminders_patient`: Optimizes queries for patient reminders

**Relationships:**
- References `patients.patient_id`

---

#### 6. **Activities Table**

Tracks patient health activities and events.

```sql
CREATE TABLE public.activities (
  activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `activity_id`: Unique identifier (UUID)
- `patient_id`: Foreign key to patients.patient_id
- `activity_type`: Type of activity (e.g., 'appointment_booked', 'medicine_taken', 'report_uploaded', 'appointment_completed')
- `description`: Human-readable description of the activity
- `activity_time`: When the activity occurred

**Index:**
- `idx_activities_patient_time`: Optimizes queries for patient activities sorted by time

**Example Activity Types:**
- `appointment_booked`: Patient scheduled an appointment
- `appointment_cancelled`: Patient cancelled an appointment
- `appointment_completed`: Doctor marked appointment as complete
- `medicine_taken`: Patient logged medicine intake
- `report_uploaded`: Patient uploaded a medical report
- `reminder_created`: New medicine reminder created
- `health_goal_achieved`: Patient achieved a health milestone

**Relationships:**
- References `patients.patient_id`

---

#### 7. **Medical Reports Table**

Stores metadata for medical reports uploaded by patients.

```sql
CREATE TABLE public.medical_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `report_id`: Unique identifier (UUID)
- `patient_id`: Foreign key to patients.patient_id
- `file_name`: Original file name
- `file_path`: Path where file is stored (relative to `/uploads/reports/`)
- `mime_type`: MIME type (e.g., 'application/pdf', 'image/jpeg')
- `created_at`: When file was uploaded

**Relationships:**
- References `patients.patient_id`

---

#### 8. **Doctor Notifications Table**

Stores notifications for doctors.

```sql
CREATE TABLE public.doctor_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `notification_id`: Unique identifier (UUID)
- `doctor_id`: Foreign key to doctors.doctor_id
- `title`: Notification title
- `message`: Notification message content
- `type`: Notification type ('info', 'alert', 'reminder', 'report')
- `is_read`: Whether notification has been read
- `created_at`: When notification was created

**Index:**
- `idx_doctor_notifications_doctor_created`: Optimizes queries for doctor notifications sorted by creation date

**Example Notifications:**
- Lab result received from patient
- Patient reminder sent
- Appointment reminder
- System alerts

**Relationships:**
- References `doctors.doctor_id`

---

### Database Indexes

Strategic indexes for optimal query performance:

```sql
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_appointments_patient_date ON public.appointments(patient_id, appointment_date);
CREATE INDEX idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX idx_reminders_patient ON public.medicine_reminders(patient_id);
CREATE INDEX idx_activities_patient_time ON public.activities(patient_id, activity_time DESC);
CREATE INDEX idx_doctor_notifications_doctor_created ON public.doctor_notifications(doctor_id, created_at DESC);
```

---

## API Routes & Connections

### Base Configuration

- **Backend URL:** `http://localhost:5000` (development)
- **Frontend Origin:** `http://localhost:5173` (Vite dev server)
- **AI Service URL:** `http://localhost:8001` (Flask service)
- **Database:** PostgreSQL running on `localhost:5432`

### Environment Variables

```bash
# Backend (.env.local or .env)
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=clinixone
JWT_SECRET=clinix-dev-secret
AI_SERVICE_URL=http://localhost:8001
FRONTEND_ORIGIN=http://localhost:5173
```

### API Endpoints

#### **1. Health Check**

```
GET /api/health
```

- **Description:** Checks server and database connectivity
- **Authentication:** Not required
- **Response:** `{ "status": "ok" }`
- **Status Code:** 200 OK

---

#### **2. Authentication Endpoints**

##### **Register User**

```
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123",
  "role": "patient" // or "doctor"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "patient"
    }
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

**Status Codes:**
- 201 Created: User successfully registered
- 400 Bad Request: Missing required fields
- 409 Conflict: Email already exists

---

##### **Login User**

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "patient" // optional, for filtering
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "patient"
    }
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

**Status Codes:**
- 200 OK: Login successful
- 401 Unauthorized: Invalid credentials
- 404 Not Found: User not found

---

##### **Logout User**

```
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- 200 OK: Logout successful
- 401 Unauthorized: Missing or invalid token

---

#### **3. Doctor Discovery & Availability**

##### **Search Doctors**

```
GET /api/doctors
GET /api/doctors?search=cardiologist
```

**Query Parameters:**
- `search` (optional): Search term for doctor name, specialization, or hospital

**Response:**
```json
[
  {
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiologist",
    "experience": 10,
    "rating": 4.8,
    "consultation_fee": 500,
    "qualification": "MD, Cardiology Specialist",
    "hospital": "City General Hospital",
    "available_hours": {...}
  }
]
```

**Status Codes:**
- 200 OK: Doctors retrieved
- 500 Internal Server Error: Database error

---

##### **Get Doctor Availability Slots**

```
GET /api/doctors/{doctorId}/slots?date=2024-05-15
```

**Path Parameters:**
- `doctorId`: UUID of the doctor

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "date": "2024-05-15",
  "available_slots": [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00"
  ]
}
```

**Status Codes:**
- 200 OK: Slots retrieved
- 400 Bad Request: Invalid date format
- 404 Not Found: Doctor not found

---

#### **4. Appointment Management**

##### **Check Slot Availability**

```
POST /api/appointments/check-slot
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "appointment_date": "2024-05-15",
  "appointment_time": "09:00"
}
```

**Response:**
```json
{
  "available": true
}
```

**Status Codes:**
- 200 OK: Slot availability checked
- 400 Bad Request: Invalid parameters

---

##### **Get Patient Appointments**

```
GET /api/patient/appointments?patient_id=550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer {token}
```

**Query Parameters:**
- `patient_id`: UUID of the patient (required)

**Response:**
```json
[
  {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440003",
    "patient_id": "550e8400-e29b-41d4-a716-446655440002",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "doctor_name": "Dr. Sarah Johnson",
    "specialization": "Cardiologist",
    "appointment_date": "2024-05-15",
    "appointment_time": "09:00",
    "status": "scheduled",
    "visit_type": "in-clinic",
    "consultation_reason": "Routine checkup",
    "consultation_fee": 500,
    "created_at": "2024-05-01T10:00:00Z"
  }
]
```

**Status Codes:**
- 200 OK: Appointments retrieved
- 401 Unauthorized: Invalid token

---

##### **Book Appointment**

```
POST /api/patient/appointments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440002",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "appointment_date": "2024-05-15",
  "appointment_time": "09:00",
  "visit_type": "in-clinic",
  "consultation_reason": "Routine checkup"
}
```

**Response:**
```json
{
  "appointment_id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "scheduled",
  "message": "Appointment booked successfully"
}
```

**Status Codes:**
- 201 Created: Appointment created
- 400 Bad Request: Invalid parameters or slot unavailable
- 401 Unauthorized: Invalid token
- 409 Conflict: Slot already taken

---

##### **Cancel Appointment**

```
PATCH /api/patient/appointments/{appointmentId}/cancel
Authorization: Bearer {token}
```

**Response:**
```json
{
  "appointment_id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "cancelled",
  "message": "Appointment cancelled successfully"
}
```

**Status Codes:**
- 200 OK: Appointment cancelled
- 400 Bad Request: Invalid appointment ID
- 401 Unauthorized: Invalid token

---

#### **5. Medicine Reminders**

##### **Get Patient Reminders**

```
GET /api/patient/reminders?patient_id=550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "reminder_id": "550e8400-e29b-41d4-a716-446655440004",
    "patient_id": "550e8400-e29b-41d4-a716-446655440002",
    "medicine_name": "Aspirin",
    "dosage": "500mg",
    "reminder_time": "08:00",
    "status": "active"
  }
]
```

---

##### **Create Reminder**

```
POST /api/patient/reminders
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440002",
  "medicine_name": "Aspirin",
  "dosage": "500mg",
  "reminder_time": "08:00"
}
```

**Response:**
```json
{
  "reminder_id": "550e8400-e29b-41d4-a716-446655440004",
  "status": "active",
  "message": "Reminder created successfully"
}
```

---

##### **Update Reminder Status**

```
PATCH /api/patient/reminders/{reminderId}/status
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "reminder_id": "550e8400-e29b-41d4-a716-446655440004",
  "status": "completed"
}
```

---

#### **6. Patient Activities**

##### **Get Patient Activities**

```
GET /api/patient/activities?patient_id=550e8400-e29b-41d4-a716-446655440002&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `patient_id`: UUID of patient
- `limit` (optional): Maximum number of activities (default: 20)

**Response:**
```json
[
  {
    "activity_id": "550e8400-e29b-41d4-a716-446655440005",
    "patient_id": "550e8400-e29b-41d4-a716-446655440002",
    "activity_type": "appointment_booked",
    "description": "Appointment booked with Dr. Sarah Johnson on May 15, 2024",
    "activity_time": "2024-05-01T10:00:00Z"
  }
]
```

---

##### **Create Activity**

```
POST /api/patient/activities
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440002",
  "activity_type": "medicine_taken",
  "description": "Took Aspirin 500mg as prescribed"
}
```

---

#### **7. Medical Reports**

##### **Get Patient Reports**

```
GET /api/patient/reports?userId=550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "report_id": "550e8400-e29b-41d4-a716-446655440006",
    "patient_id": "550e8400-e29b-41d4-a716-446655440002",
    "file_name": "blood-test-april-2024.pdf",
    "file_path": "/uploads/reports/1714572000000-blood-test-april-2024.pdf",
    "mime_type": "application/pdf",
    "created_at": "2024-05-01T10:00:00Z"
  }
]
```

---

##### **Upload Medical Report**

```
POST /api/patient/reports
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `userId`: UUID of patient
- `file`: File to upload (PDF, JPG, PNG, etc.)

**Response:**
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440006",
  "file_name": "blood-test-april-2024.pdf",
  "file_path": "/uploads/reports/1714572000000-blood-test-april-2024.pdf",
  "message": "Report uploaded successfully"
}
```

**Status Codes:**
- 201 Created: File uploaded
- 400 Bad Request: Invalid file
- 413 Payload Too Large: File exceeds 2MB limit

---

#### **8. Doctor Dashboard**

##### **Get Doctor Dashboard**

```
GET /api/doctor/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "summary": {
    "today_appointments": 8,
    "unique_patients": 24,
    "unread_notifications": 3,
    "high_no_show_risk": 2
  },
  "appointments": [
    {
      "appointment_id": "550e8400-e29b-41d4-a716-446655440003",
      "patient_id": "550e8400-e29b-41d4-a716-446655440002",
      "patient_name": "John Doe",
      "appointment_date": "2024-05-15",
      "appointment_time": "09:00",
      "status": "scheduled",
      "visit_type": "in-clinic",
      "consultation_reason": "Routine checkup",
      "no_show_risk": {
        "probability": 0.25,
        "label": "Low",
        "source": "xgboost"
      }
    }
  ],
  "notifications": [
    {
      "notification_id": "550e8400-e29b-41d4-a716-446655440007",
      "title": "Lab Result",
      "message": "Lab report received from patient John Doe",
      "type": "report",
      "is_read": false,
      "created_at": "2024-05-15T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
- 200 OK: Dashboard data retrieved
- 401 Unauthorized: Invalid token or not a doctor
- 403 Forbidden: Access denied

---

##### **Send Appointment Reminder**

```
POST /api/doctor/appointments/{appointmentId}/send-reminder
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Reminder sent successfully",
  "activity_id": "550e8400-e29b-41d4-a716-446655440008"
}
```

---

##### **Get Appointment Summary**

```
GET /api/doctor/appointments/{appointmentId}/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "appointment": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440003",
    "appointment_date": "2024-05-15",
    "appointment_time": "09:00",
    "status": "scheduled"
  },
  "patient": {
    "patient_id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "John Doe",
    "age": 35,
    "gender": "Male",
    "medical_history": "Hypertension, managed with medication"
  },
  "history": [
    {
      "activity_type": "appointment_completed",
      "description": "Routine checkup completed",
      "activity_time": "2024-04-15T10:30:00Z"
    }
  ]
}
```

---

##### **Mark Notification as Read**

```
PATCH /api/doctor/notifications/{notificationId}/read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "notification_id": "550e8400-e29b-41d4-a716-446655440007",
  "is_read": true
}
```

---

#### **9. Doctor Availability Schedule**

##### **Get Doctor Availability Schedule**

```
GET /api/doctor/availability/{doctorId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "available_hours": {
    "working_days": ["mon", "tue", "wed", "thu", "fri"],
    "working_hours": {
      "mon": {"start": "09:00", "end": "17:00"},
      "tue": {"start": "09:00", "end": "17:00"},
      "wed": {"start": "09:00", "end": "17:00"},
      "thu": {"start": "09:00", "end": "17:00"},
      "fri": {"start": "09:00", "end": "17:00"},
      "sat": {"start": "10:00", "end": "14:00"},
      "sun": null
    },
    "break_times": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "consultation_modes": ["online", "in-clinic"],
    "slot_interval_minutes": 30
  }
}
```

---

##### **Update Doctor Availability Schedule**

```
PATCH /api/doctor/availability
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "available_hours": {
    "working_days": ["mon", "tue", "wed", "thu", "fri", "sat"],
    "working_hours": {
      "mon": {"start": "08:00", "end": "18:00"},
      "tue": {"start": "08:00", "end": "18:00"},
      "wed": {"start": "08:00", "end": "18:00"},
      "thu": {"start": "08:00", "end": "18:00"},
      "fri": {"start": "08:00", "end": "18:00"},
      "sat": {"start": "10:00", "end": "16:00"},
      "sun": null
    },
    "break_times": {
      "mon": [{"start": "12:00", "end": "13:00"}],
      "tue": [{"start": "12:00", "end": "13:00"}],
      "wed": [{"start": "12:00", "end": "13:00"}],
      "thu": [{"start": "12:00", "end": "13:00"}],
      "fri": [{"start": "12:00", "end": "13:00"}],
      "sat": [],
      "sun": []
    },
    "consultation_modes": ["online", "in-clinic"],
    "slot_interval_minutes": 30
  }
}
```

**Response:**
```json
{
  "message": "Availability schedule updated successfully",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

#### **10. Admin Dashboard**

##### **Get Admin Dashboard**

```
GET /api/admin/dashboard
Authorization: Bearer {token}
```

**Response (Minimal - To be expanded):**
```json
{
  "message": "Admin dashboard - features coming soon"
}
```

**Status Codes:**
- 200 OK: Access granted
- 403 Forbidden: Not an admin

---

### Authentication Header Format

All protected endpoints require the following header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE2MTYxNDU2MDB9.signature
```

The JWT token includes:
- `user_id`: UUID of the user
- `role`: User role (patient/doctor/admin)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (optional)

---

## Frontend Structure

### Directory Organization

```
src/
├── main.jsx                    # Entry point for React app
├── App.jsx                     # Main app router and layout
├── App.css                     # Global styles
├── index.css                   # Base styles and Tailwind directives
├── pages/                      # Page components for routes
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx       # Patient dashboard with sub-routes
│   ├── DoctorDashboardPage.jsx
│   └── AdminDashboardPage.jsx
├── components/                 # Reusable React components
│   ├── appointment/            # Appointment booking flow
│   │   ├── AppointmentSummary.jsx
│   │   ├── BookingFlow.jsx
│   │   ├── ConfirmationModal.jsx
│   │   ├── DoctorCard.jsx
│   │   └── TimeSlotSelector.jsx
│   ├── auth/                   # Authentication pages
│   │   ├── AuthRoleIllustration.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── dashboard/              # Dashboard components
│   │   ├── ActivityFeed.jsx
│   │   ├── AdherenceProgress.jsx
│   │   ├── AppointmentCard.jsx
│   │   ├── AppointmentsCard.jsx
│   │   ├── MedicineReminder.jsx
│   │   ├── MedicineReminderCard.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── QuickActions.jsx
│   │   └── RecentActivity.jsx
│   ├── doctor/                 # Doctor-specific components
│   │   └── AvailabilityScheduleEditor.jsx
│   ├── landing/                # Landing page components
│   │   ├── Background3D.jsx
│   │   ├── Hero.jsx
│   │   ├── Hyperspeed.jsx
│   │   ├── HyperspeedBackground.jsx
│   │   ├── hyperspeedPresets.js
│   │   ├── LandingPage.jsx
│   │   ├── Navbar.jsx
│   │   └── Welcome.jsx
│   ├── layout/                 # Layout wrapper components
│   │   ├── FlowingMenu.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   └── ui/                     # Reusable UI components
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── ProgressBar.jsx
│       └── Skeleton.jsx
├── hooks/                      # Custom React hooks
│   ├── useActivities.js
│   ├── useAppointments.js
│   ├── useAuth.js
│   └── useReminders.js
├── services/                   # API communication layer
│   ├── activityService.js
│   ├── adminService.js
│   ├── appointmentService.js
│   ├── authService.js
│   ├── doctorAvailabilityService.js
│   ├── doctorDashboardService.js
│   ├── reminderService.js
│   └── reportService.js
├── utils/                      # Utility functions
│   └── doctorSchedule.js
└── assets/                     # Static assets

public/                         # Static files served publicly
Landing Page/                   # Separate landing page project
```

### Key Components Overview

#### **Pages**

- **DashboardPage.jsx**: Patient dashboard with nested routes for appointments, reminders, history, reports, and settings
- **DoctorDashboardPage.jsx**: Doctor's view with appointments table, notifications, and no-show risk indicators
- **AdminDashboardPage.jsx**: Admin control center (minimal implementation)
- **LoginPage.jsx**: User authentication interface
- **RegisterPage.jsx**: New user registration interface

#### **Components Organization by Feature**

**Appointment Flow:**
- `AppointmentSummary.jsx`: Display appointment details
- `BookingFlow.jsx`: Multi-step appointment booking wizard
- `ConfirmationModal.jsx`: Appointment confirmation dialog
- `DoctorCard.jsx`: Doctor information card in search results
- `TimeSlotSelector.jsx`: Calendar and time slot selection

**Patient Dashboard:**
- `PatientDashboard.jsx`: Main patient dashboard container
- `AppointmentsCard.jsx`: Upcoming appointments summary
- `MedicineReminderCard.jsx`: Medicine reminder card
- `MedicineReminder.jsx**: Medicine reminder management
- `ActivityFeed.jsx`: Recent health activities log
- `AdherenceProgress.jsx`: Medicine adherence statistics
- `AppointmentCard.jsx`: Individual appointment card
- `QuickActions.jsx`: Quick action buttons (book appointment, view history)
- `RecentActivity.jsx`: Recent activity timeline

**Doctor Dashboard:**
- `AvailabilityScheduleEditor.jsx`: Schedule configuration interface

**Layout:**
- `Sidebar.jsx`: Navigation sidebar
- `Header.jsx`: Page header
- `FlowingMenu.jsx`: Animated menu component

**UI Components:**
- `Button.jsx`: Reusable button component
- `Card.jsx`: Reusable card wrapper
- `ProgressBar.jsx`: Progress indicator
- `Skeleton.jsx`: Loading skeleton

### Custom Hooks

**useAuth.js**
- Manages authentication state
- Handles login/logout
- Stores token and user info in localStorage
- Provides auth context to components

**useAppointments.js**
- Fetches patient appointments
- Handles appointment booking
- Manages appointment cancellation
- Updates local state

**useReminders.js**
- Manages medicine reminders
- CRUD operations for reminders
- Updates reminder status

**useActivities.js**
- Fetches patient activities
- Displays recent health events
- Formats activity data

### Services (API Layer)

Each service encapsulates API calls for a specific domain:

- **authService.js**: Register, login, logout
- **appointmentService.js**: Booking, searching, cancellation
- **doctorDashboardService.js**: Doctor appointment data, notifications
- **reminderService.js**: Reminder CRUD operations
- **activityService.js**: Fetch patient activities
- **reportService.js**: Upload and retrieve medical reports
- **adminService.js**: Admin dashboard data
- **doctorAvailabilityService.js**: Doctor schedule management

### Styling

- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Custom CSS**: Additional custom styles in `App.css` and `index.css`
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode Support**: Can be enabled via Tailwind configuration

---

## Backend Structure

### Server Architecture

```
server/
├── index.js              # Main Express server file
├── setupDatabase.js      # Database initialization script
└── uploads/
    └── reports/          # Medical report file storage
```

### Express Server Configuration

**server/index.js** contains:

1. **Middleware Setup**
   - CORS configuration for frontend origin
   - JSON body parser (2MB limit)
   - Morgan HTTP logger
   - Static file serving for uploads

2. **Database Connection**
   - PostgreSQL pool configuration
   - Connection error handling

3. **Authentication Middleware**
   - JWT verification
   - Bearer token extraction
   - Role-based access control

4. **Helper Functions**
   - Doctor schedule normalization
   - Time slot generation
   - Date conversion utilities

5. **Route Handlers**
   - All API endpoints documented in API Routes section

### Database Setup

**server/setupDatabase.js**
- Connects to PostgreSQL
- Executes schema.sql to create tables
- Sets up indexes
- Seeds initial data (optional)

Run with: `npm run db:setup`

### File Upload Handling

**Multer Configuration**
- Destination: `server/uploads/reports/`
- File naming: `{timestamp}-{original-name}`
- Size limit: 2MB (configurable)
- Accessible via: `/uploads/reports/{filename}`

### Security Implementation

1. **Password Hashing**
   - bcryptjs with 10 salt rounds
   - Password never stored in plain text

2. **JWT Authentication**
   - Token expiration (configurable)
   - Secret key from environment variable
   - Bearer token format

3. **Role-Based Authorization**
   - Middleware checks user role
   - Restricts endpoints by role
   - Admin endpoints protected

4. **CORS Policy**
   - Whitelist specific origins
   - Credentials enabled
   - Prevents unauthorized cross-origin requests

5. **Input Validation**
   - Required field checks
   - Email format validation
   - Data type validation

---

## Authentication & Authorization

### Session Management

**Frontend Session Storage (localStorage)**
- `clinix_session_token`: JWT access token
- `clinix_user_role`: User role (patient/doctor/admin)
- `clinix_user_name`: User's full name
- `clinix_patient_id`: Patient UUID (patients only)
- `clinix_pending_email`: Registration flow
- `clinix_pending_role`: Registration flow
- `clinix_remember_me`: Remember me preference
- `clinix_register_cooldown_until`: Registration rate limiting

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "patient",
  "iat": 1616145600,
  "exp": 1616232000
}

Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

### Role-Based Access Control (RBAC)

**Patient Role**
- Can access: `/dashboard`, `/dashboard/*`, patient APIs
- Cannot access: `/doctor-dashboard`, `/admin-dashboard`
- Permissions: Book appointments, manage reminders, upload reports, view activities

**Doctor Role**
- Can access: `/doctor-dashboard`, doctor APIs
- Cannot access: `/dashboard`, `/admin-dashboard`
- Permissions: View appointments, send reminders, manage availability, view notifications

**Admin Role**
- Can access: `/admin-dashboard`, admin APIs
- Cannot access: `/dashboard`, `/doctor-dashboard` (optional)
- Permissions: View system metrics, manage users (when implemented), manage clinic operations

### Route Protection

**Frontend Route Guard (`src/App.jsx`)**
```javascript
// Pseudo-code showing route protection logic
const isAuthenticated = localStorage.getItem('clinix_session_token')
const userRole = localStorage.getItem('clinix_user_role')

if (!isAuthenticated) redirect to /login
if (route requires role && userRole !== required_role) redirect to role-specific home
```

**Backend Middleware**
```javascript
// JWT verification middleware
authRequired(req, res, next)
- Extracts bearer token from Authorization header
- Verifies JWT signature
- Returns 401 if invalid or expired
- Passes decoded token to req.auth

// Role checking middleware
roleRequired(['patient', 'doctor'])
- Checks req.auth.role
- Returns 403 if not authorized
- Allows request to proceed if authorized
```

---

## Sprint 1: User Stories 1-3

### Overview

Sprint 1 focuses on the **core patient engagement features** and **doctor dashboard essentials**. This sprint establishes the foundation for patient-doctor interaction and appointment management.

**Duration:** 2-3 weeks (estimated)  
**Team Members:** Frontend (2-3), Backend (1-2), QA (1)  
**User Stories:** US 1, US 2, US 3

---

### User Story 1: View Patient Health Dashboard

#### Story Description

**As a patient, I want to view a personalized health dashboard with appointments, medicine reminders, and activity updates so that I can monitor my healthcare activities and manage my treatment schedule effectively.**

#### Business Value

- **Centralized Information**: Patients get a single view of all healthcare-related information
- **Improved Engagement**: Regular dashboard visits encourage treatment adherence
- **Quick Access**: Essential health information readily available
- **Trust Building**: Transparent health information builds patient trust

#### Acceptance Criteria

1. **Given** that I am a patient  
   **When** I log into the ClinixOne platform  
   **Then** I should see my personalized dashboard displaying upcoming appointments and health information  
   **And** the dashboard should load within 2 seconds

2. **Given** that I have medicine reminders scheduled  
   **When** I open the dashboard  
   **Then** the system should display my medicine schedule with toggle reminders  
   **And** each reminder should show medicine name, dosage, and reminder time

3. **Given** that I have recent medical activities  
   **When** I view the dashboard  
   **Then** the system should display my recent activity such as appointments, prescriptions, or reports uploaded  
   **And** activities should be sorted by most recent first  
   **And** at least the last 20 activities should be displayed

4. **Given** that I want quick access to services  
   **When** I view the dashboard  
   **Then** I should see quick action options such as booking an appointment or viewing medical history  
   **And** quick actions should have clear call-to-action buttons

#### Linked Tasks

1. **#DesignPatientDashboardUI**
   - Create wireframes for patient dashboard
   - Define color scheme and typography
   - Design responsive layouts for mobile/tablet/desktop
   - Deliverable: Figma/Adobe XD design files

2. **#ImplementDashboardLayout**
   - Create React component: `PatientDashboard.jsx`
   - Implement Sidebar navigation with menu items
   - Build responsive grid layout
   - Implement responsive Tailwind CSS styling
   - Create reusable Card components

3. **#FetchUpcomingAppointmentsAPI**
   - Create backend endpoint: `GET /api/patient/appointments`
   - Implement database queries with proper date filtering
   - Test slot availability checking logic
   - Cache mechanism for frequently accessed data (optional)

4. **#ImplementMedicineReminderComponent**
   - Create `MedicineReminderCard.jsx` component
   - Implement toggle reminder status functionality
   - Design reminder display with medicine details
   - Add edit/delete reminder options
   - Connect to `useReminders` hook

5. **#DevelopMedicineAdherenceProgressBar**
   - Create `AdherenceProgress.jsx` component
   - Calculate adherence percentage (reminders taken / total reminders)
   - Visualize with progress bar component
   - Show adherence statistics
   - Time-based filtering (weekly/monthly)

6. **#CreateRecentActivityFeed**
   - Create `ActivityFeed.jsx` component
   - Fetch patient activities from `GET /api/patient/activities`
   - Format and display activities in timeline format
   - Implement infinite scroll or pagination
   - Add activity type icons and descriptions

7. **#ImplementQuickActionsSection**
   - Create `QuickActions.jsx` component
   - Add buttons: "Book Appointment", "View Reports", "Edit Profile"
   - Implement click handlers for navigation
   - Use responsive button layouts

8. **#IntegrateDashboardWithBackendServices**
   - Create `useAppointments` hook for appointment data
   - Create `useReminders` hook for reminder management
   - Create `useActivities` hook for activity feed
   - Implement error handling and loading states
   - Add retry logic for failed requests

#### Technical Implementation Details

**Frontend Implementation:**

```
Components to Create:
- src/pages/DashboardPage.jsx (Main container)
- src/components/dashboard/PatientDashboard.jsx (Content)
- src/components/dashboard/AppointmentsCard.jsx (Upcoming appointments)
- src/components/dashboard/MedicineReminderCard.jsx (Individual reminder)
- src/components/dashboard/MedicineReminder.jsx (Reminder list)
- src/components/dashboard/AdherenceProgress.jsx (Progress bar)
- src/components/dashboard/ActivityFeed.jsx (Activity timeline)
- src/components/dashboard/QuickActions.jsx (Action buttons)
- src/components/layout/Sidebar.jsx (Navigation)

Hooks to Create:
- src/hooks/useAppointments.js
- src/hooks/useReminders.js
- src/hooks/useActivities.js
- src/hooks/useAuth.js (Existing)

Services to Create:
- src/services/appointmentService.js
- src/services/reminderService.js
- src/services/activityService.js
```

**Backend Implementation:**

```
Endpoints to Create:
- GET /api/patient/appointments - Fetch upcoming appointments
- GET /api/patient/reminders - Fetch medicine reminders
- GET /api/patient/activities - Fetch recent activities
- POST /api/patient/reminders - Create reminder
- PATCH /api/patient/reminders/:id/status - Update reminder
- POST /api/patient/activities - Log activity

Database Queries:
- Select appointments where appointment_date >= TODAY
- Select reminders for patient_id
- Select activities ordered by activity_time DESC
- Join with doctor/user tables for additional info
```

**Data Flow:**

1. User logs in → Stored in localStorage with patient_id
2. DashboardPage mounts → Fetches data from 3 hooks
3. Hooks call corresponding services
4. Services make API calls with JWT token
5. Backend queries database and returns data
6. Components render data with conditional loading/error states

#### Estimation

- **Effort:** Hard (40-50 story points)
- **Frontend:** 20-25 hours
- **Backend:** 15-20 hours
- **Testing:** 10-15 hours
- **Total:** 45-60 hours

#### Acceptance Testing

- [ ] Dashboard loads within 2 seconds
- [ ] All upcoming appointments display correctly
- [ ] Medicine reminders show with accurate times
- [ ] Activity feed displays last 20 activities
- [ ] Quick actions navigate to correct pages
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1920px)
- [ ] Error states display gracefully (no internet, API timeout)
- [ ] Loading states show while data fetches

---

### User Story 2: Book Doctor Appointment

#### Story Description

**As a patient, I want to search for doctors, select a time slot, and confirm an appointment online so that I can schedule medical consultations conveniently and efficiently.**

#### Business Value

- **Convenience**: Appointment booking available 24/7
- **Efficiency**: Reduces phone calls and clinic visits for scheduling
- **Better Doctor Selection**: Patients can compare doctors by specialization and ratings
- **Time Management**: Clear visualization of available slots
- **Reduced No-Shows**: Confirmation workflow reduces missed appointments

#### Acceptance Criteria

1. **Given** that I am a patient  
   **When** I search for a doctor by name or specialization  
   **Then** the system should display a list of available doctors with their details  
   **And** search should work case-insensitively  
   **And** results should filter in real-time as I type

2. **Given** that I have selected a doctor  
   **When** I choose a date and time slot  
   **Then** the system should update the appointment summary accordingly  
   **And** the system should prevent selection of past dates  
   **And** time slots should only show doctor's available hours

3. **Given** that I have entered my patient information and consultation reason  
   **When** I click the Confirm Appointment button  
   **Then** the system should successfully book the appointment and show a confirmation message  
   **And** the appointment should appear on my dashboard  
   **And** I should receive a confirmation (optional: email/SMS)

4. **Given** that an appointment is successfully booked  
   **When** I return to the dashboard  
   **Then** the system should display the appointment under upcoming appointments  
   **And** the appointment status should be "scheduled"

#### Linked Tasks

1. **#DesignDoctorSelectionInterface**
   - Create wireframes for doctor search and selection
   - Design doctor card layout with key information
   - Design filters/sorting options
   - Deliverable: UI mockups

2. **#ImplementDoctorSearchAndFilter**
   - Create `BookingFlow.jsx` component (Multi-step form)
   - Implement search bar with debouncing
   - Add filter options: specialization, rating, hospital
   - Use `useAppointments` hook for search

3. **#DevelopDoctorListComponent**
   - Create `DoctorCard.jsx` component
   - Display: Name, specialization, experience, rating, consultation fee, hospital
   - Add "Select" button to move to next step
   - Implement responsive card layout

4. **#ImplementCalendarDateSelector**
   - Integrate calendar library or create custom calendar
   - Prevent selection of past dates
   - Highlight available dates based on doctor's working days
   - Show selected date in appointment summary

5. **#CreateTimeSlotSelectionModule**
   - Create `TimeSlotSelector.jsx` component
   - Fetch available slots from API endpoint
   - Display in grid format (9AM, 9:30AM, 10AM, etc.)
   - Disable already-booked slots
   - Highlight selected time slot

6. **#DevelopVisitTypeSelection (Online / In-Clinic)**
   - Add radio buttons or toggle for visit type
   - Filter available times based on doctor's consultation modes
   - Store selection in form state

7. **#CreatePatientInformationForm**
   - Collect: Consultation reason (required), additional notes (optional)
   - Validate required fields
   - Show patient's existing information (pre-filled)

8. **#ImplementAppointmentSummarySection**
   - Create `AppointmentSummary.jsx` component
   - Display all appointment details for review
   - Show appointment date, time, doctor, visit type, reason
   - Allow "Edit" to go back to previous steps

9. **#IntegrateAppointmentBookingAPI**
   - Backend endpoint: `POST /api/patient/appointments`
   - Implement conflict checking (slot already booked)
   - Transaction handling for consistency
   - Return confirmation with appointment ID

10. **#DevelopAppointmentConfirmationWorkflow**
    - Create `ConfirmationModal.jsx` component
    - Show success message with appointment details
    - Button to return to dashboard
    - Display confirmation number/ID
    - Optional: Generate and show printable confirmation

#### Technical Implementation Details

**Frontend Implementation:**

```
Components to Create:
- src/components/appointment/BookingFlow.jsx (Main wizard)
- src/components/appointment/DoctorCard.jsx (Doctor selection)
- src/components/appointment/TimeSlotSelector.jsx (Slots)
- src/components/appointment/AppointmentSummary.jsx (Review)
- src/components/appointment/ConfirmationModal.jsx (Confirmation)

Hooks to Update:
- src/hooks/useAppointments.js (Add booking functionality)

Services to Create:
- Extend src/services/appointmentService.js
  - searchDoctors(searchTerm)
  - getAvailableSlots(doctorId, date)
  - bookAppointment(appointmentData)
```

**Data Flow for Booking:**

```
Step 1: Doctor Search
- User types in search bar
- Input debounced (300ms)
- API call: GET /api/doctors?search=term
- Display results as DoctorCards

Step 2: Date Selection
- User opens calendar
- Select date (must be future date)
- Check if doctor works that day (working_days)
- API call: GET /api/doctors/{id}/slots?date=2024-05-15
- Display available time slots

Step 3: Time Selection
- User selects from available slots
- Display appointment summary with selected info

Step 4: Consultation Info
- User enters reason and notes
- Validates required fields

Step 5: Confirmation
- Shows full appointment details
- User clicks "Confirm"
- API call: POST /api/patient/appointments
- On success: Show confirmation modal
- Redirect to dashboard after 3 seconds
```

**Backend Implementation:**

```
Endpoints:
1. GET /api/doctors?search=term
   - Search across name, specialization, hospital
   - Return doctor list with all details

2. GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD
   - Generate slots from available_hours
   - Check against existing appointments
   - Return array of available times

3. POST /api/appointments/check-slot
   - Check if slot is available
   - Prevent double-booking

4. POST /api/patient/appointments
   - Validate all inputs
   - Check slot availability again (prevent race condition)
   - Create appointment record
   - Log activity: "appointment booked"
   - Return appointment details

Slot Generation Algorithm:
- Get doctor's available_hours for the day
- Check working_days includes the day
- Get start/end times for that day
- Generate 30-minute intervals (configurable)
- Remove break_times from available slots
- Query appointments table for that day
- Return slots not in appointment table
```

#### Estimation

- **Effort:** Hard (45-55 story points)
- **Frontend:** 25-30 hours
- **Backend:** 15-20 hours
- **Testing:** 10-15 hours
- **Total:** 50-65 hours

#### Acceptance Testing

- [ ] Search works with doctor name, specialization, hospital
- [ ] Doctor cards display all required information
- [ ] Calendar prevents past date selection
- [ ] Time slots show only doctor's working hours
- [ ] Slots exclude break times correctly
- [ ] Already-booked slots are disabled
- [ ] Appointment summary displays accurately
- [ ] Booking creates appointment in database
- [ ] Confirmation modal displays with appointment ID
- [ ] Appointment appears in dashboard immediately
- [ ] Form validation catches missing required fields
- [ ] Race condition handled (simultaneous bookings of same slot)

---

### User Story 3: View Doctor Dashboard and Appointment Overview

#### Story Description

**As a doctor, I want to view my daily appointments and AI no-show risk indicators on a dashboard so that I can manage my consultations effectively and reduce missed appointments.**

#### Business Value

- **Operational Efficiency**: Doctors can quickly see their day's schedule
- **Risk Mitigation**: AI predictions help identify likely no-shows
- **Proactive Measures**: Doctors can send timely reminders to at-risk patients
- **Patient Relationship**: Better preparation with patient history
- **Notifications**: Timely alerts about system events and lab results

#### Acceptance Criteria

1. **Given** that I am a doctor  
   **When** I log into the ClinixOne platform  
   **Then** I should see my personalized dashboard displaying today's appointments  
   **And** the dashboard should show date, time, patient name, and status for each appointment

2. **Given** that the system analyzes appointment patterns  
   **When** the dashboard loads  
   **Then** the system should display AI no-show risk indicators for each appointment  
   **And** each appointment should show risk as Low/Medium/High with probability percentage

3. **Given** that there are notifications such as new messages or lab results  
   **When** I open the dashboard  
   **Then** the system should display them in the notifications section  
   **And** unread notifications should be visually distinguished from read ones

4. **Given** that I want to take quick actions  
   **When** I use the Send Reminder or View Summary buttons  
   **Then** the system should perform the corresponding action successfully  
   **And** reminder should create notification in patient's activity feed

#### Linked Tasks

1. **#DesignDoctorDashboardUI**
   - Create dashboard mockups with appointment table
   - Design no-show risk indicator (color-coded)
   - Design notification panel
   - Design quick action buttons
   - Deliverable: UI mockups

2. **#ImplementDoctorDashboardLayout**
   - Create `DoctorDashboardPage.jsx`
   - Build responsive layout with main content and sidebar
   - Implement header with doctor info
   - Add logout button

3. **#FetchDoctorAppointmentsAPI**
   - Backend endpoint: `GET /api/doctor/dashboard`
   - Query appointments for today filtered by doctor_id
   - Include patient names and appointment details
   - Calculate no-show risk for each appointment

4. **#DisplayDailyAppointmentTable**
   - Create appointment table component
   - Display columns: Time, Patient Name, Type, Status, Risk Level
   - Sort by appointment time
   - Make table responsive (collapse columns on mobile)
   - Add row actions (Send Reminder, View Summary)

5. **#IntegrateAINoShowPrediction**
   - Call AI service endpoint: `POST /predict/no-show`
   - Pass features: patientNoShowRate, daysSinceLastVisit, appointmentHour, hasRecentLabResult
   - Display risk probability and label
   - Cache results to avoid repeated calls
   - Implement fallback heuristic if AI service unavailable

6. **#ImplementDoctorNotificationsPanel**
   - Create notifications display component
   - Show recent notifications (lab results, reminders sent, etc.)
   - Mark notifications as read
   - Show notification count badge on header

7. **#CreateQuickActionButtons**
   - "Send Reminder" button → POST /api/doctor/appointments/{id}/send-reminder
   - "View Summary" button → GET /api/doctor/appointments/{id}/summary
   - Modal dialogs for patient summary display

8. **#IntegrateDoctorDashboardWithBackend**
   - Create `doctorDashboardService.js`
   - Implement data fetching on component mount
   - Handle loading and error states
   - Implement auto-refresh (optional: every 5 minutes)

#### Technical Implementation Details

**Frontend Implementation:**

```
Components to Create:
- src/pages/DoctorDashboardPage.jsx (Main page)
- Appointment table component
- No-show risk indicator component
- Notifications panel component
- Patient summary modal

Hooks to Create:
- Custom hook for fetching doctor dashboard data
- Hook for managing notifications

Services to Create:
- src/services/doctorDashboardService.js
  - getDoctorDashboard()
  - sendReminder(appointmentId)
  - getAppointmentSummary(appointmentId)
  - markNotificationAsRead(notificationId)
```

**Backend Implementation:**

```
Endpoints:
1. GET /api/doctor/dashboard (role required: doctor)
   - Fetch today's appointments for logged-in doctor
   - Calculate no-show risk for each appointment
   - Fetch unread notifications
   - Return summary metrics (today's count, unique patients, etc.)

2. POST /api/doctor/appointments/{appointmentId}/send-reminder (role: doctor)
   - Create activity log entry for patient
   - Create notification for doctor
   - Return success response

3. GET /api/doctor/appointments/{appointmentId}/summary (role: doctor)
   - Fetch full appointment details
   - Fetch patient information (name, age, gender, medical history)
   - Fetch recent patient activities/history
   - Return comprehensive summary

4. PATCH /api/doctor/notifications/{notificationId}/read (role: doctor)
   - Mark notification as read
   - Update database

No-Show Prediction Logic:
- Features calculation:
  - patientNoShowRate: Count(no-show appointments) / Count(total appointments)
  - daysSinceLastVisit: Days since last completed appointment
  - appointmentHour: Hour of day (morning/afternoon effect)
  - hasRecentLabResult: Whether patient has recent lab results
  
- Call AI service with features:
  POST http://localhost:8001/predict/no-show
  Body: { features: [...] }
  
- Fallback heuristic if AI fails:
  - High risk if: noShowRate > 0.3 AND daysSinceLastVisit > 90
  - Medium risk if: noShowRate > 0.1 OR daysSinceLastVisit > 60
  - Low risk otherwise
```

**No-Show Risk Calculation Example:**

```
Patient History:
- Total appointments: 10
- No-shows: 2
- Last visit: 45 days ago
- Recent lab result: Yes
- Current appointment time: 14:00 (2 PM)

Features:
- patientNoShowRate = 2/10 = 0.20 (20%)
- daysSinceLastVisit = 45
- appointmentHour = 14
- hasRecentLabResult = true

XGBoost Model Output:
- Probability: 0.35 (35% chance of no-show)
- Label: "Medium" (based on model decision boundary)

Display: 
- Red/Yellow indicator with "Medium Risk - 35%"
```

#### Estimation

- **Effort:** Medium (30-40 story points)
- **Frontend:** 15-20 hours
- **Backend:** 10-15 hours
- **Testing:** 8-12 hours
- **Total:** 33-47 hours

#### Acceptance Testing

- [ ] Doctor can see today's appointments
- [ ] Appointments sorted by time
- [ ] No-show risk displayed for each appointment
- [ ] Risk indicators color-coded (Green/Yellow/Red)
- [ ] Notifications panel shows latest notifications
- [ ] Unread notifications distinguished visually
- [ ] Send Reminder button works and creates activity
- [ ] View Summary modal displays patient info
- [ ] Dashboard refreshes data on load
- [ ] Responsive design works on mobile

---

### Sprint 1 Summary

**Total Effort:** 130-170 story points  
**Duration:** 2-3 weeks (assuming full-time team)  
**Key Deliverables:**
- Fully functional patient dashboard
- Complete appointment booking flow
- Doctor dashboard with real-time appointments
- AI no-show prediction integration
- Complete API endpoints for patient and doctor features

**Sprint 1 Testing Focus:**
- User authentication and session management
- Appointment booking consistency (race conditions)
- Data accuracy in dashboard displays
- AI prediction accuracy and fallback behavior
- Responsive design across devices
- Error handling and edge cases

---

## Sprint 2: User Stories 4-6

### Overview

Sprint 2 focuses on **doctor availability management**, **admin capabilities**, and **appointment lifecycle management**. This sprint establishes complete schedule control for doctors and system administration features.

**Duration:** 2-3 weeks (estimated)  
**Team Members:** Frontend (2), Backend (2), QA (1)  
**User Stories:** US 4, US 5, US 6

---

### User Story 4: Manage Doctor Availability Schedule

#### Story Description

**As a doctor, I want to set my availability schedule including working days, time slots, and consultation mode so that patients can book appointments only during my available hours.**

#### Business Value

- **Schedule Control**: Doctors have full control over their availability
- **Work-Life Balance**: Ability to set boundaries on working hours
- **Consistency**: Schedule prevents booking conflicts
- **Flexibility**: Easy adjustment for vacation, conferences, or emergencies
- **Patient Confidence**: Clear availability increases patient trust

#### Acceptance Criteria

1. **Given** that I am a doctor  
   **When** I select my available working days  
   **Then** the system should save my selected schedule  
   **And** the system should store days as JSON in available_hours  
   **And** I should see visual confirmation of saved changes

2. **Given** that I set working hours and break times  
   **When** I click Save Availability  
   **Then** the system should store my schedule successfully  
   **And** the system should validate time ranges (start < end)  
   **And** I should see error message if times are invalid

3. **Given** that patients want to book appointments  
   **When** they open the booking page  
   **Then** they should only see time slots based on my availability settings  
   **And** the slots should exclude my configured break times

4. **Given** that I modify my schedule  
   **When** I update availability settings  
   **Then** the system should reflect the updated schedule in future appointment bookings  
   **And** existing appointments should not be affected

#### Linked Tasks

1. **#DesignDoctorAvailabilitySettingsUI**
   - Create UI mockups for schedule editor
   - Design day selector (checkboxes for Mon-Sun)
   - Design time input fields with time picker
   - Design break time management interface
   - Design consultation mode selector
   - Design save/cancel buttons
   - Deliverable: UI mockups

2. **#ImplementWorkingDaysSelector**
   - Create component for day selection
   - Use checkboxes for each day of week
   - Show visual indication of selected days
   - Enable/disable based on working hours

3. **#DevelopWorkingHoursInputComponent**
   - Create time input component for start/end times
   - Implement time picker (or use HTML5 time input)
   - Validate start < end
   - Show error messages for invalid input
   - Separate input for each day

4. **#ImplementBreakTimeConfiguration**
   - Create component for managing break times per day
   - Allow multiple breaks per day (e.g., lunch break + afternoon break)
   - Show add/remove buttons for breaks
   - Validate breaks don't overlap with working hours

5. **#DevelopConsultationModeSelector**
   - Create toggle or checkboxes for consultation modes
   - Options: Online, In-Clinic
   - Allow both modes or single mode selection
   - Store selected modes in available_hours

6. **#ImplementSaveAvailabilityFunction**
   - Create submit handler for the form
   - Collect all form data into JSON structure
   - Show loading state during save
   - API call: `PATCH /api/doctor/availability`
   - Show success/error message

7. **#ValidateDoctorScheduleInput**
   - Frontend validation:
     - At least one working day selected
     - Valid time format (HH:MM)
     - Start time < end time
     - Breaks within working hours
   - Backend validation:
     - All same validations server-side
     - Prevent invalid data in database

8. **#StoreAvailabilityDataInDatabase**
   - Update `doctors` table `available_hours` column (JSONB)
   - Store structure with all schedule details
   - Maintain data consistency
   - Test data retrieval for slot generation

#### Technical Implementation Details

**Frontend Implementation:**

```
Components to Create:
- src/components/doctor/AvailabilityScheduleEditor.jsx (Main)
- DaySelector sub-component
- TimeRangeInput sub-component
- BreakTimeManager sub-component
- ConsultationModeSelector sub-component

Data Structure:
{
  working_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  working_hours: {
    mon: { start: '09:00', end: '17:00' },
    tue: { start: '09:00', end: '17:00' },
    ...
  },
  break_times: {
    mon: [
      { start: '12:00', end: '13:00' },  // lunch
      { start: '15:00', end: '15:30' }   // tea break
    ],
    ...
  },
  consultation_modes: ['online', 'in-clinic'],
  slot_interval_minutes: 30
}
```

**Backend Implementation:**

```
Endpoints:
1. GET /api/doctor/availability/{doctorId} (role: doctor)
   - Returns current availability schedule for doctor
   - Includes all working days, hours, breaks, modes

2. PATCH /api/doctor/availability (role: doctor)
   - Request body: complete availability object
   - Validation:
     - At least 1 working day
     - Valid time format
     - start < end for each day
     - Breaks within working hours
   - Update doctors.available_hours (JSONB)
   - Return updated schedule

Database Update:
- UPDATE doctors 
  SET available_hours = $1::jsonb, updated_at = NOW()
  WHERE doctor_id = $2
```

**Slot Generation Algorithm (Backend):**

```javascript
function generateSlotsFromSchedule(doctorSchedule, selectedDate) {
  // Get day name (mon, tue, etc.)
  const dayKey = getDayKeyForDate(selectedDate);
  
  // Check if doctor works that day
  if (!doctorSchedule.working_days.includes(dayKey)) {
    return []; // No slots if doctor doesn't work
  }
  
  // Get working hours for that day
  const dayHours = doctorSchedule.working_hours[dayKey];
  if (!dayHours || !dayHours.start || !dayHours.end) {
    return [];
  }
  
  // Convert times to minutes
  const startMinutes = timeToMinutes(dayHours.start);
  const endMinutes = timeToMinutes(dayHours.end);
  
  // Generate slots
  const slots = [];
  const interval = doctorSchedule.slot_interval_minutes || 30;
  
  for (let time = startMinutes; time < endMinutes; time += interval) {
    const slotTime = minutesToTime(time);
    
    // Check if slot is within a break time
    const isInBreak = doctorSchedule.break_times[dayKey]?.some(
      breakPeriod => {
        const breakStart = timeToMinutes(breakPeriod.start);
        const breakEnd = timeToMinutes(breakPeriod.end);
        return time >= breakStart && time < breakEnd;
      }
    );
    
    if (!isInBreak) {
      slots.push(slotTime);
    }
  }
  
  return slots;
}
```

#### Estimation

- **Effort:** Normal (25-35 story points)
- **Frontend:** 12-15 hours
- **Backend:** 8-12 hours
- **Testing:** 8-10 hours
- **Total:** 28-37 hours

#### Acceptance Testing

- [ ] Can select/deselect working days
- [ ] Time inputs accept valid formats (HH:MM)
- [ ] Start time < end time validation works
- [ ] Can add/remove multiple break times
- [ ] Consultation modes save correctly
- [ ] Schedule saves to database successfully
- [ ] Patient booking reflects new availability
- [ ] Previously booked appointments unaffected
- [ ] Frontend validates before submission
- [ ] Backend rejects invalid data
- [ ] Changes take effect immediately for future bookings

---

### User Story 5: Monitor System Activity through Admin Dashboard

#### Story Description

**As an admin, I want to view a system dashboard with statistics, alerts, and quick actions so that I can monitor clinic performance and manage system operations effectively.**

#### Business Value

- **Operations Visibility**: Real-time insights into clinic operations
- **Quick Decision Making**: Key metrics at a glance
- **Problem Identification**: Alerts highlight issues immediately
- **System Health**: Monitor key performance indicators
- **Efficiency**: Quick action buttons for common admin tasks

#### Acceptance Criteria

1. **Given** that I am an admin  
   **When** I log into the ClinixOne platform  
   **Then** I should see a dashboard overview with statistics such as total doctors, active patients, appointments, and cancellations  
   **And** each statistic should display the count and day-over-day change

2. **Given** that the system generates alerts  
   **When** I view the dashboard  
   **Then** I should see notifications such as low stock alerts, pending payments, or pending reviews  
   **And** alerts should be prioritized by severity

3. **Given** that I want to perform administrative actions quickly  
   **When** I use the Quick Actions section  
   **Then** I should be able to add doctors, register patients, schedule appointments, or generate reports  
   **And** each action should open appropriate dialog or navigate to management page

4. **Given** that system activity changes  
   **When** the dashboard refreshes  
   **Then** the statistics and alerts should update accordingly  
   **And** refresh should happen automatically or on manual trigger

#### Linked Tasks

1. **#DesignAdminDashboardUI**
   - Create dashboard mockups with statistics cards
   - Design alert panel with severity indicators
   - Design quick action buttons layout
   - Design responsive layout
   - Deliverable: UI mockups

2. **#ImplementDashboardStatisticsCards**
   - Create statistics card component (reusable)
   - Display: metric name, current value, change percentage
   - Color code change (green for increase, red for decrease as appropriate)
   - Design responsive grid layout

3. **#FetchSystemMetricsAPI**
   - Backend endpoint: `GET /api/admin/dashboard`
   - Calculate metrics:
     - Total doctors: COUNT(*) from doctors table
     - Active patients: COUNT(DISTINCT patient_id) from appointments (last 30 days)
     - Today's appointments: COUNT(*) where date = TODAY
     - Cancellations (today): COUNT(*) where status = 'cancelled' and date = TODAY
   - Compare with previous day/week for trend

4. **#DevelopAppointmentSummaryChart**
   - Optional: Add chart showing appointments by status (scheduled, completed, cancelled)
   - Use chart library (Chart.js, Recharts, etc.)
   - Show trend over time

5. **#ImplementRecentAlertsPanel**
   - Create alerts component
   - Display system notifications
   - Severity levels: Info, Warning, Critical
   - Alert types: Low stock, Pending approvals, System errors
   - Dismiss functionality

6. **#CreateQuickActionButtons**
   - Buttons for:
     - Add Doctor (modal or form page)
     - Register Patient (modal or form page)
     - Schedule Appointment (modal with booking flow)
     - Generate Report (modal with report type selection)
     - View Appointments (navigate to management page)
   - Each button triggers appropriate action

7. **#IntegrateDashboardWithBackendAnalytics**
   - Create admin service for dashboard data fetching
   - Implement caching (dashboard updated every 5 minutes)
   - Handle errors gracefully
   - Add refresh button for manual update

#### Technical Implementation Details

**Frontend Implementation:**

```
Components to Create:
- src/pages/AdminDashboardPage.jsx (Main page)
- StatisticsCard.jsx (Reusable card)
- AlertsPanel.jsx
- QuickActionsSection.jsx
- AdminMenuSidebar.jsx (Navigation)

Services to Create:
- src/services/adminService.js
  - getDashboardMetrics()
  - addDoctor(data)
  - registerPatient(data)
  - scheduleAppointment(data)
  - generateReport(reportType)
```

**Backend Implementation:**

```
Endpoints (Admin role required):
1. GET /api/admin/dashboard
   - Calculate all statistics
   - Fetch recent alerts
   - Return summary metrics

2. POST /api/admin/doctors (role: admin)
   - Register new doctor
   - Similar to patient registration but for doctor role

3. POST /api/admin/patients (role: admin)
   - Register new patient
   - Similar to patient registration

4. POST /api/admin/appointments (role: admin)
   - Create appointment on behalf of patient/doctor
   - Useful for phone-in bookings

5. POST /api/admin/reports/generate (role: admin)
   - Generate report based on type
   - Supports: Daily summary, Doctor performance, Patient adherence
   - Return downloadable PDF or CSV

Database Queries:
- SELECT COUNT(*) FROM doctors
- SELECT COUNT(DISTINCT patient_id) FROM appointments 
  WHERE appointment_date >= NOW() - INTERVAL '30 days'
- SELECT COUNT(*) FROM appointments 
  WHERE appointment_date = CURRENT_DATE
- SELECT COUNT(*) FROM appointments 
  WHERE appointment_date = CURRENT_DATE AND status = 'cancelled'
```

**Statistics Calculation Example:**

```
Today's Appointments: 42
Yesterday's Appointments: 38
Change: +4 (+10.5%)
Display: "42 today, ↑ 10.5% from yesterday"

Color: Green (increase is positive for appointments)

Patient Registration Trend:
Today: 5 new patients
Last 7 days: 28 new patients
Weekly average: 4 patients
Change: +1 from average

Display: "5 new today, +1 vs weekly avg"
```

#### Estimation

- **Effort:** Medium (30-40 story points)
- **Frontend:** 15-18 hours
- **Backend:** 12-15 hours
- **Testing:** 8-10 hours
- **Total:** 35-43 hours

#### Acceptance Testing

- [ ] Dashboard displays all required statistics
- [ ] Statistics update on refresh
- [ ] Trend indicators (↑/↓) display correctly
- [ ] Alert panel shows recent system alerts
- [ ] Alerts sorted by severity
- [ ] Quick action buttons trigger correct modals/pages
- [ ] Add doctor form validates and saves
- [ ] Register patient form validates and saves
- [ ] Dashboard responsive on mobile/tablet/desktop
- [ ] Page loads within 3 seconds

---

### User Story 6: Manage and Track Appointments

#### Story Description

**As an admin, I want to view and manage all patient appointments with filtering and status management features so that I can maintain an organized and efficient appointment scheduling system.**

#### Business Value

- **Complete Visibility**: Overview of all appointments in system
- **Issue Resolution**: Ability to reschedule or cancel appointments
- **Compliance**: Audit trail of appointment changes
- **Support**: Facilitate customer support requests
- **Planning**: Identify bottlenecks and optimize scheduling

#### Acceptance Criteria

1. **Given** that I am an admin  
   **When** I open the Appointment Management page  
   **Then** I should see a list of all appointments with details such as patient name, doctor, date, time, and status  
   **And** the list should display up to 20 appointments per page with pagination

2. **Given** that I want to search for a specific appointment  
   **When** I use the search bar or filters  
   **Then** the system should display relevant appointment results  
   **And** filters should work for: patient name, doctor name, date range, status, visit type

3. **Given** that an appointment needs modification  
   **When** I click Reschedule or Cancel  
   **Then** the system should update the appointment status accordingly  
   **And** the patient should see activity log entry for the change  
   **And** confirmation dialog should appear before deletion/cancellation

4. **Given** that there are many appointments  
   **When** I scroll through the list  
   **Then** the system should provide pagination to navigate through multiple pages of appointments  
   **And** page size should be configurable (10, 20, 50 per page)

#### Linked Tasks

1. **#DesignAppointmentManagementUI**
   - Create mockups for appointment list view
   - Design filters and search bar
   - Design status update modal
   - Design appointment details view
   - Deliverable: UI mockups

2. **#ImplementAppointmentTableComponent**
   - Create data table component with columns:
     - Patient Name
     - Doctor Name
     - Date & Time
     - Visit Type
     - Status
     - Actions (View, Edit, Cancel)
   - Add sorting capability on columns
   - Make table responsive

3. **#DevelopSearchAndFilterFunctionality**
   - Implement search bar (searches patient name, doctor name)
   - Add filter dropdowns:
     - Status: All, Scheduled, Completed, Cancelled
     - Visit Type: All, Online, In-Clinic
     - Date Range: Quick filters (Today, This Week, This Month, Custom)
   - Real-time filtering (or explicit search button)

4. **#FetchAppointmentsFromDatabase**
   - Backend endpoint: `GET /api/admin/appointments`
   - Query parameters: page, limit, search, filters
   - Return appointment list with related data (patient, doctor names)
   - Include pagination metadata (total count, has_next, has_previous)

5. **#ImplementAppointmentStatusUpdate**
   - Update appointment status: scheduled → completed, scheduled → cancelled
   - Modal dialog for confirming status change
   - Add optional reason/notes for cancellation
   - Create activity log entry

6. **#DevelopRescheduleAppointmentFeature**
   - Show available slots for same doctor or new doctor
   - Modal with date/time selector
   - Validate new slot availability
   - Update appointment record
   - Notify affected parties (optional: send notifications)

7. **#ImplementCancelAppointmentFunction**
   - Confirmation dialog with reason dropdown
   - Reason options: Doctor unavailable, Patient request, Emergency, Other
   - Set appointment status to 'cancelled'
   - Optional: Send cancellation notification to patient
   - Create activity record

8. **#CreatePaginationForAppointmentList**
   - Implement pagination component
   - Show: Page X of Y
   - Previous/Next buttons
   - Jump to page input
   - Page size selector

#### Technical Implementation Details

**Frontend Implementation:**

```
Components to Create:
- src/pages/AdminAppointmentsPage.jsx (Main page)
- AppointmentTable.jsx
- AppointmentFilters.jsx
- AppointmentSearchBar.jsx
- PaginationComponent.jsx
- AppointmentDetailsModal.jsx
- CancelAppointmentModal.jsx
- RescheduleAppointmentModal.jsx

Services to Create/Extend:
- Extend src/services/adminService.js
  - getAppointments(page, limit, filters)
  - getAppointmentDetails(id)
  - updateAppointmentStatus(id, status)
  - cancelAppointment(id, reason)
  - rescheduleAppointment(id, newDate, newTime)
```

**Backend Implementation:**

```
Endpoints (Admin role required):
1. GET /api/admin/appointments
   Query params:
   - page: 1 (default)
   - limit: 20 (default, max 100)
   - search: "patient or doctor name"
   - status: "scheduled" or "completed" or "cancelled"
   - visit_type: "online" or "in-clinic"
   - date_from: YYYY-MM-DD
   - date_to: YYYY-MM-DD
   
   Response:
   {
     data: [appointment objects],
     pagination: {
       page: 1,
       limit: 20,
       total: 245,
       pages: 13,
       has_next: true,
       has_previous: false
     }
   }

2. GET /api/admin/appointments/{appointmentId}
   - Return full appointment details with patient/doctor info

3. PATCH /api/admin/appointments/{appointmentId}/status
   Request: { status: "completed" | "cancelled", reason: "optional" }
   - Update appointment status
   - Create activity log entry
   - Return updated appointment

4. PATCH /api/admin/appointments/{appointmentId}/reschedule
   Request: { new_date: YYYY-MM-DD, new_time: HH:MM }
   - Check slot availability
   - Update appointment
   - Create activity log entry
   - Return updated appointment

Database Queries:
- SELECT * FROM appointments 
  JOIN patients ON appointments.patient_id = patients.patient_id
  JOIN doctors ON appointments.doctor_id = doctors.doctor_id
  WHERE (patients.name ILIKE $1 OR doctors.name ILIKE $1)
  AND appointments.appointment_date >= $2
  AND appointments.status = $3
  ORDER BY appointment_date DESC
  LIMIT $4 OFFSET $5
```

**Pagination Example:**

```
Total appointments: 250
Page size: 20
Requested page: 3

Offset calculation: (3 - 1) * 20 = 40
Query: LIMIT 20 OFFSET 40

Response metadata:
{
  page: 3,
  limit: 20,
  total: 250,
  pages: 13,  // ceil(250 / 20)
  has_next: true,
  has_previous: true
}
```

**Filter Application Example:**

```
User selects:
- Status: Scheduled
- Date Range: Last 7 days
- Visit Type: Online

Query built:
WHERE status = 'scheduled'
AND appointment_date >= (CURRENT_DATE - INTERVAL '7 days')
AND visit_type = 'online'
```

#### Estimation

- **Effort:** Medium (30-40 story points)
- **Frontend:** 15-18 hours
- **Backend:** 12-15 hours
- **Testing:** 8-10 hours
- **Total:** 35-43 hours

#### Acceptance Testing

- [ ] Appointment list displays correctly
- [ ] Search filters by patient name and doctor name
- [ ] Status filter works for all status options
- [ ] Date range filter includes only selected dates
- [ ] Visit type filter narrows results
- [ ] Pagination shows correct items per page
- [ ] Previous/Next buttons navigate correctly
- [ ] Page size selector updates displayed items
- [ ] Status update modal appears and saves correctly
- [ ] Cancellation creates activity record
- [ ] Rescheduling validates new slot availability
- [ ] Confirmation dialogs prevent accidental actions
- [ ] Table responsive on mobile (columns collapse/stack)
- [ ] Sorting works on clickable columns

---

### Sprint 2 Summary

**Total Effort:** 85-115 story points  
**Duration:** 2-3 weeks (assuming full-time team)  
**Key Deliverables:**
- Complete doctor availability schedule management
- Functional admin dashboard with analytics
- Comprehensive appointment management system
- Admin CRUD operations for users and appointments
- System-wide reporting capabilities

**Sprint 2 Testing Focus:**
- Schedule conflict prevention
- Admin authorization enforcement
- Pagination and filtering accuracy
- Data consistency across updates
- Responsive admin interfaces
- Bulk operations handling

---

## Project Timeline & Roadmap

### Phases

**Phase 1: Setup & Foundation (1 week)**
- Database schema creation
- Backend server initialization
- Frontend project setup
- Development environment configuration
- API documentation

**Phase 2: Sprint 1 (2-3 weeks)**
- User Stories 1, 2, 3
- Patient dashboard + appointment booking
- Doctor dashboard + no-show prediction
- Testing and bug fixes

**Phase 3: Sprint 2 (2-3 weeks)**
- User Stories 4, 5, 6
- Doctor availability management
- Admin dashboard and reporting
- Appointment management system

**Phase 4: Integration & Testing (1-2 weeks)**
- End-to-end testing
- Performance optimization
- Security audit
- UAT with stakeholders

**Phase 5: Deployment & Launch (1 week)**
- Production environment setup
- Data migration (if applicable)
- User training
- Go-live support

**Total Project Duration:** 7-11 weeks (approximately 2.5 months)

---

## Deployment & Operations

### Hosting Recommendations

**Frontend:**
- Vercel, Netlify, or AWS S3 + CloudFront
- CDN for static assets
- Environment-specific builds (dev, staging, production)

**Backend:**
- AWS EC2, DigitalOcean, or Heroku
- Docker containerization
- Environment variable configuration
- Auto-scaling policies

**Database:**
- AWS RDS (PostgreSQL), Azure Database, or self-managed PostgreSQL
- Automated backups
- Replication for high availability

**AI Service:**
- Dedicated container or serverless function
- Model version management
- Prediction caching

### Monitoring & Maintenance

- Application performance monitoring (APM)
- Database query optimization
- Error tracking and alerting
- Log aggregation
- Regular security updates

---

## Success Metrics

- **User Adoption:** 80% of target users active within 3 months
- **System Uptime:** 99.5% availability
- **Performance:** API response time < 500ms
- **No-Show Reduction:** 20% reduction in missed appointments
- **User Satisfaction:** NPS score > 40

---

## Conclusion

ClinixOne is a comprehensive healthcare management platform built with modern technologies and best practices. Sprints 1 and 2 establish the core functionality needed for patients, doctors, and administrators to effectively manage healthcare operations. The platform is designed to scale, with clear separation of concerns between frontend, backend, and AI services.

For detailed implementation guidance, refer to individual user story technical sections and API documentation above.

