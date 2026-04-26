# ClinixOne – Application Flow Documentation

**Document Purpose:** Comprehensive guide to all user flows, system workflows, and data flows in ClinixOne  
**Date:** April 26, 2026

---

## Table of Contents

1. [Authentication Flows](#authentication-flows)
2. [Patient Flows](#patient-flows)
3. [Doctor Flows](#doctor-flows)
4. [Admin Flows](#admin-flows)
5. [Appointment Lifecycle Flow](#appointment-lifecycle-flow)
6. [System Processes](#system-processes)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Error Handling Flows](#error-handling-flows)

---

## Authentication Flows

### 1.1 User Registration Flow

```
START: User clicks "Register" on landing page
│
├─> STEP 1: User navigates to /register page
│   └─> Display registration form with:
│       - Full Name (text input)
│       - Email (email input)
│       - Phone (tel input)
│       - Password (password input)
│       - Confirm Password (password input)
│       - Role selector (Patient/Doctor/Admin)
│
├─> STEP 2: User fills in form and clicks "Register"
│   └─> Client-side validation:
│       - Check all fields are filled
│       - Validate email format
│       - Validate password strength (min 8 chars, 1 uppercase, 1 number)
│       - Confirm passwords match
│       - If validation fails → Show error messages and stop
│
├─> STEP 3: Submit form data to backend
│   └─> POST /api/auth/register
│       Request:
│       {
│         fullName: string,
│         email: string,
│         phone: string,
│         password: string,
│         role: 'patient' | 'doctor' | 'admin'
│       }
│
├─> STEP 4: Backend validation
│   └─> Check:
│       - Email not already registered
│       - All required fields present
│       - Valid email format
│       - Password strength
│       - If validation fails → Return 400 error
│
├─> STEP 5: Create user account
│   └─> Database operations:
│       - Hash password with bcrypt (salt rounds: 10)
│       - INSERT into users table
│       - If role = 'patient' → INSERT into patients table
│       - If role = 'doctor' → INSERT into doctors table
│       - If role = 'admin' → No additional table insert
│       - If DB error → Return 500 error
│
├─> STEP 6: Generate JWT token
│   └─> Create token with payload:
│       {
│         user_id: UUID,
│         role: string,
│         iat: timestamp,
│         exp: timestamp + 7 days
│       }
│
├─> STEP 7: Return success response
│   └─> Response 201 (Created):
│       {
│         user: { id, email, user_metadata: { full_name, role } },
│         session: { access_token, token_type: 'Bearer' }
│       }
│
├─> STEP 8: Client-side handling
│   └─> Save in localStorage:
│       - clinix_session_token = access_token
│       - clinix_user_role = role
│       - clinix_user_name = full_name
│       - clinix_patient_id = user_id (if patient)
│
├─> STEP 9: Redirect to dashboard
│   └─> If patient → Redirect to /dashboard
│       If doctor → Redirect to /doctor-dashboard
│       If admin → Redirect to /admin-dashboard
│
END: User successfully registered and logged in
```

---

### 1.2 User Login Flow

```
START: User navigates to /login
│
├─> STEP 1: Display login form
│   └─> Inputs:
│       - Email address
│       - Password
│       - Optional: Role selector (for multi-role accounts)
│       - "Remember Me" checkbox
│
├─> STEP 2: User enters credentials and clicks "Login"
│   └─> Client validation:
│       - Check email is not empty
│       - Check password is not empty
│       - If validation fails → Show error
│
├─> STEP 3: Submit credentials
│   └─> POST /api/auth/login
│       Request:
│       {
│         email: string,
│         password: string,
│         role: optional string
│       }
│
├─> STEP 4: Backend authentication
│   └─> Process:
│       - Query users table by email
│       - If user not found → Return 404 error
│       - If user found → Compare password with hash
│       - If password wrong → Return 401 error
│       - If role specified and doesn't match → Return 401 error
│
├─> STEP 5: Generate JWT token
│   └─> Create token with:
│       - user_id, role, iat, exp
│
├─> STEP 6: Return success response
│   └─> Response 200:
│       {
│         user: { id, email, user_metadata: { full_name, role } },
│         session: { access_token, token_type: 'Bearer' }
│       }
│
├─> STEP 7: Client storage
│   └─> Save token and user info to localStorage
│       If "Remember Me" checked → Store for 30 days
│
├─> STEP 8: Route to role-specific dashboard
│   └─> Redirect based on role

END: User logged in and redirected to dashboard
```

---

### 1.3 User Logout Flow

```
START: User clicks "Logout" button
│
├─> STEP 1: Show confirmation (optional)
│   └─> "Are you sure you want to logout?"
│
├─> STEP 2: Client-side cleanup
│   └─> Remove from localStorage:
│       - clinix_session_token
│       - clinix_user_role
│       - clinix_user_name
│       - clinix_patient_id
│       - Any other session data
│
├─> STEP 3: Optional - Notify backend
│   └─> POST /api/auth/logout (with token header)
│
├─> STEP 4: Clear application state
│   └─> Reset React state/context
│       - Clear user data
│       - Clear cached API data
│       - Reset navigation
│
├─> STEP 5: Redirect to login
│   └─> Navigate to /login page

END: User successfully logged out
```

---

### 1.4 Route Protection Flow

```
START: User attempts to navigate to protected route
│
├─> STEP 1: Check if user authenticated
│   └─> Read localStorage token
│       If token exists → Continue to STEP 2
│       If token missing → REDIRECT to /login
│
├─> STEP 2: Check token validity
│   └─> Verify JWT signature using secret
│       If valid → Continue to STEP 3
│       If invalid/expired → REDIRECT to /login
│
├─> STEP 3: Decode token and extract role
│   └─> Extract role from token payload
│
├─> STEP 4: Check role authorization
│   └─> Compare user's role with route's required role(s)
│       If role matches → Allow access
│       If role doesn't match → REDIRECT to role-specific home
│
├─> STEP 5: Render component
│   └─> Display protected component
│
END: User granted/denied access to route
```

---

## Patient Flows

### 2.1 Patient Dashboard View Flow

```
START: Patient navigates to /dashboard
│
├─> STEP 1: Route protection (see 1.4)
│   └─> Verify authentication and patient role
│
├─> STEP 2: Page loads
│   └─> DashboardPage component mounts
│
├─> STEP 3: Initialize data fetching
│   └─> useEffect hooks trigger for:
│       - useAppointments() → Fetch upcoming appointments
│       - useReminders() → Fetch medicine reminders
│       - useActivities() → Fetch recent activities
│       - Show loading skeleton while fetching
│
├─> STEP 4: Fetch appointments
│   └─> GET /api/patient/appointments?patient_id={id}
│       Response: Array of appointments
│       - Sort by appointment_date ascending
│       - Filter: appointment_date >= TODAY
│
├─> STEP 5: Fetch reminders
│   └─> GET /api/patient/reminders?patient_id={id}
│       Response: Array of reminders
│       - Display medicine name, dosage, time
│
├─> STEP 6: Fetch activities
│   └─> GET /api/patient/activities?patient_id={id}&limit=20
│       Response: Array of activities sorted by time (newest first)
│
├─> STEP 7: Calculate adherence progress
│   └─> Logic:
│       - Count total reminders = X
│       - Count completed reminders = Y
│       - Adherence % = (Y / X) * 100
│       - Display progress bar with percentage
│
├─> STEP 8: Render dashboard
│   └─> Display components:
│       - Header with greeting and user profile
│       - Sidebar with navigation menu
│       - Main content area with:
│         * Upcoming Appointments Card
│         * Medicine Reminders List
│         * Adherence Progress Bar
│         * Activity Feed
│         * Quick Action Buttons
│
├─> STEP 9: Interactive elements
│   └─> User can:
│       - Click "Book Appointment" → Navigate to /dashboard/appointments
│       - Click reminder → Toggle reminder status
│       - Click on appointment → View details
│       - Click activity item → View details
│
END: Dashboard displayed with all data loaded
```

---

### 2.2 Appointment Booking Flow

```
START: Patient clicks "Book Appointment" or navigates to /dashboard/appointments
│
├─> STEP 1: Display doctor search page
│   └─> Show:
│       - Search bar for doctor name/specialization
│       - Filter options
│       - Empty state if no search performed
│
├─> STEP 2: Patient searches for doctor
│   └─> Input search term (debounced after 300ms)
│       GET /api/doctors?search={term}
│       Response: Array of matching doctors
│       Display DoctorCard components with:
│       - Name, specialization, experience
│       - Rating, consultation fee, hospital
│       - "Select" button
│
├─> STEP 3: Patient selects doctor
│   └─> Click on doctor card "Select" button
│       Store selected doctor_id in component state
│       Show selected state (highlight/checkmark)
│       Proceed to STEP 4
│
├─> STEP 4: Date selection
│   └─> Display calendar component
│       - Block past dates (date < TODAY)
│       - Highlight doctor's working days
│       - User selects a date
│       - Query available times: GET /api/doctors/{doctorId}/slots?date={date}
│       - Receive array of available time slots
│
├─> STEP 5: Time slot selection
│   └─> Display available slots in grid format
│       - Slots shown in HH:MM format (9:00, 9:30, 10:00, etc.)
│       - Already-booked slots shown as disabled (gray)
│       - User clicks on available slot to select
│
├─> STEP 6: Visit type selection
│   └─> Display radio buttons:
│       - Online consultation
│       - In-clinic visit
│       - Based on doctor's consultation_modes

├─> STEP 7: Consultation information
│   └─> Form inputs:
│       - Reason for visit (required, text input)
│       - Additional notes (optional, textarea)
│       - Display pre-filled patient info (name, email, phone)
│
├─> STEP 8: Appointment summary review
│   └─> Display AppointmentSummary component:
│       - Doctor: [Name - Specialization]
│       - Date: [Selected date]
│       - Time: [Selected time]
│       - Visit Type: [Online/In-Clinic]
│       - Consultation Fee: [Amount]
│       - Reason: [Entered reason]
│       - Buttons: "Edit" (go back), "Confirm" (proceed)
│
├─> STEP 9: Slot availability check before confirmation
│   └─> POST /api/appointments/check-slot
│       {
│         doctor_id: UUID,
│         appointment_date: YYYY-MM-DD,
│         appointment_time: HH:MM
│       }
│       Response: { available: true/false }
│       If available=false → Show error and return to slot selection
│
├─> STEP 10: Create appointment
│   └─> POST /api/patient/appointments
│       {
│         patient_id: UUID,
│         doctor_id: UUID,
│         appointment_date: YYYY-MM-DD,
│         appointment_time: HH:MM,
│         visit_type: "online" | "in-clinic",
│         consultation_reason: string
│       }
│       Response: { appointment_id, status: "scheduled", ... }
│       
├─> STEP 11: Log activity
│   └─> Backend automatically logs:
│       - activity_type: "appointment_booked"
│       - description: "Appointment booked with Dr. [Name]"
│
├─> STEP 12: Show confirmation modal
│   └─> Display:
│       - Success message: "Appointment confirmed!"
│       - Appointment ID (reference number)
│       - Full appointment details
│       - "Download Confirmation" button (optional)
│       - "Return to Dashboard" button
│
├─> STEP 13: Redirect to dashboard
│   └─> After 3 seconds or button click
│       Navigate to /dashboard
│       Appointment now visible in upcoming appointments list
│
END: Appointment successfully booked
```

---

### 2.3 Medicine Reminder Management Flow

```
START: Patient navigates to /dashboard/reminders
│
├─> STEP 1: Load reminders page
│   └─> Fetch reminders: GET /api/patient/reminders?patient_id={id}
│       Display list of existing reminders
│
├─> STEP 2: View reminders
│   └─> Display MedicineReminderCard for each reminder:
│       - Medicine name
│       - Dosage
│       - Reminder time
│       - Status toggle (Active/Inactive)
│       - Delete button
│       - Edit button
│
├─> STEP 3: Create new reminder
│   └─> User clicks "Add New Reminder" button
│       Show form with:
│       - Medicine name (text input, required)
│       - Dosage (text input, required)
│       - Reminder time (time picker, required)
│       - "Save" and "Cancel" buttons
│
├─> STEP 4: Submit new reminder
│   └─> User fills form and clicks "Save"
│       POST /api/patient/reminders
│       {
│         patient_id: UUID,
│         medicine_name: string,
│         dosage: string,
│         reminder_time: HH:MM
│       }
│
├─> STEP 5: Add confirmation
│   └─> Show toast notification: "Reminder added successfully"
│       Reminder appears in list
│
├─> STEP 6: Toggle reminder status
│   └─> User clicks toggle on MedicineReminderCard
│       PATCH /api/patient/reminders/{reminderId}/status
│       { status: "active" | "inactive" | "completed" }
│
├─> STEP 7: Delete reminder
│   └─> User clicks delete icon
│       Confirmation dialog: "Delete this reminder?"
│       If confirmed: DELETE /api/patient/reminders/{reminderId}
│       Remove from list
│
END: Reminders managed successfully
```

---

### 2.4 Medical Activity and Reports Flow

```
START: Patient navigates to /dashboard/history (Activities) or /dashboard/reports
│
├──── ACTIVITIES SECTION ─────────────────
│
├─> STEP 1: Load activities feed
│   └─> GET /api/patient/activities?patient_id={id}&limit=50
│       Response: Array of activities sorted by time (newest first)
│
├─> STEP 2: Display activity timeline
│   └─> For each activity, show:
│       - Activity type icon (appointment, medicine, report, etc.)
│       - Description text
│       - Timestamp (relative: "2 hours ago" or absolute)
│       - Optional details/expand button
│
├─> STEP 3: Activity types displayed
│   └─> appointment_booked: "Booked appointment with Dr. [Name]"
│       appointment_cancelled: "Cancelled appointment with Dr. [Name]"
│       appointment_completed: "Appointment completed"
│       medicine_taken: "Took [Medicine] - [Dosage]"
│       report_uploaded: "Uploaded medical report: [Name]"
│       reminder_created: "Created medicine reminder"
│
├─> STEP 4: Infinite scroll / Pagination
│   └─> Load more activities when scrolling to bottom
│       Or show "Load More" button
│
├──── REPORTS SECTION ─────────────────
│
├─> STEP 5: Load medical reports
│   └─> GET /api/patient/reports?userId={id}
│       Response: Array of uploaded reports with metadata
│
├─> STEP 6: Display reports list
│   └─> For each report:
│       - File name
│       - Upload date
│       - File size (optional)
│       - Download link
│       - Delete button
│
├─> STEP 7: Upload new report
│   └─> User clicks "Upload New Report"
│       Display file upload form
│
├─> STEP 8: Select and upload file
│   └─> User selects file (PDF, JPG, PNG, etc.)
│       POST /api/patient/reports (multipart/form-data)
│       - userId: patient_id
│       - file: file object
│       
├─> STEP 9: Upload processing
│   └─> Backend:
│       - Validate file type and size (max 2MB)
│       - Save file to server/uploads/reports/
│       - Create record in medical_reports table
│       - Generate public URL
│
├─> STEP 10: Upload confirmation
│   └─> Show success toast: "Report uploaded successfully"
│       New report appears in list with download link
│
├─> STEP 11: Download report
│   └─> User clicks download link
│       GET /uploads/reports/{filename}
│       Browser downloads file
│
├─> STEP 12: Delete report
│   └─> User clicks delete
│       Confirmation dialog
│       If confirmed: DELETE /api/patient/reports/{reportId}
│       Report removed from list and file deleted from server

END: Activities and reports managed
```

---

## Doctor Flows

### 3.1 Doctor Dashboard View Flow

```
START: Doctor navigates to /doctor-dashboard
│
├─> STEP 1: Route protection
│   └─> Verify authentication and doctor role
│
├─> STEP 2: Fetch dashboard data
│   └─> GET /api/doctor/dashboard (with Authorization header)
│       Response includes:
│       - Summary metrics (today's appointments, unique patients, alerts)
│       - Today's appointments array
│       - Recent notifications array
│
├─> STEP 3: Calculate summary metrics
│   └─> Backend processes:
│       - today_appointments: COUNT appointments where date=TODAY and doctor_id={id}
│       - unique_patients: COUNT DISTINCT patient_id for appointments
│       - unread_notifications: COUNT notifications where is_read=false
│       - high_no_show_risk: COUNT appointments with risk >= 0.7
│
├─> STEP 4: Calculate no-show risk for each appointment
│   └─> For each appointment:
│       - Extract features:
│         * patientNoShowRate = previous no-shows / total appointments
│         * daysSinceLastVisit = days since last completed appointment
│         * appointmentHour = hour of day (9, 14, etc.)
│         * hasRecentLabResult = true/false
│       - Call AI service: POST /predict/no-show
│         Request: { features: [...] }
│         Response: { probability: 0.35, label: "Medium", source: "xgboost" }
│       - If AI fails, use fallback heuristic
│
├─> STEP 5: Display dashboard layout
│   └─> Show:
│       - Header with doctor name and greeting
│       - Summary cards:
│         * "8" today's appointments
│         * "24" unique patients this month
│         * "3" unread notifications
│         * "2" high risk appointments
│       - Main appointment table
│       - Notifications panel
│
├─> STEP 6: Appointment table display
│   └─> Columns:
│       - Time: appointment_time
│       - Patient Name: patient name from joined table
│       - Type: visit_type (Online/In-Clinic)
│       - Status: scheduled/completed/cancelled
│       - Risk: Risk label with color coding
│         * Low (Green) - probability < 0.3
│         * Medium (Yellow) - probability 0.3-0.6
│         * High (Red) - probability > 0.6
│       - Actions: "Send Reminder" button, "View Summary" button
│
├─> STEP 7: Notifications panel
│   └─> Display recent notifications:
│       - New lab result from patient
│       - Appointment reminders sent
│       - System alerts
│       - Unread notifications shown with bold text
│       - Click notification to mark as read
│
├─> STEP 8: Interactive actions
│   └─> Doctor can:
│       - Send reminder to patient
│       - View appointment summary
│       - Mark notification as read
│       - Click on appointment row for details
│
├─> STEP 9: Auto-refresh (optional)
│   └─> Dashboard data refreshes every 5 minutes
│       Or manual refresh button
│
END: Dashboard displayed with live data
```

---

### 3.2 Send Appointment Reminder Flow

```
START: Doctor clicks "Send Reminder" button on appointment
│
├─> STEP 1: Initiate reminder action
│   └─> Button click captures appointmentId
│
├─> STEP 2: Send reminder to backend
│   └─> POST /api/doctor/appointments/{appointmentId}/send-reminder
│       Authorization header with JWT token
│
├─> STEP 3: Backend processing
│   └─> Process:
│       - Fetch appointment details
│       - Fetch patient information
│       - Create activity log entry:
│         * activity_type: "reminder_sent"
│         * description: "Reminder sent by Dr. [DoctorName]"
│       - Create doctor notification:
│         * For reminder tracking
│
├─> STEP 4: Success response
│   └─> Response 200: { message: "Reminder sent successfully" }
│
├─> STEP 5: UI feedback
│   └─> Show toast notification: "Reminder sent to patient"
│       Button state changes (disabled briefly, then enabled)
│       Activity log updated on patient's dashboard
│
END: Reminder sent successfully
```

---

### 3.3 View Appointment Summary Flow

```
START: Doctor clicks "View Summary" button on appointment
│
├─> STEP 1: Fetch appointment summary
│   └─> GET /api/doctor/appointments/{appointmentId}/summary
│       Authorization header with token
│
├─> STEP 2: Backend retrieves data
│   └─> Query:
│       - Appointment details
│       - Patient information (name, age, gender, medical_history)
│       - Recent patient activities/history
│       - Previous appointments (last 5)
│       - Available medical reports
│
├─> STEP 3: Display summary modal
│   └─> Modal shows sections:
│       
│       APPOINTMENT DETAILS:
│       - Date & Time
│       - Visit Type
│       - Consultation Reason
│       - Status
│       
│       PATIENT INFORMATION:
│       - Name, Age, Gender
│       - Medical History
│       - Contact info
│       
│       RECENT HISTORY:
│       - Last 5 appointments with outcomes
│       - Recent medical reports
│       - Recent activities
│       
│       NOTES:
│       - Text area for adding notes (optional)
│       - Save notes button
│
├─> STEP 4: Doctor reviews information
│   └─> Doctor reads patient information and history
│       Can prepare for consultation
│
├─> STEP 5: Optional - Add consultation notes
│   └─> Doctor types notes in notes area
│       Clicks "Save Notes"
│       PATCH /api/appointments/{appointmentId}
│       { notes: "consultation notes" }
│
├─> STEP 6: Close summary
│   └─> Click close button or outside modal
│       Return to dashboard

END: Summary reviewed
```

---

### 3.4 Doctor Availability Management Flow

```
START: Doctor clicks "Manage Schedule" or navigates to availability settings
│
├─> STEP 1: Load availability editor
│   └─> GET /api/doctor/availability/{doctorId}
│       Response: Current available_hours JSON object
│
├─> STEP 2: Display schedule editor
│   └─> Show AvailabilityScheduleEditor component with sections:
│
│       SECTION 1: WORKING DAYS
│       - Checkboxes for each day (Mon-Sun)
│       - Show selected days visually
│
│       SECTION 2: WORKING HOURS
│       - For each day: Start time and end time inputs
│       - Time pickers (HTML5 time input or custom)
│       - Validation: start < end
│
│       SECTION 3: BREAK TIMES
│       - For each day: List of break periods
│       - Add/Remove buttons for each break
│       - Start time and end time for each break
│
│       SECTION 4: CONSULTATION MODES
│       - Checkboxes: Online, In-Clinic
│       - At least one must be selected
│
│       BUTTONS:
│       - Save Availability
│       - Cancel / Reset
│
├─> STEP 3: Input validation (client-side)
│   └─> Check:
│       - At least one working day selected → Show error if not
│       - All times valid (HH:MM format) → Show error if not
│       - Start < End for each day → Show error if not
│       - Breaks within working hours → Show error if not
│       - At least one consultation mode → Show error if not
│
├─> STEP 4: Submit schedule
│   └─> User clicks "Save Availability"
│       If client validation fails → Show errors and stop
│       If validation passes → Proceed to STEP 5
│
├─> STEP 5: Send to backend
│   └─> PATCH /api/doctor/availability
│       Authorization: Bearer token
│       Body: Complete available_hours object
│       {
│         working_days: ["mon", "tue", ...],
│         working_hours: { mon: {...}, tue: {...}, ... },
│         break_times: { mon: [...], tue: [...], ... },
│         consultation_modes: ["online", "in-clinic"],
│         slot_interval_minutes: 30
│       }
│
├─> STEP 6: Backend validation
│   └─> Server validates:
│       - At least 1 working day
│       - Valid time format for all times
│       - start < end for each day
│       - breaks within working hours
│       - If validation fails → Return 400 error with details
│
├─> STEP 7: Update database
│   └─> UPDATE doctors 
│       SET available_hours = $1, updated_at = NOW()
│       WHERE doctor_id = $2
│
├─> STEP 8: Success confirmation
│   └─> Response 200: { message: "Schedule updated successfully" }
│
├─> STEP 9: UI feedback
│   └─> Show toast: "Availability schedule updated"
│       Display updated schedule
│       Close editor or show success state
│
├─> STEP 10: Effect on patient bookings
│   └─> New bookings now see updated slots based on new schedule
│       Existing appointments NOT affected
│
END: Schedule successfully updated
```

---

## Admin Flows

### 4.1 Admin Dashboard View Flow

```
START: Admin navigates to /admin-dashboard
│
├─> STEP 1: Route protection
│   └─> Verify authentication and admin role
│
├─> STEP 2: Fetch dashboard metrics
│   └─> GET /api/admin/dashboard
│       Response: System-wide statistics and alerts
│
├─> STEP 3: Calculate statistics
│   └─> Queries:
│       - Total Doctors: SELECT COUNT(*) FROM doctors
│       - Active Patients: SELECT COUNT(DISTINCT patient_id) 
│         FROM appointments WHERE appointment_date >= TODAY - 30 days
│       - Today's Appointments: SELECT COUNT(*) FROM appointments 
│         WHERE appointment_date = TODAY
│       - Today's Cancellations: SELECT COUNT(*) FROM appointments 
│         WHERE appointment_date = TODAY AND status = 'cancelled'
│       - New Registrations: SELECT COUNT(*) FROM users 
│         WHERE created_at >= TODAY
│
├─> STEP 4: Compare with previous period
│   └─> Calculate day-over-day and week-over-week changes
│       Format: +/- percentage and count
│       Color code: Green for positive, Red for negative (context-dependent)
│
├─> STEP 5: Display dashboard layout
│   └─> Show:
│       - Header with admin greeting
│       - Summary statistics cards grid:
│         * Total Doctors: 15 (↑ 2 from yesterday)
│         * Active Patients: 342 (↑ 12 from last week)
│         * Today's Appointments: 42 (↑ 5 from yesterday)
│         * Cancellations: 2 (↓ 1 from average)
│         * New Registrations: 5 (↑ 2)
│       - Recent Alerts panel
│       - Quick Actions section
│
├─> STEP 6: Display alerts
│   └─> Show high-priority alerts:
│       - System errors
│       - Pending doctor approvals
│       - Payment issues
│       - Resource warnings
│       Each alert has: Icon, Title, Message, Severity indicator
│
├─> STEP 7: Quick action buttons
│   └─> Display buttons:
│       - "Add Doctor" → Opens doctor registration form/modal
│       - "Register Patient" → Opens patient registration form/modal
│       - "Schedule Appointment" → Opens appointment booking for admin
│       - "Generate Report" → Opens report generation dialog
│       - "View Appointments" → Navigate to appointment management
│
├─> STEP 8: Interactive elements
│   └─> Admin can:
│       - Click statistics card for detailed view
│       - Click alert to view details
│       - Click quick action buttons
│       - Refresh dashboard manually

END: Admin dashboard displayed
```

---

### 4.2 Appointment Management Flow

```
START: Admin navigates to /admin/appointments
│
├─> STEP 1: Load appointment list
│   └─> GET /api/admin/appointments?page=1&limit=20
│       Response: Paginated appointment list with total count
│
├─> STEP 2: Display appointments table
│   └─> Columns:
│       - Patient Name
│       - Doctor Name
│       - Date & Time
│       - Visit Type (Online/In-Clinic)
│       - Status (Scheduled/Completed/Cancelled)
│       - Actions (View, Edit, Cancel, Reschedule)
│       - Default sort: Date descending (newest first)
│
├─> STEP 3: Search and filter
│   └─> Admin can:
│       - Search by patient name: Searches as they type
│       - Filter by status: Dropdown with options
│       - Filter by visit type: Online / In-Clinic / All
│       - Filter by date range: From date, To date inputs
│       - Filter by doctor: Multi-select or single select
│
├─> STEP 4: Apply filters
│   └─> When filters changed:
│       GET /api/admin/appointments?
│         search=term&
│         status=scheduled&
│         visit_type=online&
│         date_from=2024-05-01&
│         date_to=2024-05-31&
│         page=1&
│         limit=20
│
├─> STEP 5: Display filtered results
│   └─> Update table with filtered data
│       Show count: "Showing 15 of 250 appointments"
│
├─> STEP 6: Pagination
│   └─> Show pagination controls:
│       - Previous button (disabled if on first page)
│       - Page numbers: [1] [2] [3] ... [13]
│       - Next button (disabled if on last page)
│       - Page size selector: 10, 20, 50
│       - Jump to page input
│
├─> STEP 7: View appointment details
│   └─> Admin clicks on appointment row
│       Modal/drawer opens with:
│       - Full appointment information
│       - Patient details
│       - Doctor details
│       - Consultation reason and notes
│       - Created date and last updated date
│
├─> STEP 8: Update appointment status
│   └─> Admin clicks "Status Update"
│       Modal shows options:
│       - Scheduled → Completed
│       - Scheduled → Cancelled
│       - With optional reason/notes textarea
│       
│       Submit: PATCH /api/admin/appointments/{id}/status
│       { status: "completed" | "cancelled", reason: "optional" }
│       
│       Creates activity log entry for patient
│
├─> STEP 9: Reschedule appointment
│   └─> Admin clicks "Reschedule"
│       Modal shows:
│       - Current appointment details
│       - Calendar to select new date
│       - Time slot selector for new date
│       - Submit button
│       
│       Submit: PATCH /api/admin/appointments/{id}/reschedule
│       { new_date: "2024-05-20", new_time: "14:00" }
│       
│       Backend checks slot availability
│       If available: Update appointment
│       If not available: Return error
│
├─> STEP 10: Cancel appointment
│   └─> Admin clicks "Cancel"
│       Confirmation dialog: "Cancel this appointment?"
│       If confirmed: DELETE /api/admin/appointments/{id}
│       Or: PATCH with status="cancelled"
│
├─> STEP 11: Sorting
│   └─> Admin clicks column header to sort
│       - First click: Ascending order
│       - Second click: Descending order
│       - Re-fetch data with sort parameter

END: Appointments managed by admin
```

---

## Appointment Lifecycle Flow

```
APPOINTMENT LIFECYCLE STATES & TRANSITIONS

START: Appointment Created
│
├─> STATE: "scheduled"
│   └─> Initial state when appointment first booked
│       - Patient can cancel
│       - Doctor can view and prepare
│       - Still time until appointment
│       - Patient receives reminders
│
│       Possible next states:
│       - "confirmed" (optional: explicit confirmation)
│       - "completed" (if appointment happens)
│       - "cancelled" (if cancelled before date)
│       - "no_show" (if patient doesn't show up - optional)
│
├─> DAY OF APPOINTMENT ARRIVES
│   └─> Appointment date = TODAY
│       - Doctor sees appointment in dashboard
│       - Patient receives final reminder
│       - Can still cancel
│
├─> APPOINTMENT TIME PASSES
│   └─> Current time >= appointment_time
│       - If patient attended → Doctor marks as "completed"
│       - If patient didn't attend → System can mark as "no_show" (optional)
│       - If cancelled before → Already marked "cancelled"
│
├─> TRANSITION: "completed"
│   └─> Doctor marks appointment complete after consultation
│       PATCH /api/appointments/{id}/status { status: "completed" }
│       - Activity logged: "Appointment completed"
│       - Appointment removed from patient's "upcoming" list
│       - Moves to patient's history
│       - Can generate consultation notes
│       - No further state changes possible
│
├─> TRANSITION: "cancelled"
│   └─> Appointment cancelled before date
│       - Can be cancelled by: Patient, Doctor (requires reason), Admin
│       - PATCH /api/appointments/{id}/cancel { reason: "..." }
│       - Activity logged: "Appointment cancelled"
│       - Slot becomes available for rebooking
│       - Patient/Doctor notified
│       - No further state changes possible
│
├─> TRANSITION: "no_show" (optional feature)
│   └─> Patient didn't attend scheduled appointment
│       - System detects: Current time > appointment_time + 15 min
│       - Automatically mark as "no_show" (optional)
│       - Or Doctor can manually mark
│       - AI model learns: no_show count increases
│       - Activity logged: "Missed appointment"
│
END: Appointment in final state (completed/cancelled/no_show)

ACTIVITY LOGGING:
- appointment_booked: When first created
- appointment_confirmed: When confirmed (if applicable)
- appointment_completed: When doctor marks complete
- appointment_cancelled: When cancelled
- reminder_sent: When doctor sends reminder
- consultation_notes_added: When notes added after completion
```

---

## System Processes

### 5.1 No-Show Risk Prediction Process

```
START: New appointment created or dashboard loads
│
├─> STEP 1: Trigger prediction
│   └─> When:
│       - Admin dashboard loads
│       - Doctor dashboard loads
│       - New appointment created
│       - Time: Every 5 minutes (optional cache refresh)
│
├─> STEP 2: Collect appointment data
│   └─> Query appointments for relevant period
│       (usually: today's appointments)
│
├─> STEP 3: For each appointment, extract features
│   └─> Query historical data:
│       
│       Feature 1: patientNoShowRate
│       - Query: SELECT COUNT(*) FROM appointments 
│         WHERE patient_id={id} AND status='no_show'
│       - Calculate: no_show_count / total_appointments
│       - Example: 2 / 10 = 0.20 (20%)
│       
│       Feature 2: daysSinceLastVisit
│       - Query: SELECT MAX(appointment_date) FROM appointments 
│         WHERE patient_id={id} AND status='completed'
│       - Calculate: TODAY - last_appointment_date
│       - Example: 45 days
│       
│       Feature 3: appointmentHour
│       - Extract from appointment_time
│       - Example: 14 (2 PM)
│       
│       Feature 4: hasRecentLabResult
│       - Query: SELECT * FROM medical_reports 
│         WHERE patient_id={id} AND created_at >= (TODAY - 30 days)
│       - Example: true or false
│
├─> STEP 4: Prepare AI request
│   └─> Build request to Flask AI service:
│       POST http://localhost:8001/predict/no-show
│       {
│         features: [
│           patientNoShowRate: 0.20,
│           daysSinceLastVisit: 45,
│           appointmentHour: 14,
│           hasRecentLabResult: true
│         ]
│       }
│
├─> STEP 5: Call AI service
│   └─> Backend sends POST request with timeout (5 seconds)
│       AI service receives request
│       XGBoost model makes prediction
│       Response: { probability: 0.35, label: "Medium", source: "xgboost" }
│       Where:
│       - probability: 0-1 decimal (0.35 = 35% chance of no-show)
│       - label: "Low" | "Medium" | "High"
│       - source: "xgboost" (model identifier)
│
├─> STEP 6: Handle AI service failure
│   └─> If AI service not responding:
│       - Timeout after 5 seconds
│       - Fall back to heuristic calculation:
│         
│         IF noShowRate > 0.3 AND daysSinceLastVisit > 90:
│           THEN risk = "High", probability = 0.75
│         ELSE IF noShowRate > 0.1 OR daysSinceLastVisit > 60:
│           THEN risk = "Medium", probability = 0.50
│         ELSE:
│           THEN risk = "Low", probability = 0.25
│       
│       - Source: "heuristic"
│       - Log fallback usage
│
├─> STEP 7: Color code risk
│   └─> Display mapping:
│       - Low (probability < 0.3): Green color
│       - Medium (0.3 ≤ probability ≤ 0.6): Yellow/Orange color
│       - High (probability > 0.6): Red color
│
├─> STEP 8: Display in doctor dashboard
│   └─> Show in appointments table:
│       - Risk label with color badge
│       - Hover to show probability percentage
│       - Example: "Medium (45%)"
│
├─> STEP 9: Doctor uses prediction
│   └─> Doctor can:
│       - Identify high-risk appointments
│       - Send reminder to at-risk patients
│       - Prepare for potential no-show
│       - Follow up proactively

END: No-show prediction displayed and used
```

### 5.2 Activity Logging Process

```
Activity Type: Any patient/doctor action
│
├─> STEP 1: Action occurs
│   └─> Examples:
│       - Appointment booked
│       - Reminder created
│       - Report uploaded
│       - Appointment completed
│
├─> STEP 2: Backend detects action
│   └─> In the same API request that performed the action
│       (e.g., after successful appointment booking)
│
├─> STEP 3: Create activity log entry
│   └─> INSERT into activities table:
│       {
│         activity_id: gen_random_uuid(),
│         patient_id: UUID,
│         activity_type: "appointment_booked",
│         description: "Booked appointment with Dr. Sarah Johnson on May 15, 2024 at 09:00",
│         activity_time: NOW()
│       }
│
├─> STEP 4: Activity appears in patient feed
│   └─> Next time patient views dashboard/history:
│       - GET /api/patient/activities is called
│       - New activity appears at top of feed
│       - Sorted by activity_time DESC
│
│       Display on dashboard:
│       - Icon: [appointment icon]
│       - Text: "Booked appointment with Dr. Sarah Johnson"
│       - Time: "Today at 09:00" or relative time "2 hours ago"

ACTIVITY TYPE CATALOG:

appointment_booked:
  - Triggered: POST /api/patient/appointments (success)
  - Description: "Booked appointment with Dr. {DoctorName} on {Date} at {Time}"

appointment_cancelled:
  - Triggered: PATCH /api/patient/appointments/{id}/cancel (success)
  - Description: "Cancelled appointment with Dr. {DoctorName}"

appointment_completed:
  - Triggered: Doctor marks in dashboard or system auto-marks
  - Description: "Appointment completed with Dr. {DoctorName}"

reminder_created:
  - Triggered: POST /api/patient/reminders (success)
  - Description: "Created medicine reminder for {MedicineName}"

reminder_completed:
  - Triggered: PATCH /api/patient/reminders/{id}/status to "completed"
  - Description: "Took {MedicineName} - {Dosage}"

report_uploaded:
  - Triggered: POST /api/patient/reports (file upload success)
  - Description: "Uploaded medical report: {FileName}"

lab_result_received:
  - Triggered: System or doctor action
  - Description: "Received lab results from {Lab}"

prescription_received:
  - Triggered: Doctor action after appointment
  - Description: "Received prescription from Dr. {DoctorName}"
```

---

## Data Flow Diagrams

### 6.1 Patient Registration Data Flow

```
┌─────────────────────────┐
│   FRONTEND (React)      │
│                         │
│ 1. Registration Form    │
│    - fullName           │
│    - email              │
│    - phone              │
│    - password           │
│    - role: "patient"    │
└──────────────┬──────────┘
               │
               │ POST /api/auth/register
               │ (JSON payload)
               ▼
┌─────────────────────────┐
│  BACKEND (Express)      │
│                         │
│ 2. Validate input       │
│ 3. Hash password (bcrypt)
│ 4. Create user record   │
│ 5. Create patient record
│ 6. Generate JWT token   │
└──────────────┬──────────┘
               │
               │ Response: 201 Created
               │ {
               │   user: {...},
               │   session: {
               │     access_token,
               │     token_type
               │   }
               │ }
               ▼
┌─────────────────────────┐
│   FRONTEND (React)      │
│                         │
│ 7. Save to localStorage │
│    - token              │
│    - role               │
│    - patient_id         │
│ 8. Update auth context  │
│ 9. Redirect to dashboard
└─────────────────────────┘
               │
               ▼
┌─────────────────────────┐
│  DATABASE (PostgreSQL)  │
│                         │
│ users table:            │
│  ├─ user_id (UUID)      │
│  ├─ name                │
│  ├─ email (UNIQUE)      │
│  ├─ password_hash       │
│  ├─ phone               │
│  ├─ role: "patient"     │
│  └─ created_at          │
│                         │
│ patients table:         │
│  ├─ patient_id (FK)     │
│  ├─ age                 │
│  ├─ gender              │
│  └─ medical_history     │
└─────────────────────────┘
```

### 6.2 Appointment Booking Data Flow

```
┌──────────────────────┐
│  FRONTEND (React)    │
│                      │
│ Doctor Search        │ ──────┐
│ { search: "cardio" } │       │
└──────────────────────┘       │
          │                     │
          │ GET /api/doctors?search=cardio
          ▼
┌──────────────────────┐
│ BACKEND (Express)    │
│                      │
│ Query doctors table  │
│ WHERE name ILIKE     │
│ UNION specialization │
│ UNION hospital       │
└──────────────────────┘
          │
          │ Response: [{doctor1}, {doctor2}]
          ▼
┌──────────────────────┐
│  FRONTEND (React)    │
│                      │
│ Display Doctor Cards │ ──────┐
│ User selects doctor  │       │
└──────────────────────┘       │
          │                     │
          │ GET /api/doctors/{id}/slots?date=2024-05-15
          ▼
┌──────────────────────┐
│ BACKEND (Express)    │
│                      │
│ Load doctor schedule │
│ from available_hours │
│ Generate slots:      │
│  - Check working_day │
│  - Get start/end time
│  - Generate 30min    │
│    intervals         │
│  - Remove breaks     │
│  - Remove booked     │
│    appointments      │
└──────────────────────┘
          │
          │ Response: ["09:00", "09:30", "10:00"]
          ▼
┌──────────────────────┐
│  FRONTEND (React)    │
│                      │
│ Display time slots   │ ──────┐
│ User selects slot    │       │
│ User enters reason   │       │
└──────────────────────┘       │
          │                     │
          │ POST /api/patient/appointments
          │ {
          │   patient_id,
          │   doctor_id,
          │   appointment_date,
          │   appointment_time,
          │   visit_type,
          │   consultation_reason
          │ }
          ▼
┌──────────────────────┐
│ BACKEND (Express)    │
│                      │
│ 1. Check slot        │
│    availability      │
│ 2. Validate data     │
│ 3. Create appointment
│ 4. Create activity   │
│    log entry         │
│ 5. Return appointment
│    with ID           │
└──────────────────────┘
          │
          │ Response: 201
          │ {appointment_id, status: "scheduled"}
          ▼
┌──────────────────────┐
│  FRONTEND (React)    │
│                      │
│ Show confirmation    │ ──────┐
│ Save appointment ID  │       │
│ Store in state       │       │
└──────────────────────┘       │
          │                     │
          ▼
┌──────────────────────┐
│  DATABASE (PostgreSQL)
│                      │
│ appointments table:  │
│  ├─ appointment_id   │
│  ├─ patient_id (FK)  │
│  ├─ doctor_id (FK)   │
│  ├─ appointment_date │
│  ├─ appointment_time │
│  ├─ status: "scheduled"
│  ├─ visit_type       │
│  ├─ consultation_reason
│  └─ created_at       │
│                      │
│ activities table:    │
│  ├─ activity_id      │
│  ├─ patient_id       │
│  ├─ activity_type    │
│  │  "appointment_booked"
│  ├─ description      │
│  └─ activity_time    │
└──────────────────────┘
```

### 6.3 Doctor Dashboard Data Flow

```
┌──────────────────────┐
│  FRONTEND (React)    │
│                      │
│ Doctor Dashboard     │ ──────┐
│ page loads           │       │
└──────────────────────┘       │
          │                     │
          │ GET /api/doctor/dashboard
          │ Authorization: Bearer {token}
          ▼
┌──────────────────────┐
│ BACKEND (Express)    │
│                      │
│ Extract doctor_id    │
│ from JWT token       │
│                      │
│ 1. Fetch today's     │
│    appointments      │
│ 2. For each appt:    │
│    - Get patient info
│    - Calculate       │
│      no-show risk    │
│    - Join with doctor│
│      info            │
│ 3. Fetch unread      │
│    notifications     │
│ 4. Calculate metrics │
└──────────────────────┘
          │
          ├─► Query: SELECT appointments WHERE
          │    doctor_id={id} AND 
          │    appointment_date=TODAY
          │
          ├─► For each appointment:
          │    - Query patient history
          │    - Call AI service:
          │      POST /predict/no-show
          │    - Get risk probability
          │
          └─► Query: SELECT notifications WHERE
              doctor_id={id} AND is_read=false
               
          │
          │ Response:
          │ {
          │   summary: {
          │     today_appointments: 8,
          │     unique_patients: 24,
          │     unread_notifications: 3,
          │     high_no_show_risk: 2
          │   },
          │   appointments: [
          │     {
          │       appointment_id,
          │       patient_name,
          │       time,
          │       visit_type,
          │       no_show_risk: {
          │         probability: 0.35,
          │         label: "Medium"
          │       }
          │     },
          │     ...
          │   ],
          │   notifications: [...]
          │ }
          ▼
┌──────────────────────┐
│  FRONTEND (React)    │
│                      │
│ Render dashboard:    │
│ - Summary cards      │
│ - Appointment table  │
│ - Notifications      │
│ - Quick actions      │
│                      │
│ Doctor can:          │
│ - Send reminder      │
│ - View summary       │
│ - Mark as read       │
└──────────────────────┘
```

---

## Error Handling Flows

### 7.1 API Error Handling

```
CLIENT REQUEST
│
├─> STEP 1: Network Error
│   └─> No response from server (timeout > 10s)
│       Frontend:
│       - Catch fetch error
│       - Show toast: "Network error. Please check your connection."
│       - Retry button with exponential backoff
│       - Fallback to offline state if applicable
│
├─> STEP 2: 4xx Error (Client Error)
│   └─> Response 400: Bad Request
│       Example: Invalid appointment date
│       Frontend:
│       - Show specific error message from server
│       - Highlight form fields with errors
│       - User corrects and resubmits
│
│   └─> Response 401: Unauthorized
│       Example: Missing or invalid JWT token
│       Frontend:
│       - Redirect to login page
│       - Clear localStorage tokens
│       - Show message: "Session expired. Please login again."
│
│   └─> Response 403: Forbidden
│       Example: Doctor trying to access patient API
│       Frontend:
│       - Redirect to role-specific home page
│       - Show message: "You don't have permission to access this"
│
│   └─> Response 404: Not Found
│       Example: Appointment ID doesn't exist
│       Frontend:
│       - Show error: "Appointment not found"
│       - Offer navigation back
│
├─> STEP 3: 5xx Error (Server Error)
│   └─> Response 500: Internal Server Error
│       Frontend:
│       - Show generic error: "Something went wrong. Try again later."
│       - Log error to monitoring service
│       - Offer support contact
│
│   └─> Response 503: Service Unavailable
│       Example: Database connection lost
│       Frontend:
│       - Show: "Service temporarily unavailable"
│       - Suggest: "Try again in a few moments"
│       - Queue action for retry
│
END: Error handled appropriately
```

### 7.2 Database Error Handling

```
DATABASE OPERATION
│
├─> Constraint Violation
│   └─> Unique constraint: Email already exists
│       UNIQUE constraint on users.email
│       Backend:
│       - Catch database error
│       - Return 409 Conflict response
│       - Include error message: "Email already registered"
│       Frontend:
│       - Show field error under email input
│       - User can change email and retry
│
├─> Foreign Key Error
│   └─> Doctor ID doesn't exist
│       FOREIGN KEY constraint on appointments.doctor_id
│       Backend:
│       - Catch error during INSERT
│       - Return 400 Bad Request
│       - Message: "Invalid doctor selection"
│
├─> Data Type Error
│   └─> Invalid date format
│       Expected: YYYY-MM-DD, Received: 05-15-2024
│       Backend:
│       - Validation catches before database
│       - Return 400 with message
│       - Frontend shows format hint
│
├─> Connection Error
│   └─> Database pool connection lost
│       Backend:
│       - Retry connection (configurable attempts)
│       - If all retries fail:
│         - Return 503 Service Unavailable
│         - Alert ops/monitoring
│       Frontend:
│       - User sees: "Service temporarily unavailable"
│
END: Database error handled gracefully
```

### 7.3 AI Service Failure Handling

```
CALL AI NO-SHOW PREDICTION SERVICE
│
├─> STEP 1: AI Service Timeout
│   └─> No response within 5 seconds
│       Backend:
│       - Catch timeout error
│       - Fall back to heuristic calculation
│       - Use formula (see System Processes section)
│       - Return result with source: "heuristic"
│       - Log: "AI service timeout, using fallback"
│
├─> STEP 2: AI Service Returns Error
│   └─> Response 500 from AI service
│       Example: Model file corrupted
│       Backend:
│       - Catch error
│       - Use heuristic fallback
│       - Log error with timestamp
│
├─> STEP 3: Invalid Response from AI
│   └─> Response doesn't match expected format
│       Example: Probability > 1.0 or missing field
│       Backend:
│       - Validate response structure
│       - If invalid: Use heuristic
│       - Log validation error
│
├─> STEP 4: Use Heuristic Calculation
│   └─> Calculate risk without AI:
│       IF (noShowRate > 0.3 AND daysSinceLastVisit > 90) THEN
│         risk = "High", probability = 0.75
│       ELSE IF (noShowRate > 0.1 OR daysSinceLastVisit > 60) THEN
│         risk = "Medium", probability = 0.50
│       ELSE
│         risk = "Low", probability = 0.25
│
├─> STEP 5: Return Result
│   └─> Backend returns to frontend:
│       {
│         probability: 0.35,
│         label: "Medium",
│         source: "heuristic"  // Indicates fallback used
│       }
│
└─> STEP 6: Frontend Display
    └─> Show risk indicator
        Note: Uses fallback, AI not available
        (Optional: Show indicator that AI is offline)

END: Prediction available via fallback mechanism
```

### 7.4 File Upload Error Handling

```
MEDICAL REPORT UPLOAD
│
├─> STEP 1: File Size Limit
│   └─> File > 2MB
│       Frontend:
│       - Validate file size before upload
│       - Show: "File must be less than 2MB"
│       - Don't submit
│
│       Backend:
│       - Multer max size: 2MB
│       - If exceeded: Return 413 Payload Too Large
│       - Frontend shows error
│
├─> STEP 2: Invalid File Type
│   └─> User tries to upload .exe file
│       Frontend (optional):
│       - Validate extension (.pdf, .jpg, .png, etc.)
│       - Show: "File type not allowed"
│
│       Backend:
│       - Check MIME type from file
│       - If not in whitelist: Reject
│       - Return 400 Bad Request
│
├─> STEP 3: Upload Interrupted
│   └─> User closes browser mid-upload
│       Frontend:
│       - Detect abort event
│       - Show: "Upload cancelled"
│       - Cleanup in-progress state
│
│       Backend:
│       - Incomplete upload → Clean up temp file
│       - Don't create record in database
│
├─> STEP 4: Disk Space Full
│   └─> Server runs out of disk space
│       Backend:
│       - File write fails
│       - Catch error, don't create DB record
│       - Return 507 Insufficient Storage
│       - Alert ops
│
│       Frontend:
│       - Show: "Upload failed. Try again later."
│       - Support contact link
│
├─> STEP 5: Successful Upload
│   └─> File saved, record created
│       Response: { report_id, file_name, file_path }
│       Frontend:
│       - Show: "File uploaded successfully"
│       - Report appears in list
│       - User can download or delete

END: File upload completed or error handled
```

---

## Flow Summary Table

| Flow | Initiator | Start | End | Key Dependencies |
|------|-----------|-------|-----|------------------|
| Registration | User | Landing page | Dashboard | DB, Email validation |
| Login | User | Login page | Dashboard | DB, JWT |
| Route Protection | System | Navigation attempt | Route access | Token, Role |
| Dashboard View | Patient | Navigate /dashboard | Dashboard displayed | API calls, DB |
| Appointment Booking | Patient | Book button | Confirmation | Doctor API, DB |
| Send Reminder | Doctor | Reminder button | Activity logged | DB, Notification |
| Schedule Management | Doctor | Settings page | Schedule saved | DB validation |
| Admin Dashboard | Admin | Navigate /admin-dashboard | Stats displayed | DB aggregation |
| Appointment Management | Admin | Appointments page | Appointments displayed | DB queries, Pagination |
| No-Show Prediction | System | Doctor dashboard load | Risk calculated | AI service, DB |
| Activity Logging | System | Any action | Activity recorded | DB write |

---

## Conclusion

This comprehensive flow documentation outlines all major user flows, system processes, and data flows in the ClinixOne application. Each flow provides detailed step-by-step instructions showing what happens at each layer (frontend, backend, database, AI service) when users interact with the system.

For implementation, developers should refer to the specific flow relevant to the feature they're building and follow the step-by-step process outlined. Error handling flows ensure graceful degradation and user-friendly error messages throughout the application.

