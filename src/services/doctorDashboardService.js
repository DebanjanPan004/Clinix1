import { apiRequest } from './apiClient'

export async function getDoctorDashboardData() {
  return apiRequest('/api/doctor/dashboard')
}

export async function sendAppointmentReminder(appointmentId) {
  return apiRequest(`/api/doctor/appointments/${appointmentId}/send-reminder`, { method: 'POST' })
}

export async function getAppointmentSummary(appointmentId) {
  return apiRequest(`/api/doctor/appointments/${appointmentId}/summary`)
}

export async function markDoctorNotificationRead(notificationId) {
  return apiRequest(`/api/doctor/notifications/${notificationId}/read`, { method: 'PATCH' })
}

export async function createDoctorReminder(payload) {
  return apiRequest('/api/doctor/reminders', {
    method: 'POST',
    body: payload,
  })
}
