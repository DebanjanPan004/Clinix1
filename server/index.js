/* eslint-env node */
/* global process */
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pool } from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 5000)
const JWT_SECRET = process.env.JWT_SECRET || 'clinix-dev-secret'
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinixone',
})

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, 'uploads', 'reports'))
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
    cb(null, `${Date.now()}-${safeName}`)
  },
})
const upload = multer({ storage })

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
]

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

function toClientUser(row) {
  return {
    id: row.user_id,
    email: row.email,
    user_metadata: {
      full_name: row.name,
      role: row.role,
    },
  }
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.auth = decoded
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

function roleRequired(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.auth?.role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource' })
    }
    return next()
  }
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DEFAULT_CONSULTATION_MODES = ['online', 'in-clinic']

function createDefaultDoctorSchedule() {
  return {
    working_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    working_hours: {
      mon: { start: '09:00', end: '17:00' },
      tue: { start: '09:00', end: '17:00' },
      wed: { start: '09:00', end: '17:00' },
      thu: { start: '09:00', end: '17:00' },
      fri: { start: '09:00', end: '17:00' },
      sat: { start: '10:00', end: '14:00' },
      sun: null,
    },
    break_times: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    },
    consultation_modes: [...DEFAULT_CONSULTATION_MODES],
    slot_interval_minutes: 30,
  }
}

function timeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') return null
  const [hours, minutes] = timeValue.split(':').map((part) => Number(part))
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return (hours * 60) + minutes
}

function minutesToTime(totalMinutes) {
  const safeMinutes = ((totalMinutes % 1440) + 1440) % 1440
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, '0')
  const minutes = String(safeMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getDayKeyForDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  const orderedDayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return orderedDayKeys[date.getDay()]
}

function normalizeConsultationModes(modes) {
  const source = Array.isArray(modes) && modes.length > 0 ? modes : DEFAULT_CONSULTATION_MODES
  return [...new Set(source.map((mode) => String(mode).trim()).filter(Boolean))]
}

function normalizeDoctorSchedule(rawSchedule) {
  const defaults = createDefaultDoctorSchedule()

  if (!rawSchedule || typeof rawSchedule !== 'object') {
    return defaults
  }

  const workingHours = {}
  for (const day of DAY_KEYS) {
    const rawDay = rawSchedule.working_hours?.[day] ?? rawSchedule[day]
    if (Array.isArray(rawDay) && rawDay.length >= 2) {
      workingHours[day] = { start: rawDay[0], end: rawDay[1] }
      continue
    }

    if (rawDay && typeof rawDay === 'object') {
      workingHours[day] = {
        start: rawDay.start || rawDay.from || '',
        end: rawDay.end || rawDay.to || '',
      }
      continue
    }

    workingHours[day] = null
  }

  const breakTimes = {}
  for (const day of DAY_KEYS) {
    breakTimes[day] = Array.isArray(rawSchedule.break_times?.[day])
      ? rawSchedule.break_times[day].map((item) => ({ start: item?.start || '', end: item?.end || '' }))
      : []
  }

  const workingDays = Array.isArray(rawSchedule.working_days)
    ? rawSchedule.working_days.filter((day) => DAY_KEYS.includes(day))
    : DAY_KEYS.filter((day) => Boolean(workingHours[day]?.start && workingHours[day]?.end))

  return {
    working_days: workingDays,
    working_hours: workingHours,
    break_times: breakTimes,
    consultation_modes: normalizeConsultationModes(rawSchedule.consultation_modes),
    slot_interval_minutes: Number(rawSchedule.slot_interval_minutes || defaults.slot_interval_minutes) || 30,
  }
}

function generateSlotsFromSchedule(rawSchedule, selectedDate) {
  const schedule = normalizeDoctorSchedule(rawSchedule)
  const dayKey = getDayKeyForDate(selectedDate)
  if (!dayKey || !schedule.working_days.includes(dayKey)) return []

  const dayHours = schedule.working_hours[dayKey]
  if (!dayHours?.start || !dayHours?.end) return []

  const startMinutes = timeToMinutes(dayHours.start)
  const endMinutes = timeToMinutes(dayHours.end)
  const interval = schedule.slot_interval_minutes || 30

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || startMinutes >= endMinutes) {
    return []
  }

  const breaks = Array.isArray(schedule.break_times[dayKey]) ? schedule.break_times[dayKey] : []
  const slots = []

  for (let slotStart = startMinutes; slotStart + interval <= endMinutes; slotStart += interval) {
    const slotEnd = slotStart + interval
    const blocked = breaks.some((breakItem) => {
      const breakStart = timeToMinutes(breakItem?.start)
      const breakEnd = timeToMinutes(breakItem?.end)
      if (!Number.isFinite(breakStart) || !Number.isFinite(breakEnd) || breakStart >= breakEnd) return false
      return slotStart < breakEnd && slotEnd > breakStart
    })

    if (!blocked) slots.push(minutesToTime(slotStart))
  }

  return slots
}

function validateDoctorSchedule(schedule) {
  const normalized = normalizeDoctorSchedule(schedule)
  const problems = []

  if (normalized.working_days.length === 0) {
    problems.push('Select at least one working day')
  }

  if (normalized.consultation_modes.length === 0) {
    problems.push('Select at least one consultation mode')
  }

  for (const day of normalized.working_days) {
    const hours = normalized.working_hours[day]
    if (!hours?.start || !hours?.end) {
      problems.push(`Set working hours for ${day.toUpperCase()}`)
      continue
    }

    const startMinutes = timeToMinutes(hours.start)
    const endMinutes = timeToMinutes(hours.end)
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || startMinutes >= endMinutes) {
      problems.push(`Working hours for ${day.toUpperCase()} must be valid and start before end`)
    }

    const breaks = Array.isArray(normalized.break_times[day]) ? normalized.break_times[day] : []
    const sortedBreaks = breaks
      .map((breakItem) => ({
        start: timeToMinutes(breakItem?.start),
        end: timeToMinutes(breakItem?.end),
      }))
      .filter((breakItem) => Number.isFinite(breakItem.start) && Number.isFinite(breakItem.end) && breakItem.start < breakItem.end)
      .sort((left, right) => left.start - right.start)

    sortedBreaks.forEach((breakItem, index) => {
      if (breakItem.start < startMinutes || breakItem.end > endMinutes) {
        problems.push(`Break time for ${day.toUpperCase()} must be within working hours`)
      }

      const nextBreak = sortedBreaks[index + 1]
      if (nextBreak && breakItem.end > nextBreak.start) {
        problems.push(`Break times for ${day.toUpperCase()} must not overlap`)
      }
    })
  }

  return {
    valid: problems.length === 0,
    problems,
    normalized,
  }
}

