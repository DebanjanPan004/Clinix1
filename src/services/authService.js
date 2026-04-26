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

function parseRetryAfterSeconds(message) {
  const matchedSeconds = message.match(/(\d+)\s*seconds?/i)
  if (matchedSeconds?.[1]) return Number(matchedSeconds[1])

  const matchedMinutes = message.match(/(\d+)\s*minutes?/i)
  if (matchedMinutes?.[1]) return Number(matchedMinutes[1]) * 60

  return null
}

function formatAuthError(error, fallbackMessage) {
  const message = error?.message || ''
  const status = error?.status || error?.code

  if (status === 429 || /rate limit|too many requests|email rate limit exceeded/i.test(message)) {
    const retryAfterSeconds = parseRetryAfterSeconds(message) || 180
    const rateLimitError = new Error(`Too many signup attempts. Please wait ${retryAfterSeconds} seconds and try again.`)
    rateLimitError.code = 'RATE_LIMITED'
    rateLimitError.retryAfterSeconds = retryAfterSeconds
    return rateLimitError
  }

  return new Error(message || fallbackMessage)
}

export async function registerUser({ fullName, email, phone, password, role }) {
  try {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { fullName, email, phone, password, role },
    })

    return {
      user: data.user,
      demo: false,
    }
  } catch (error) {
    throw formatAuthError(error, 'Unable to create account')
  }
}

export async function loginUser({ email, password, role }) {
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password, role },
    })

    const sessionToken = data.token || data.sessionToken
    if (!sessionToken) {
      throw new Error('Login succeeded but token was missing')
    }

    localStorage.setItem('clinix_session_token', sessionToken)
    return { user: data.user, sessionToken, demo: false }
  } catch (error) {
    throw formatAuthError(error, 'Unable to login')
  }
}

export async function logout() {
  const token = localStorage.getItem('clinix_session_token')
  if (token) {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', auth: true })
    } catch {
      // Logout should still clear local session even if API call fails.
    }
  }

  localStorage.removeItem('clinix_session_token')
  localStorage.removeItem('clinix_pending_email')
  localStorage.removeItem('clinix_pending_role')
  localStorage.removeItem('clinix_remember_me')
  localStorage.removeItem('clinix_patient_id')
  localStorage.removeItem('clinix_user_name')
  localStorage.removeItem('clinix_user_role')
}
