import { useCallback, useEffect, useState } from 'react'
import {
  cancelAppointment,
  createAppointment,
  getUpcomingAppointments,
} from '../services/appointmentService'

export default function useAppointments(userId) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAppointments = useCallback(async () => {
    if (!userId) {
      setAppointments([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getUpcomingAppointments(userId)
      setAppointments(data)
    } catch (err) {
      setError(err.message || 'Unable to load appointments')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const addAppointment = useCallback(async (payload) => {
    const created = await createAppointment(payload)
    setAppointments((prev) => [created, ...prev])
    return created
  }, [])

  const removeAppointment = useCallback(async (appointmentId) => {
    await cancelAppointment(appointmentId)
    setAppointments((prev) =>
      prev.map((item) =>
        item.appointment_id === appointmentId ? { ...item, status: 'cancelled' } : item,
      ),
    )
  }, [])

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    removeAppointment,
  }
}
