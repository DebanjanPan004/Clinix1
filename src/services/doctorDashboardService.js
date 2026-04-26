const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('clinix_session_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

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
