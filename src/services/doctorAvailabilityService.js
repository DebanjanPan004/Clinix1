import { apiRequest } from './apiClient'

export async function getDoctorAvailability() {
  return apiRequest('/api/doctor/availability')
}

export async function saveDoctorAvailability(schedule) {
  return apiRequest('/api/doctor/availability', {
    method: 'PUT',
    body: { schedule },
  })
}
