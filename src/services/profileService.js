import { apiRequest } from './apiClient'

export async function getPatientProfile() {
  const data = await apiRequest('/api/patient/profile')
  return data.profile || data
}

export async function updatePatientProfile({ fullName, phone }) {
  const data = await apiRequest('/api/patient/profile', {
    method: 'PATCH',
    body: {
      full_name: fullName,
      phone,
    },
  })

  return data.profile || data
}
