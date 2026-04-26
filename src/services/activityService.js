const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const demoActivities = [
  {
    activity_id: 'ACT-1001',
    patient_id: 'demo-user-id',
    activity_type: 'appointment booked',
    description: 'Cardiology follow-up booked with Dr. Ananya Rao.',
    activity_time: new Date().toISOString(),
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

export async function getRecentActivities(userId, limit = 10) {
  try {
    const data = await apiRequest(
      `/api/patient/activities?patient_id=${encodeURIComponent(userId)}&limit=${encodeURIComponent(limit)}`,
      { auth: true }
    )
    return data.activities || data || []
  } catch {
    return demoActivities
  }
}

export async function createActivity(payload) {
  const data = await apiRequest('/api/patient/activities', {
    method: 'POST',
    auth: true,
    body: payload,
  })

  return data.activity || data
}
