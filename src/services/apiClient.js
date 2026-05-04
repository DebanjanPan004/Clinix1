import { clearClinixSession } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (auth) {
    const token = localStorage.getItem('clinix_session_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const isFormData = body instanceof FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`)
    error.status = response.status

    if (response.status === 401 && auth) {
      error.code = 'AUTH_SESSION_EXPIRED'
      error.message = 'Session expired. Please log in again.'
      clearClinixSession()

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    throw error
  }

  return payload
}
