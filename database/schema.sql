-- ClinixOne PostgreSQL schema

create extension if not exists "pgcrypto";

create table if not exists public.users (
  user_id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  phone text,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  patient_id uuid primary key references public.users(user_id) on delete cascade,
  age int,
  gender text,
  medical_history text
);

create table if not exists public.doctors (
  doctor_id uuid primary key references public.users(user_id) on delete cascade,
  name text,
  specialization text,
  experience int,
  availability text,
  rating decimal(3,2) default 4.5,
  consultation_fee int default 500,
  qualification text,
  hospital text,
  available_hours jsonb default '{"working_days": ["mon", "tue", "wed", "thu", "fri"], "working_hours": {"mon": {"start": "09:00", "end": "17:00"}, "tue": {"start": "09:00", "end": "17:00"}, "wed": {"start": "09:00", "end": "17:00"}, "thu": {"start": "09:00", "end": "17:00"}, "fri": {"start": "09:00", "end": "17:00"}, "sat": {"start": "10:00", "end": "14:00"}, "sun": null}, "break_times": {"mon": [], "tue": [], "wed": [], "thu": [], "fri": [], "sat": [], "sun": []}, "consultation_modes": ["online", "in-clinic"], "slot_interval_minutes": 30}'::jsonb
);

create table if not exists public.appointments (
  appointment_id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(patient_id) on delete cascade,
  doctor_id uuid not null references public.doctors(doctor_id) on delete cascade,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'scheduled',
  visit_type text default 'in-clinic' check (visit_type in ('online', 'in-clinic')),
  consultation_reason text,
  consultation_fee int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medicine_reminders (
  reminder_id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(patient_id) on delete cascade,
  medicine_name text not null,
  dosage text not null,
  reminder_time time not null,
  status text not null default 'pending'
);

create table if not exists public.activities (
  activity_id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(patient_id) on delete cascade,
  activity_type text not null,
  description text not null,
  activity_time timestamptz not null default now()
);

create table if not exists public.medical_reports (
  report_id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(patient_id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_notifications (
  notification_id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(doctor_id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_doctors_specialization on public.doctors(specialization);
create index if not exists idx_appointments_patient_date on public.appointments(patient_id, appointment_date);
create index if not exists idx_appointments_doctor_date on public.appointments(doctor_id, appointment_date);
create index if not exists idx_reminders_patient on public.medicine_reminders(patient_id);
create index if not exists idx_activities_patient_time on public.activities(patient_id, activity_time desc);
create index if not exists idx_doctor_notifications_doctor_created on public.doctor_notifications(doctor_id, created_at desc);
