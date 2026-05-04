import { Bell } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getUpcomingAppointments } from '../../services/appointmentService'
import { getReminders } from '../../services/reminderService'

function formatAppointmentLabel(appointment) {
  const dateLabel = appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'Soon'
  return `${dateLabel} • ${appointment.appointment_time || ''}`.trim()
}

export default function PatientNotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [reminders, setReminders] = useState([])
  const [error, setError] = useState('')
  const wrapperRef = useRef(null)

  const patientId = localStorage.getItem('clinix_patient_id') || localStorage.getItem('clinix_user_id') || ''

  const loadNotifications = async () => {
    if (!patientId) return

    setLoading(true)
    setError('')

    try {
      const [appointmentData, reminderData] = await Promise.all([
        getUpcomingAppointments(patientId),
        getReminders(patientId),
      ])

      setAppointments(Array.isArray(appointmentData) ? appointmentData : [])
      setReminders(Array.isArray(reminderData) ? reminderData : [])
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load notifications')
      toast.error(fetchError.message || 'Unable to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined

    loadNotifications()

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const unreadCount = useMemo(() => {
    const upcomingAppointments = appointments.filter((item) => item.status !== 'cancelled').length
    const pendingReminders = reminders.filter((item) => item.status !== 'completed').length
    return upcomingAppointments + pendingReminders
  }, [appointments, reminders])

  return (
    <div ref={wrapperRef} className="relative z-[999]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-xl bg-rose-50 p-2 text-primary transition hover:bg-rose-100"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-deepPink" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[999] w-[22rem] rounded-2xl border-2 border-primary bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-textPrimary">Notifications</h3>
              <p className="text-xs text-textSecondary">Upcoming appointments and medicine reminders</p>
            </div>
            <button
              type="button"
              onClick={loadNotifications}
              className="text-xs font-semibold text-primary hover:text-deepPink"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          {!error && !loading && appointments.length === 0 && reminders.length === 0 && (
            <p className="text-sm text-textSecondary">No upcoming appointments or medicine reminders yet.</p>
          )}

          <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textSecondary">Upcoming Appointments</h4>
              <div className="space-y-2">
                {appointments.length === 0 ? (
                  <p className="text-sm text-textSecondary">No upcoming appointments.</p>
                ) : (
                  appointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.appointment_id} className="rounded-xl bg-rose-50 p-3">
                      <p className="text-sm font-semibold text-textPrimary">{appointment.doctor_name || 'Doctor'}</p>
                      <p className="text-xs text-textSecondary">{formatAppointmentLabel(appointment)}</p>
                      <p className="text-xs text-primary capitalize">{appointment.visit_type || 'in-clinic'} • {appointment.status}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textSecondary">Medicine Reminders</h4>
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-sm text-textSecondary">No medicine reminders.</p>
                ) : (
                  reminders.slice(0, 6).map((reminder) => (
                    <div key={reminder.reminder_id} className="rounded-xl bg-rose-50 p-3">
                      <p className="text-sm font-semibold text-textPrimary">{reminder.medicine_name}</p>
                      <p className="text-xs text-textSecondary">{reminder.dosage}</p>
                      <p className="text-xs text-textSecondary">
                        {reminder.quantity ? `Qty: ${reminder.quantity}` : ''}
                        {reminder.total_days ? `${reminder.quantity ? ' • ' : ''}${reminder.total_days} days` : ''}
                        {reminder.duration ? `${reminder.quantity || reminder.total_days ? ' • ' : ''}${reminder.duration}` : ''}
                      </p>
                      <p className="text-xs text-primary">{reminder.reminder_time} • {reminder.status}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}