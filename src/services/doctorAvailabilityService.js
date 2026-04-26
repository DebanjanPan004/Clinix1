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

export async function getDoctorAvailability() {
  return apiRequest('/api/doctor/availability')
}

export async function saveDoctorAvailability(schedule) {
  return apiRequest('/api/doctor/availability', {
    method: 'PUT',
    body: { schedule },
  })
}
