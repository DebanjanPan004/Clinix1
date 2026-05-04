import { apiRequest } from './apiClient'

export async function getRecentActivities(userId, limit = 10) {
  const data = await apiRequest(
    `/api/patient/activities?patient_id=${encodeURIComponent(userId)}&limit=${encodeURIComponent(limit)}`,
    { auth: true }
  )
  return data.activities || data || []
}

export async function createActivity(payload) {
  const data = await apiRequest('/api/patient/activities', {
    method: 'POST',
    auth: true,
    body: payload,
  })

  return data.activity || data
}