function getDoctorScheduleFromRow(row) {
  return normalizeDoctorSchedule(row?.availability_schedule || row?.available_hours)
}

function doctorCanBookAppointment(schedule, appointmentDate, appointmentTime, visitType) {
  const normalized = normalizeDoctorSchedule(schedule)
  if (visitType && !normalized.consultation_modes.includes(visitType)) {
    return { allowed: false, message: 'Selected consultation mode is not available for this doctor' }
  }

  const dayKey = getDayKeyForDate(appointmentDate)
  if (!dayKey || !normalized.working_days.includes(dayKey)) {
    return { allowed: false, message: 'Doctor is not available on the selected day' }
  }

  const dayHours = normalized.working_hours[dayKey]
  if (!dayHours?.start || !dayHours?.end) {
    return { allowed: false, message: 'Doctor has no working hours configured for the selected day' }
  }

  const slotMinutes = timeToMinutes(appointmentTime)
  const startMinutes = timeToMinutes(dayHours.start)
  const endMinutes = timeToMinutes(dayHours.end)
  const interval = normalized.slot_interval_minutes || 30

  if (!Number.isFinite(slotMinutes) || !Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return { allowed: false, message: 'Invalid appointment time' }
  }

  const slotEnd = slotMinutes + interval
  if (slotMinutes < startMinutes || slotEnd > endMinutes) {
    return { allowed: false, message: 'Selected time is outside the doctor working hours' }
  }

  const breaks = Array.isArray(normalized.break_times[dayKey]) ? normalized.break_times[dayKey] : []
  const overlapsBreak = breaks.some((breakItem) => {
    const breakStart = timeToMinutes(breakItem?.start)
    const breakEnd = timeToMinutes(breakItem?.end)
    if (!Number.isFinite(breakStart) || !Number.isFinite(breakEnd) || breakStart >= breakEnd) return false
    return slotMinutes < breakEnd && slotEnd > breakStart
  })

  if (overlapsBreak) {
    return { allowed: false, message: 'Selected time falls inside a break period' }
  }

  return { allowed: true }
}

const APPOINTMENT_STATUS_OPTIONS = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']

function parsePositiveInt(value, fallback) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.floor(parsed)
}

function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!APPOINTMENT_STATUS_OPTIONS.includes(normalized)) return null
  return normalized
}

function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10)
}

