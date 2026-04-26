const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function sanitizeName(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase()
}

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (auth) {
    const token = localStorage.getItem('clinix_session_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const isFormData = body instanceof FormData
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  return payload
}

export async function uploadReport(file, userId) {
  if (!file) throw new Error('Please select a file to upload')

  const formData = new FormData()
  formData.append('file', file, `${Date.now()}-${sanitizeName(file.name)}`)
  formData.append('userId', userId)

  const data = await apiRequest('/api/patient/reports', {
    method: 'POST',
    auth: true,
    body: formData,
  })

  return data.report || data
}

export async function listReports(userId) {
  if (!userId) return []

  const data = await apiRequest(`/api/patient/reports?userId=${encodeURIComponent(userId)}`, {
    auth: true,
  })
  return data.reports || data || []
}
