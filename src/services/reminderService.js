import { apiRequest } from './apiClient'

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
