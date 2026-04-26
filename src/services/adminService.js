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

export function getAdminDashboardData() {
  return apiRequest('/api/admin/dashboard')
}

export function getAdminLookups() {
  return apiRequest('/api/admin/lookups')
}

export function createDoctorByAdmin(payload) {
  return apiRequest('/api/admin/doctors', {
    method: 'POST',
    body: payload,
  })
}

export function createPatientByAdmin(payload) {
  return apiRequest('/api/admin/patients', {
    method: 'POST',
    body: payload,
  })
}

export function createAppointmentByAdmin(payload) {
  return apiRequest('/api/admin/appointments', {
    method: 'POST',
    body: payload,
  })
}

export function generateAdminReport() {
  return apiRequest('/api/admin/reports/generate', {
    method: 'POST',
  })
}

export function getAdminAppointments({ page = 1, pageSize = 10, search = '', status = '', dateFrom = '', dateTo = '' } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) query.set('search', search.trim())
  if (status.trim()) query.set('status', status.trim())
  if (dateFrom.trim()) query.set('dateFrom', dateFrom.trim())
  if (dateTo.trim()) query.set('dateTo', dateTo.trim())

  return apiRequest(`/api/admin/appointments?${query.toString()}`)
}

export function updateAdminAppointmentStatus(appointmentId, status) {
  return apiRequest(`/api/admin/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function cancelAdminAppointment(appointmentId) {
  return apiRequest(`/api/admin/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
  })
}

export function rescheduleAdminAppointment(appointmentId, appointmentDate, appointmentTime) {
  return apiRequest(`/api/admin/appointments/${appointmentId}/reschedule`, {
    method: 'PATCH',
    body: {
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    },
  })
}
