import { apiRequest } from './apiClient'

const MAX_REPORT_SIZE_BYTES = 2 * 1024 * 1024
const ALLOWED_REPORT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
]

function sanitizeName(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase()
}

export async function uploadReport(file, userId) {
  if (!file) throw new Error('Please select a file to upload')
  if (!userId) throw new Error('Missing patient account information. Please login again.')

  const mimeType = String(file.type || '').toLowerCase()
  if (!ALLOWED_REPORT_MIME_TYPES.includes(mimeType)) {
    throw new Error('Only PDF, JPG, and PNG files are allowed')
  }

  if (file.size > MAX_REPORT_SIZE_BYTES) {
    throw new Error('File size must be 2MB or less')
  }

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
