import {
  normalizeDoctorSchedule,
} from '../utils/doctorSchedule'

import { apiRequest } from './apiClient'

export async function searchDoctors(query) {
  const data = await apiRequest(`/api/doctors?search=${encodeURIComponent(query || '')}`, { auth: true })
  return data.doctors || data || []
}

export async function getAvailableDoctors() {
  const data = await apiRequest('/api/doctors', { auth: true })
  return data.doctors || data || []
}

export async function getDoctorTimeSlots(doctorId, selectedDate) {
  const data = await apiRequest(
    `/api/doctors/${doctorId}/slots?date=${encodeURIComponent(selectedDate)}`,
    { auth: true }
  )
  return data.slots || []
}

export async function checkSlotAvailability(doctorId, appointmentDate, appointmentTime, visitType) {
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
}

export async function getUpcomingAppointments(userId) {
  const data = await apiRequest(`/api/patient/appointments?patient_id=${encodeURIComponent(userId)}`, { auth: true })
  return data.appointments || data || []
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
