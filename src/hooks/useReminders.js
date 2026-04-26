import { useCallback, useEffect, useState } from 'react'
import {
  createReminder,
  getReminders,
  toggleReminderStatus,
} from '../services/reminderService'

export default function useReminders(userId) {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReminders = useCallback(async () => {
    if (!userId) {
      setReminders([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getReminders(userId)
      setReminders(data)
    } catch (err) {
      setError(err.message || 'Unable to load reminders')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const addReminder = useCallback(async (payload) => {
    const created = await createReminder(payload)
    setReminders((prev) => [...prev, created])
    return created
  }, [])

  const toggleReminder = useCallback(async (reminder) => {
    const updated = await toggleReminderStatus(reminder.reminder_id, reminder.status)
    setReminders((prev) =>
      prev.map((item) =>
        item.reminder_id === reminder.reminder_id ? { ...item, status: updated.status } : item,
      ),
    )
  }, [])

  return {
    reminders,
    loading,
    error,
    fetchReminders,
    addReminder,
    toggleReminder,
  }
}
