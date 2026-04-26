const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

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

export async function getReminders(userId) {
  const data = await apiRequest(`/api/patient/reminders?patient_id=${encodeURIComponent(userId)}`, { auth: true })
  return data.reminders || data || []
}

export async function createReminder(payload) {
  const data = await apiRequest('/api/patient/reminders', {
    method: 'POST',
    auth: true,
    body: payload,
  })

  return data.reminder || data
}

export async function toggleReminderStatus(reminderId, currentStatus) {
  const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed'

  const data = await apiRequest(`/api/patient/reminders/${reminderId}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status: nextStatus },
  })

  return data.reminder || { reminder_id: reminderId, status: nextStatus }
}
