import {
  createDefaultDoctorSchedule,
  generateSlotsFromSchedule,
  normalizeDoctorSchedule,
} from '../utils/doctorSchedule'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const demoAppointments = [
  {
    appointment_id: 'APT-1001',
    patient_id: 'demo-user-id',
    doctor_name: 'Ananya Rao',
    appointment_date: '2026-03-15',
    appointment_time: '10:30',
    status: 'scheduled',
    visit_type: 'in-clinic',
    consultation_reason: 'Regular checkup',
  },
]

const demoDoctors = [
  {
    doctor_id: '5f98620a-0638-4f20-a89b-cf8e03f4c5c7',
    name: 'Dr. Ananya Rao',
    specialization: 'Cardiology',
    experience: 12,
    rating: 4.8,
    consultation_fee: 500,
    hospital: 'Apollo Hospital',
    qualification: 'MD, DM (Cardiology)',
    available_hours: createDefaultDoctorSchedule(),
    consultation_modes: ['online', 'in-clinic'],
  },
]

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = localStorage.getItem('clinix_session_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  return payload
}

export async function searchDoctors(query) {
  try {
    const data = await apiRequest(`/api/doctors?search=${encodeURIComponent(query || '')}`, { auth: true })
    return data.doctors || data || []
  } catch {
    return demoDoctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes((query || '').toLowerCase()) ||
        doc.specialization.toLowerCase().includes((query || '').toLowerCase()) ||
        doc.hospital.toLowerCase().includes((query || '').toLowerCase())
    )
  }
}

export async function getAvailableDoctors() {
  try {
    const data = await apiRequest('/api/doctors', { auth: true })
    return data.doctors || data || []
  } catch {
    return demoDoctors
  }
}

export async function getDoctorTimeSlots(doctorId, selectedDate) {
  try {
    const data = await apiRequest(
      `/api/doctors/${doctorId}/slots?date=${encodeURIComponent(selectedDate)}`,
      { auth: true }
    )
    return data.slots || []
  } catch {
    const doctor = demoDoctors.find((d) => d.doctor_id === doctorId)
    if (!doctor || !doctor.available_hours) return []

    return generateSlotsFromSchedule(doctor.available_hours, selectedDate)
  }
}

export async function checkSlotAvailability(doctorId, appointmentDate, appointmentTime, visitType) {
  try {
    const data = await apiRequest('/api/appointments/check-slot', {
      method: 'POST',
      auth: true,
      body: {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        visit_type: visitType,
      },
    })
    return Boolean(data.available)
  } catch {
    return true
  }
}

export async function getUpcomingAppointments(userId) {
  try {
    const data = await apiRequest(`/api/patient/appointments?patient_id=${encodeURIComponent(userId)}`, { auth: true })
    return data.appointments || data || []
  } catch {
    return demoAppointments
  }
}

export async function createAppointment(payload) {
  const normalizedPayload = {
    ...payload,
    visit_type: payload.visit_type || 'in-clinic',
  }

  const data = await apiRequest('/api/patient/appointments', {
    method: 'POST',
    auth: true,
    body: normalizedPayload,
  })

  return data.appointment || data
}

export function getAllowedVisitTypes(doctor) {
  const schedule = normalizeDoctorSchedule(doctor?.availability_schedule || doctor?.available_hours)
  return schedule.consultation_modes.length > 0 ? schedule.consultation_modes : ['online', 'in-clinic']
}

export async function cancelAppointment(appointmentId) {
  const data = await apiRequest(`/api/patient/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    auth: true,
  })

  return data.appointment || data
}