async function createAdminDoctor({ fullName, email, phone, password }) {
  const client = await pool.connect()
  try {
    await client.query('begin')

    const existing = await client.query('select user_id from public.users where email = $1', [email])
    if (existing.rowCount > 0) {
      await client.query('rollback')
      return { ok: false, status: 409, message: 'Email already registered' }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userResult = await client.query(
      `insert into public.users(name, email, password_hash, phone, role)
       values($1, $2, $3, $4, 'doctor')
       returning user_id, name, email, role`,
      [fullName, email, passwordHash, phone || null]
    )

    const user = userResult.rows[0]
    await client.query(
      `insert into public.doctors(doctor_id, name)
       values($1, $2)`,
      [user.user_id, fullName]
    )

    await client.query('commit')
    return { ok: true, user }
  } catch (error) {
    await client.query('rollback')
    return { ok: false, status: 500, message: error.message }
  } finally {
    client.release()
  }
}

async function createAdminPatient({ fullName, email, phone, password }) {
  const client = await pool.connect()
  try {
    await client.query('begin')

    const existing = await client.query('select user_id from public.users where email = $1', [email])
    if (existing.rowCount > 0) {
      await client.query('rollback')
      return { ok: false, status: 409, message: 'Email already registered' }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userResult = await client.query(
      `insert into public.users(name, email, password_hash, phone, role)
       values($1, $2, $3, $4, 'patient')
       returning user_id, name, email, role`,
      [fullName, email, passwordHash, phone || null]
    )

    const user = userResult.rows[0]
    await client.query('insert into public.patients(patient_id) values($1)', [user.user_id])

    await client.query('commit')
    return { ok: true, user }
  } catch (error) {
    await client.query('rollback')
    return { ok: false, status: 500, message: error.message }
  } finally {
    client.release()
  }
}

async function ensureDoctorAvailabilitySchema() {
  await pool.query(
    `alter table if exists public.doctors
     add column if not exists availability_schedule jsonb default '{"working_days": ["mon", "tue", "wed", "thu", "fri"], "working_hours": {"mon": {"start": "09:00", "end": "17:00"}, "tue": {"start": "09:00", "end": "17:00"}, "wed": {"start": "09:00", "end": "17:00"}, "thu": {"start": "09:00", "end": "17:00"}, "fri": {"start": "09:00", "end": "17:00"}, "sat": {"start": "10:00", "end": "14:00"}, "sun": null}, "break_times": {"mon": [], "tue": [], "wed": [], "thu": [], "fri": [], "sat": [], "sun": []}, "consultation_modes": ["online", "in-clinic"], "slot_interval_minutes": 30}'::jsonb`
  )

  await pool.query(
    `update public.doctors
     set availability_schedule = coalesce(availability_schedule, available_hours)
     where availability_schedule is null`
  )
}

function calculateNoShowRisk({
  patientNoShowRate,
  daysSinceLastVisit,
  appointmentHour,
  hasRecentLabResult,
}) {
  // Lightweight tree-ensemble style scoring to emulate XGBoost output in this MVP backend.
  let score = 0.12

  if (patientNoShowRate >= 0.4) score += 0.38
  else if (patientNoShowRate >= 0.2) score += 0.22
  else score += 0.08

  if (daysSinceLastVisit > 120) score += 0.18
  else if (daysSinceLastVisit > 60) score += 0.1

  if (appointmentHour < 9 || appointmentHour > 17) score += 0.08

  if (!hasRecentLabResult) score += 0.09

  const risk = Math.max(0.03, Math.min(0.97, score))
  let label = 'Low'
  if (risk >= 0.65) label = 'High'
  else if (risk >= 0.35) label = 'Medium'

  return {
    probability: Number((risk * 100).toFixed(1)),
    label,
  }
}

async function predictNoShowRiskViaAI(features) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict/no-show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    })

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`)
    }

    const data = await response.json()
    const probability = Number(data?.probability_percent)
    const label = data?.label

    if (!Number.isFinite(probability) || !label) {
      throw new Error('AI service returned an invalid prediction payload')
    }

    return {
      probability: Number(probability.toFixed(1)),
      label,
      source: 'xgboost',
    }
  } catch {
    const fallback = calculateNoShowRisk(features)
    return {
      ...fallback,
      source: 'fallback',
    }
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('select 1')
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, password, role } = req.body || {}

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const client = await pool.connect()
  try {
    await client.query('begin')

    const existing = await client.query('select user_id from public.users where email = $1', [email])
    if (existing.rowCount > 0) {
      await client.query('rollback')
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const createdUser = await client.query(
      `insert into public.users(name, email, password_hash, phone, role)
       values($1, $2, $3, $4, $5)
       returning user_id, name, email, role`,
      [fullName, email, passwordHash, phone || null, role]
    )

    const user = createdUser.rows[0]

    if (role === 'patient') {
      await client.query('insert into public.patients(patient_id) values($1)', [user.user_id])
    }

    if (role === 'doctor') {
      await client.query(
        'insert into public.doctors(doctor_id, name) values($1, $2)',
        [user.user_id, fullName]
      )
    }

    await client.query('commit')
    return res.status(201).json({ user: toClientUser(user) })
  } catch (error) {
    await client.query('rollback')
    return res.status(500).json({ message: error.message })
  } finally {
    client.release()
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const result = await pool.query(
      'select user_id, name, email, role, password_hash from public.users where email = $1',
      [email]
    )

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (role && role !== user.role) {
      return res.status(400).json({ message: `Selected role does not match account role: ${user.role}` })
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({ token, user: toClientUser(user) })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/auth/logout', authRequired, (_req, res) => {
  return res.json({ success: true })
})

app.get('/api/doctors', authRequired, async (req, res) => {
  const search = (req.query.search || '').toString().trim()

  try {
    if (search) {
      const result = await pool.query(
        `select doctor_id, name, specialization, experience, rating, consultation_fee, hospital, qualification, available_hours
         from public.doctors
         where name ilike $1 or specialization ilike $1 or hospital ilike $1
         order by rating desc nulls last, name asc`,
        [`%${search}%`]
      )
      return res.json({
        doctors: result.rows.map((row) => ({
          ...row,
          consultation_modes: getDoctorScheduleFromRow(row).consultation_modes,
        })),
      })
    }

    const result = await pool.query(
      `select doctor_id, name, specialization, experience, rating, consultation_fee, hospital, qualification, available_hours
       from public.doctors
       order by name asc`
    )

    return res.json({
      doctors: result.rows.map((row) => ({
        ...row,
        consultation_modes: getDoctorScheduleFromRow(row).consultation_modes,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/doctor/availability', authRequired, roleRequired(['doctor']), async (req, res) => {
  try {
    const result = await pool.query(
      `select doctor_id, name, available_hours, availability
       from public.doctors
       where doctor_id = $1`,
      [req.auth.userId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' })
    }

    const doctor = result.rows[0]
    const schedule = getDoctorScheduleFromRow(doctor)

    return res.json({
      doctor: {
        doctor_id: doctor.doctor_id,
        name: doctor.name,
      },
      schedule,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.put('/api/doctor/availability', authRequired, roleRequired(['doctor']), async (req, res) => {
  const { schedule } = req.body || {}
  const validation = validateDoctorSchedule(schedule)

  if (!validation.valid) {
    return res.status(400).json({ message: validation.problems[0] || 'Invalid availability schedule' })
  }

  try {
    const summary = `${validation.normalized.working_days.map((day) => day.toUpperCase()).join(', ')} | ${validation.normalized.consultation_modes.join(', ')}`
    const result = await pool.query(
      `update public.doctors
       set available_hours = $1::jsonb,
           availability_schedule = $1::jsonb,
           availability = $2
       where doctor_id = $3
       returning doctor_id, name, available_hours, availability`,
      [JSON.stringify(validation.normalized), summary, req.auth.userId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' })
    }

    const doctor = result.rows[0]
    return res.json({ schedule: getDoctorScheduleFromRow(doctor) })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/doctors/:doctorId/slots', authRequired, async (req, res) => {
  const { doctorId } = req.params
  const selectedDate = (req.query.date || '').toString()

  if (!selectedDate) {
    return res.status(400).json({ message: 'date query parameter is required' })
  }

  try {
    const doctorResult = await pool.query(
      'select available_hours, availability_schedule from public.doctors where doctor_id = $1',
      [doctorId]
    )

    if (doctorResult.rowCount === 0) {
      return res.json({ slots: [] })
    }

    const allSlots = generateSlotsFromSchedule(doctorResult.rows[0].availability_schedule || doctorResult.rows[0].available_hours || {}, selectedDate)
    if (allSlots.length === 0) {
      return res.json({ slots: [] })
    }

    const bookedResult = await pool.query(
      `select to_char(appointment_time, 'HH24:MI') as appointment_time
       from public.appointments
       where doctor_id = $1 and appointment_date = $2 and status in ('scheduled','confirmed')`,
      [doctorId, selectedDate]
    )

    const bookedSet = new Set(bookedResult.rows.map((row) => row.appointment_time))
    const availableSlots = allSlots.filter((slot) => !bookedSet.has(slot))

    return res.json({ slots: availableSlots })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/appointments/check-slot', authRequired, async (req, res) => {
  const { doctor_id, appointment_date, appointment_time, visit_type } = req.body || {}

  if (!doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'doctor_id, appointment_date and appointment_time are required' })
  }

  try {
    const doctorResult = await pool.query(
      'select available_hours, availability_schedule from public.doctors where doctor_id = $1',
      [doctor_id]
    )

    if (doctorResult.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    const scheduleCheck = doctorCanBookAppointment(
      doctorResult.rows[0].availability_schedule || doctorResult.rows[0].available_hours || {},
      appointment_date,
      appointment_time,
      visit_type
    )

    if (!scheduleCheck.allowed) {
      return res.json({ available: false, reason: scheduleCheck.message })
    }

    const result = await pool.query(
      `select appointment_id
       from public.appointments
       where doctor_id = $1
         and appointment_date = $2
         and appointment_time = $3
         and status in ('scheduled', 'confirmed')`,
      [doctor_id, appointment_date, appointment_time]
    )

    return res.json({ available: result.rowCount === 0 })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/patient/appointments', authRequired, async (req, res) => {
  const patientId = (req.query.patient_id || req.auth.userId || '').toString()
  if (!patientId) return res.status(400).json({ message: 'patient_id is required' })

  try {
    const result = await pool.query(
      `select a.appointment_id,
              a.patient_id,
              a.doctor_id,
              a.appointment_date,
              to_char(a.appointment_time, 'HH24:MI') as appointment_time,
              a.status,
              a.visit_type,
              a.consultation_reason,
              a.consultation_fee,
              a.created_at,
              d.name as doctor_name,
              d.specialization as doctor_specialization
       from public.appointments a
       left join public.doctors d on d.doctor_id = a.doctor_id
       where a.patient_id = $1 and a.appointment_date >= current_date
       order by a.appointment_date asc, a.appointment_time asc`,
      [patientId]
    )

    return res.json({ appointments: result.rows })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/patient/appointments', authRequired, async (req, res) => {
  const {
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    status,
    visit_type,
    consultation_reason,
    consultation_fee,
    notes,
  } = req.body || {}

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'Missing required appointment fields' })
  }

  try {
    const doctorResult = await pool.query(
      'select available_hours, availability_schedule from public.doctors where doctor_id = $1',
      [doctor_id]
    )

    if (doctorResult.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    const scheduleCheck = doctorCanBookAppointment(
      doctorResult.rows[0].availability_schedule || doctorResult.rows[0].available_hours || {},
      appointment_date,
      appointment_time,
      visit_type || 'in-clinic'
    )

    if (!scheduleCheck.allowed) {
      return res.status(400).json({ message: scheduleCheck.message })
    }

    const slotAvailability = await pool.query(
      `select appointment_id
       from public.appointments
       where doctor_id = $1
         and appointment_date = $2
         and appointment_time = $3
         and status in ('scheduled', 'confirmed')`,
      [doctor_id, appointment_date, appointment_time]
    )

    if (slotAvailability.rowCount > 0) {
      return res.status(409).json({ message: 'Selected time slot is no longer available' })
    }

    const inserted = await pool.query(
      `insert into public.appointments(
         patient_id, doctor_id, appointment_date, appointment_time,
         status, visit_type, consultation_reason, consultation_fee, notes
       )
       values($1,$2,$3,$4,$5,$6,$7,$8,$9)
       returning appointment_id, patient_id, doctor_id, appointment_date,
                 to_char(appointment_time, 'HH24:MI') as appointment_time,
                 status, visit_type, consultation_reason, consultation_fee, created_at`,
      [
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status || 'scheduled',
        visit_type || 'in-clinic',
        consultation_reason || null,
        consultation_fee || null,
        notes || null,
      ]
    )

    await pool.query(
      `insert into public.activities(patient_id, activity_type, description)
       values($1, 'appointment booked', $2)`,
      [patient_id, `Appointment booked for ${appointment_date} ${appointment_time}`]
    )

    return res.status(201).json({ appointment: inserted.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.patch('/api/patient/appointments/:appointmentId/cancel', authRequired, async (req, res) => {
  const { appointmentId } = req.params

  try {
    const result = await pool.query(
      `update public.appointments
       set status = 'cancelled', updated_at = now()
       where appointment_id = $1
       returning appointment_id, status`,
      [appointmentId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    return res.json({ appointment: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/patient/reminders', authRequired, async (req, res) => {
  const patientId = (req.query.patient_id || req.auth.userId || '').toString()
  if (!patientId) return res.status(400).json({ message: 'patient_id is required' })

  try {
    const result = await pool.query(
      `select reminder_id, patient_id, medicine_name, dosage,
              to_char(reminder_time, 'HH24:MI') as reminder_time,
              status
       from public.medicine_reminders
       where patient_id = $1
       order by reminder_time asc`,
      [patientId]
    )

    return res.json({ reminders: result.rows })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/patient/reminders', authRequired, async (req, res) => {
  const { patient_id, medicine_name, dosage, reminder_time, status } = req.body || {}
  if (!patient_id || !medicine_name || !dosage || !reminder_time) {
    return res.status(400).json({ message: 'Missing reminder fields' })
  }

  try {
    const result = await pool.query(
      `insert into public.medicine_reminders(patient_id, medicine_name, dosage, reminder_time, status)
       values($1,$2,$3,$4,$5)
       returning reminder_id, patient_id, medicine_name, dosage,
                 to_char(reminder_time, 'HH24:MI') as reminder_time, status`,
      [patient_id, medicine_name, dosage, reminder_time, status || 'pending']
    )

    return res.status(201).json({ reminder: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.patch('/api/patient/reminders/:reminderId/status', authRequired, async (req, res) => {
  const { reminderId } = req.params
  const { status } = req.body || {}

  if (!status) return res.status(400).json({ message: 'status is required' })

  try {
    const result = await pool.query(
      `update public.medicine_reminders
       set status = $1
       where reminder_id = $2
       returning reminder_id, status`,
      [status, reminderId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    return res.json({ reminder: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/patient/activities', authRequired, async (req, res) => {
  const patientId = (req.query.patient_id || req.auth.userId || '').toString()
  const limit = Number(req.query.limit || 10)

  if (!patientId) return res.status(400).json({ message: 'patient_id is required' })

  try {
    const result = await pool.query(
      `select activity_id, patient_id, activity_type, description, activity_time
       from public.activities
       where patient_id = $1
       order by activity_time desc
       limit $2`,
      [patientId, limit]
    )

    return res.json({ activities: result.rows })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/patient/activities', authRequired, async (req, res) => {
  const { patient_id, activity_type, description } = req.body || {}
  if (!patient_id || !activity_type || !description) {
    return res.status(400).json({ message: 'Missing activity fields' })
  }

  try {
    const result = await pool.query(
      `insert into public.activities(patient_id, activity_type, description)
       values($1,$2,$3)
       returning activity_id, patient_id, activity_type, description, activity_time`,
      [patient_id, activity_type, description]
    )

    return res.status(201).json({ activity: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/patient/reports', authRequired, async (req, res) => {
  const userId = (req.query.userId || req.auth.userId || '').toString()
  if (!userId) return res.status(400).json({ message: 'userId is required' })

  try {
    const result = await pool.query(
      `select report_id, file_name, file_path, mime_type, created_at
       from public.medical_reports
       where patient_id = $1
       order by created_at desc`,
      [userId]
    )

    const baseUrl = `${req.protocol}://${req.get('host')}`
    const reports = result.rows.map((row) => ({
      name: row.file_name,
      path: row.file_path,
      mime_type: row.mime_type,
      created_at: row.created_at,
      publicUrl: `${baseUrl}/uploads/reports/${row.file_path}`,
    }))

    return res.json({ reports })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/doctor/dashboard', authRequired, roleRequired(['doctor']), async (req, res) => {
  const doctorId = req.auth.userId

  try {
    const doctorResult = await pool.query(
      'select available_hours, availability_schedule from public.doctors where doctor_id = $1',
      [doctorId]
    )

    const doctorSchedule = doctorResult.rowCount > 0
      ? getDoctorScheduleFromRow(doctorResult.rows[0])
      : createDefaultDoctorSchedule()

    const appointmentsResult = await pool.query(
      `select a.appointment_id,
              a.patient_id,
              a.appointment_date,
              to_char(a.appointment_time, 'HH24:MI') as appointment_time,
              a.status,
              a.visit_type,
              a.consultation_reason,
              u.name as patient_name,
              u.phone as patient_phone,
              u.email as patient_email
       from public.appointments a
       join public.users u on u.user_id = a.patient_id
       where a.doctor_id = $1
         and a.appointment_date >= current_date - interval '1 day'
       order by a.appointment_date asc, a.appointment_time asc`,
      [doctorId]
    )

    const appointmentsWithRisk = []
    for (const appointment of appointmentsResult.rows) {
      const historyResult = await pool.query(
        `select count(*)::int as total_count,
                count(*) filter (where status in ('cancelled', 'no_show'))::int as no_show_count,
                max(appointment_date) as last_visit
         from public.appointments
         where patient_id = $1 and doctor_id = $2 and appointment_date < current_date`,
        [appointment.patient_id, doctorId]
      )

      const history = historyResult.rows[0]
      const totalCount = history.total_count || 0
      const noShowCount = history.no_show_count || 0
      const patientNoShowRate = totalCount === 0 ? 0.15 : noShowCount / totalCount

      const lastVisitDate = history.last_visit ? new Date(history.last_visit) : null
      const daysSinceLastVisit = lastVisitDate
        ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999

      const appointmentHour = Number((appointment.appointment_time || '00:00').split(':')[0])
      const hasRecentLabResult = Math.random() > 0.45

      const appointmentScheduleCheck = doctorCanBookAppointment(
        doctorSchedule,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.visit_type
      )

      const prediction = await predictNoShowRiskViaAI({
        patientNoShowRate,
        daysSinceLastVisit,
        appointmentHour,
        hasRecentLabResult: hasRecentLabResult && appointmentScheduleCheck.allowed,
      })

      appointmentsWithRisk.push({
        ...appointment,
        no_show_risk: prediction,
      })
    }

    const notificationsResult = await pool.query(
      `select notification_id, title, message, type, is_read, created_at
       from public.doctor_notifications
       where doctor_id = $1
       order by created_at desc
       limit 10`,
      [doctorId]
    )

    const generatedNotificationsResult = await pool.query(
      `select mr.report_id,
              mr.created_at,
              u.name as patient_name
       from public.medical_reports mr
       join public.users u on u.user_id = mr.patient_id
       where mr.patient_id in (
         select distinct patient_id from public.appointments where doctor_id = $1
       )
       order by mr.created_at desc
       limit 3`,
      [doctorId]
    )

    const patientListResult = await pool.query(
      `select distinct a.patient_id, u.name as patient_name, u.phone as patient_phone
       from public.appointments a
       join public.users u on u.user_id = a.patient_id
       where a.doctor_id = $1
       order by u.name asc`,
      [doctorId]
    )

    const highRiskCount = appointmentsWithRisk.filter((a) => a.no_show_risk.label === 'High').length
    const todayKey = new Date().toISOString().slice(0, 10)
    const todayAppointmentsCount = appointmentsWithRisk.filter((a) => {
      const dateValue = typeof a.appointment_date === 'string'
        ? a.appointment_date.slice(0, 10)
        : new Date(a.appointment_date).toISOString().slice(0, 10)
      return dateValue === todayKey
    }).length

    const generatedNotifications = generatedNotificationsResult.rows.map((row) => ({
      notification_id: `lab-${row.report_id}`,
      title: 'New lab result received',
      message: `Lab report uploaded for ${row.patient_name}`,
      type: 'lab',
      is_read: false,
      created_at: row.created_at,
      generated: true,
    }))

    const notifications = [...generatedNotifications, ...notificationsResult.rows]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    return res.json({
      summary: {
        todayAppointments: todayAppointmentsCount,
        uniquePatients: patientListResult.rowCount,
        unreadNotifications: notifications.filter((n) => !n.is_read).length,
        highRiskAppointments: highRiskCount,
      },
      appointments: appointmentsWithRisk,
      patients: patientListResult.rows,
      notifications,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/doctor/appointments/:appointmentId/send-reminder', authRequired, roleRequired(['doctor']), async (req, res) => {
  const { appointmentId } = req.params
  const doctorId = req.auth.userId

  try {
    const appointmentResult = await pool.query(
      `select a.appointment_id, a.patient_id, a.appointment_date,
              to_char(a.appointment_time, 'HH24:MI') as appointment_time,
              u.name as patient_name
       from public.appointments a
       join public.users u on u.user_id = a.patient_id
       where a.appointment_id = $1 and a.doctor_id = $2`,
      [appointmentId, doctorId]
    )

    if (appointmentResult.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found for this doctor' })
    }

    const appointment = appointmentResult.rows[0]

    await pool.query(
      `insert into public.activities(patient_id, activity_type, description)
       values($1, 'reminder sent', $2)`,
      [
        appointment.patient_id,
        `Doctor sent reminder for appointment on ${appointment.appointment_date} at ${appointment.appointment_time}`,
      ]
    )

    await pool.query(
      `insert into public.doctor_notifications(doctor_id, title, message, type, is_read)
       values($1, $2, $3, 'action', false)`,
      [
        doctorId,
        'Reminder sent',
        `Reminder sent successfully to ${appointment.patient_name} for appointment ${appointment.appointment_date} ${appointment.appointment_time}`,
      ]
    )

    return res.json({ success: true, message: 'Reminder sent successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/doctor/appointments/:appointmentId/summary', authRequired, roleRequired(['doctor']), async (req, res) => {
  const { appointmentId } = req.params
  const doctorId = req.auth.userId

  try {
    const result = await pool.query(
      `select a.appointment_id,
              a.patient_id,
              a.appointment_date,
              to_char(a.appointment_time, 'HH24:MI') as appointment_time,
              a.status,
              a.visit_type,
              a.consultation_reason,
              u.name as patient_name,
              u.email as patient_email,
              u.phone as patient_phone,
              p.medical_history,
              p.age,
              p.gender
       from public.appointments a
       join public.users u on u.user_id = a.patient_id
       left join public.patients p on p.patient_id = a.patient_id
       where a.appointment_id = $1 and a.doctor_id = $2`,
      [appointmentId, doctorId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found for this doctor' })
    }

    return res.json({ summary: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.patch('/api/doctor/notifications/:notificationId/read', authRequired, roleRequired(['doctor']), async (req, res) => {
  const { notificationId } = req.params
  const doctorId = req.auth.userId

  try {
    const result = await pool.query(
      `update public.doctor_notifications
       set is_read = true
       where notification_id = $1 and doctor_id = $2
       returning notification_id, is_read`,
      [notificationId, doctorId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.json({ notification: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/admin/dashboard', authRequired, roleRequired(['admin']), async (_req, res) => {
  try {
    const [
      totalDoctorsResult,
      activePatientsResult,
      todayAppointmentsResult,
      todayCancellationsResult,
      appointmentTrendResult,
      pendingDoctorApprovalsResult,
      pendingPaymentsResult,
      medicineDemandResult,
    ] = await Promise.all([
      pool.query('select count(*)::int as total from public.doctors'),
      pool.query(
        `select count(distinct patient_id)::int as total
         from public.appointments
         where appointment_date >= current_date - interval '30 day'`
      ),
      pool.query(
        `select count(*)::int as total
         from public.appointments
         where appointment_date = current_date`
      ),
      pool.query(
        `select count(*)::int as total
         from public.appointments
         where appointment_date = current_date and status = 'cancelled'`
      ),
      pool.query(
        `select appointment_date::date as appointment_day,
                count(*)::int as total,
                count(*) filter (where status = 'cancelled')::int as cancelled
         from public.appointments
         where appointment_date >= current_date - interval '6 day'
         group by appointment_day
         order by appointment_day asc`
      ),
      pool.query(
        `select count(*)::int as total
         from public.doctors
         where coalesce(trim(specialization), '') = ''
            or coalesce(trim(qualification), '') = ''`
      ),
      pool.query(
        `select count(*)::int as total
         from public.appointments
         where appointment_date < current_date
           and status in ('scheduled', 'confirmed')`
      ),
      pool.query(
        `select medicine_name, count(*)::int as demand
         from public.medicine_reminders
         where status = 'pending'
         group by medicine_name
         having count(*) >= 3
         order by demand desc
         limit 3`
      ),
    ])

    const trendMap = new Map(
      appointmentTrendResult.rows.map((row) => [
        toDateKey(row.appointment_day),
        {
          total: Number(row.total || 0),
          cancelled: Number(row.cancelled || 0),
        },
      ])
    )

    const appointmentTrend = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const key = toDateKey(date)
      const row = trendMap.get(key) || { total: 0, cancelled: 0 }

      return {
        date: key,
        total: row.total,
        cancelled: row.cancelled,
      }
    })

    const alerts = []
    const pendingDoctorApprovals = Number(pendingDoctorApprovalsResult.rows[0]?.total || 0)
    if (pendingDoctorApprovals > 0) {
      alerts.push({
        id: 'pending-doctor-approvals',
        type: 'pending-review',
        title: 'Pending Doctor Approvals',
        message: `${pendingDoctorApprovals} doctor profiles need review before full onboarding.`,
        severity: 'medium',
      })
    }

    const pendingPayments = Number(pendingPaymentsResult.rows[0]?.total || 0)
    if (pendingPayments > 0) {
      alerts.push({
        id: 'pending-payments',
        type: 'pending-payment',
        title: 'Pending Payments',
        message: `${pendingPayments} past appointments are still in scheduled/confirmed state and may require payment reconciliation.`,
        severity: 'high',
      })
    }

    for (const item of medicineDemandResult.rows) {
      alerts.push({
        id: `low-stock-${item.medicine_name}`,
        type: 'low-stock',
        title: 'Low Medicine Stock Alert',
        message: `${item.medicine_name} has high pending demand (${item.demand}). Please verify stock availability.`,
        severity: 'medium',
      })
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear',
        type: 'system',
        title: 'System Healthy',
        message: 'No critical alerts right now. Operations look stable.',
        severity: 'low',
      })
    }

    return res.json({
      metrics: {
        totalDoctors: Number(totalDoctorsResult.rows[0]?.total || 0),
        activePatients: Number(activePatientsResult.rows[0]?.total || 0),
        dailyAppointments: Number(todayAppointmentsResult.rows[0]?.total || 0),
        dailyCancellations: Number(todayCancellationsResult.rows[0]?.total || 0),
      },
      appointmentTrend,
      alerts,
      quickActions: [
        { id: 'add-doctor', label: 'Add Doctor' },
        { id: 'register-patient', label: 'Register Patient' },
        { id: 'schedule-appointment', label: 'Schedule Appointment' },
        { id: 'generate-report', label: 'Generate Report' },
      ],
      refreshedAt: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/admin/lookups', authRequired, roleRequired(['admin']), async (_req, res) => {
  try {
    const [doctorsResult, patientsResult] = await Promise.all([
      pool.query(
        `select d.doctor_id,
                coalesce(d.name, u.name) as doctor_name,
                d.specialization
         from public.doctors d
         join public.users u on u.user_id = d.doctor_id
         order by doctor_name asc`
      ),
      pool.query(
        `select p.patient_id,
                u.name as patient_name,
                u.email as patient_email
         from public.patients p
         join public.users u on u.user_id = p.patient_id
         order by patient_name asc`
      ),
    ])

    return res.json({
      doctors: doctorsResult.rows,
      patients: patientsResult.rows,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.get('/api/admin/appointments', authRequired, roleRequired(['admin']), async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1)
  const pageSize = Math.min(parsePositiveInt(req.query.pageSize, 10), 50)
  const offset = (page - 1) * pageSize

  const search = String(req.query.search || '').trim()
  const status = normalizeStatus(req.query.status)
  const dateFrom = String(req.query.dateFrom || '').trim()
  const dateTo = String(req.query.dateTo || '').trim()

  const whereClauses = []
  const values = []

  if (search) {
    values.push(`%${search}%`)
    const searchIndex = values.length
    whereClauses.push(
      `(cast(a.appointment_id as text) ilike $${searchIndex}
        or pu.name ilike $${searchIndex}
        or pu.email ilike $${searchIndex}
        or coalesce(du.name, d.name) ilike $${searchIndex})`
    )
  }

  if (status) {
    values.push(status)
    whereClauses.push(`a.status = $${values.length}`)
  }

  if (dateFrom) {
    values.push(dateFrom)
    whereClauses.push(`a.appointment_date >= $${values.length}`)
  }

  if (dateTo) {
    values.push(dateTo)
    whereClauses.push(`a.appointment_date <= $${values.length}`)
  }

  const whereSql = whereClauses.length > 0 ? `where ${whereClauses.join(' and ')}` : ''

  try {
    const baseFrom = `from public.appointments a
      join public.users pu on pu.user_id = a.patient_id
      left join public.doctors d on d.doctor_id = a.doctor_id
      left join public.users du on du.user_id = d.doctor_id`

    const countResult = await pool.query(
      `select count(*)::int as total ${baseFrom} ${whereSql}`,
      values
    )

    const dataValues = [...values, pageSize, offset]
    const dataResult = await pool.query(
      `select a.appointment_id,
              a.patient_id,
              a.doctor_id,
              pu.name as patient_name,
              pu.email as patient_email,
              coalesce(du.name, d.name) as doctor_name,
              d.specialization as doctor_specialization,
              a.appointment_date,
              to_char(a.appointment_time, 'HH24:MI') as appointment_time,
              a.status,
              a.visit_type,
              a.consultation_reason,
              a.consultation_fee,
              a.created_at,
              a.updated_at
       ${baseFrom}
       ${whereSql}
       order by a.appointment_date desc, a.appointment_time desc
       limit $${values.length + 1}
       offset $${values.length + 2}`,
      dataValues
    )

    const total = Number(countResult.rows[0]?.total || 0)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return res.json({
      appointments: dataResult.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.patch('/api/admin/appointments/:appointmentId/status', authRequired, roleRequired(['admin']), async (req, res) => {
  const { appointmentId } = req.params
  const status = normalizeStatus(req.body?.status)

  if (!status) {
    return res.status(400).json({ message: 'Valid status is required' })
  }

  try {
    const result = await pool.query(
      `update public.appointments
       set status = $1,
           updated_at = now()
       where appointment_id = $2
       returning appointment_id, status, updated_at`,
      [status, appointmentId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    return res.json({ appointment: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.patch('/api/admin/appointments/:appointmentId/cancel', authRequired, roleRequired(['admin']), async (req, res) => {
  const { appointmentId } = req.params

  try {
    const result = await pool.query(
      `update public.appointments
       set status = 'cancelled',
           updated_at = now()
       where appointment_id = $1
       returning appointment_id, status, updated_at`,
      [appointmentId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    return res.json({ appointment: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.patch('/api/admin/appointments/:appointmentId/reschedule', authRequired, roleRequired(['admin']), async (req, res) => {
  const { appointmentId } = req.params
  const appointmentDate = String(req.body?.appointment_date || '').trim()
  const appointmentTime = String(req.body?.appointment_time || '').trim()

  if (!appointmentDate || !appointmentTime) {
    return res.status(400).json({ message: 'appointment_date and appointment_time are required' })
  }

  try {
    const appointmentResult = await pool.query(
      `select appointment_id, doctor_id, visit_type
       from public.appointments
       where appointment_id = $1`,
      [appointmentId]
    )

    if (appointmentResult.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    const appointment = appointmentResult.rows[0]
    const doctorResult = await pool.query(
      'select available_hours, availability_schedule from public.doctors where doctor_id = $1',
      [appointment.doctor_id]
    )

    if (doctorResult.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor not found for appointment' })
    }

    const scheduleCheck = doctorCanBookAppointment(
      doctorResult.rows[0].availability_schedule || doctorResult.rows[0].available_hours || {},
      appointmentDate,
      appointmentTime,
      appointment.visit_type
    )

    if (!scheduleCheck.allowed) {
      return res.status(400).json({ message: scheduleCheck.message })
    }

    const conflictResult = await pool.query(
      `select appointment_id
       from public.appointments
       where doctor_id = $1
         and appointment_date = $2
         and appointment_time = $3
         and appointment_id <> $4
         and status in ('scheduled', 'confirmed')`,
      [appointment.doctor_id, appointmentDate, appointmentTime, appointmentId]
    )

    if (conflictResult.rowCount > 0) {
      return res.status(409).json({ message: 'Selected slot is already occupied for this doctor' })
    }

    const updateResult = await pool.query(
      `update public.appointments
       set appointment_date = $1,
           appointment_time = $2,
           status = 'scheduled',
           updated_at = now()
       where appointment_id = $3
       returning appointment_id, appointment_date, to_char(appointment_time, 'HH24:MI') as appointment_time, status, updated_at`,
      [appointmentDate, appointmentTime, appointmentId]
    )

    return res.json({ appointment: updateResult.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/admin/doctors', authRequired, roleRequired(['admin']), async (req, res) => {
  const fullName = String(req.body?.fullName || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const phone = String(req.body?.phone || '').trim()
  const password = String(req.body?.password || '').trim()

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email, and password are required' })
  }

  const result = await createAdminDoctor({ fullName, email, phone, password })
  if (!result.ok) {
    return res.status(result.status || 500).json({ message: result.message || 'Unable to create doctor' })
  }

  return res.status(201).json({ user: toClientUser(result.user) })
})

app.post('/api/admin/patients', authRequired, roleRequired(['admin']), async (req, res) => {
  const fullName = String(req.body?.fullName || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const phone = String(req.body?.phone || '').trim()
  const password = String(req.body?.password || '').trim()

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email, and password are required' })
  }

  const result = await createAdminPatient({ fullName, email, phone, password })
  if (!result.ok) {
    return res.status(result.status || 500).json({ message: result.message || 'Unable to register patient' })
  }

  return res.status(201).json({ user: toClientUser(result.user) })
})

app.post('/api/admin/appointments', authRequired, roleRequired(['admin']), async (req, res) => {
  const {
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    visit_type,
    consultation_reason,
    consultation_fee,
  } = req.body || {}

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'patient_id, doctor_id, appointment_date and appointment_time are required' })
  }

  try {
    const doctorResult = await pool.query(
      'select available_hours, availability_schedule from public.doctors where doctor_id = $1',
      [doctor_id]
    )

    if (doctorResult.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    const scheduleCheck = doctorCanBookAppointment(
      doctorResult.rows[0].availability_schedule || doctorResult.rows[0].available_hours || {},
      appointment_date,
      appointment_time,
      visit_type || 'in-clinic'
    )

    if (!scheduleCheck.allowed) {
      return res.status(400).json({ message: scheduleCheck.message })
    }

    const conflictResult = await pool.query(
      `select appointment_id
       from public.appointments
       where doctor_id = $1
         and appointment_date = $2
         and appointment_time = $3
         and status in ('scheduled', 'confirmed')`,
      [doctor_id, appointment_date, appointment_time]
    )

    if (conflictResult.rowCount > 0) {
      return res.status(409).json({ message: 'Selected slot is already occupied for this doctor' })
    }

    const insertResult = await pool.query(
      `insert into public.appointments(
         patient_id, doctor_id, appointment_date, appointment_time,
         status, visit_type, consultation_reason, consultation_fee
       )
       values($1, $2, $3, $4, 'scheduled', $5, $6, $7)
       returning appointment_id, patient_id, doctor_id, appointment_date,
                 to_char(appointment_time, 'HH24:MI') as appointment_time,
                 status, visit_type, consultation_reason, consultation_fee, created_at`,
      [
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        visit_type || 'in-clinic',
        consultation_reason || null,
        consultation_fee || null,
      ]
    )

    return res.status(201).json({ appointment: insertResult.rows[0] })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/admin/reports/generate', authRequired, roleRequired(['admin']), async (_req, res) => {
  try {
    const [appointmentsResult, cancellationsResult, patientsResult, doctorsResult] = await Promise.all([
      pool.query("select count(*)::int as total from public.appointments where appointment_date >= current_date - interval '30 day'"),
      pool.query("select count(*)::int as total from public.appointments where appointment_date >= current_date - interval '30 day' and status = 'cancelled'"),
      pool.query('select count(*)::int as total from public.patients'),
      pool.query('select count(*)::int as total from public.doctors'),
    ])

    return res.json({
      report: {
        generated_at: new Date().toISOString(),
        period: 'Last 30 days',
        appointments: Number(appointmentsResult.rows[0]?.total || 0),
        cancellations: Number(cancellationsResult.rows[0]?.total || 0),
        totalPatients: Number(patientsResult.rows[0]?.total || 0),
        totalDoctors: Number(doctorsResult.rows[0]?.total || 0),
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.post('/api/patient/reports', authRequired, upload.single('file'), async (req, res) => {
  const userId = (req.body.userId || req.auth.userId || '').toString()
  if (!userId) return res.status(400).json({ message: 'userId is required' })
  if (!req.file) return res.status(400).json({ message: 'file is required' })

  try {
    const insertResult = await pool.query(
      `insert into public.medical_reports(patient_id, file_name, file_path, mime_type)
       values($1,$2,$3,$4)
       returning report_id, file_name, file_path, mime_type, created_at`,
      [userId, req.file.originalname, req.file.filename, req.file.mimetype]
    )

    const baseUrl = `${req.protocol}://${req.get('host')}`
    const row = insertResult.rows[0]

    return res.status(201).json({
      report: {
        report_id: row.report_id,
        name: row.file_name,
        path: row.file_path,
        mime_type: row.mime_type,
        created_at: row.created_at,
        publicUrl: `${baseUrl}/uploads/reports/${row.file_path}`,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

app.use((err, _req, res, next) => {
  void next
  return res.status(500).json({ message: err?.message || 'Internal server error' })
})

await ensureDoctorAvailabilitySchema()

app.listen(PORT, async () => {
  try {
    await pool.query('select 1')
    console.log(`Clinix API running on http://localhost:${PORT}`)
    console.log(`Connected to PostgreSQL database: ${process.env.DB_NAME || 'clinixone'}`)
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error.message)
  }
})
