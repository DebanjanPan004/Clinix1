import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Bell,
  CalendarCheck2,
  TriangleAlert,
  UsersRound,
  Send,
  FileSearch,
  LogOut,
  LayoutDashboard,
  CalendarCog,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import AvailabilityScheduleEditor from '../components/doctor/AvailabilityScheduleEditor'
import {
  getAppointmentSummary,
  getDoctorDashboardData,
  markDoctorNotificationRead,
  sendAppointmentReminder,
} from '../services/doctorDashboardService'

function getRiskStyles(label) {
  if (label === 'High') return 'bg-red-100 text-red-700'
  if (label === 'Medium') return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

function StatCard({ icon, label, value, hint }) {
  const IconComponent = icon
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-textSecondary">{label}</p>
        <IconComponent size={16} className="text-primary" />
      </div>
      <p className="font-display text-3xl text-textPrimary">{value}</p>
      <p className="text-xs text-textSecondary">{hint}</p>
    </Card>
  )
}

export default function DoctorDashboardPage() {
  const name = localStorage.getItem('clinix_user_name') || 'Doctor'

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [activeView, setActiveView] = useState('dashboard')

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications])

  const loadDashboard = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true)
    else setLoading(true)

    try {
      const data = await getDoctorDashboardData()
      setSummary(data.summary || null)
      setAppointments(data.appointments || [])
      setPatients(data.patients || [])
      setNotifications(data.notifications || [])
    } catch (error) {
      toast.error(error.message || 'Unable to load doctor dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (activeView !== 'dashboard') return undefined

    const timer = setInterval(() => {
      loadDashboard({ silent: true })
    }, 15000)

    return () => clearInterval(timer)
  }, [activeView])

  const onSendReminder = async (appointmentId) => {
    try {
      setActionLoadingId(`reminder-${appointmentId}`)
      await sendAppointmentReminder(appointmentId)
      toast.success('Reminder sent successfully')
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.message || 'Unable to send reminder')
    } finally {
      setActionLoadingId('')
    }
  }

  const onViewSummary = async (appointmentId) => {
    try {
      setActionLoadingId(`summary-${appointmentId}`)
      const data = await getAppointmentSummary(appointmentId)
      setSelectedSummary(data.summary || null)
    } catch (error) {
      toast.error(error.message || 'Unable to load appointment summary')
    } finally {
      setActionLoadingId('')
    }
  }

  const onMarkNotificationRead = async (notificationId) => {
    try {
      await markDoctorNotificationRead(notificationId)
      setNotifications((prev) => prev.map((n) => (
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      )))
    } catch (error) {
      toast.error(error.message || 'Unable to mark notification as read')
    }
  }

  const onLogout = () => {
    localStorage.removeItem('clinix_session_token')
    localStorage.removeItem('clinix_patient_id')
    localStorage.removeItem('clinix_user_name')
    localStorage.removeItem('clinix_user_role')
    window.location.assign('/login')
  }

  if (loading && activeView === 'dashboard') {
    return (
      <div className="min-h-screen bg-container px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-28" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-pink-bg min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="glass-strong rounded-2xl p-4">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary to-rosePink p-4 text-white">
            <h2 className="font-display text-xl">Doctor Panel</h2>
            <p className="text-sm text-rose-50">Dr. {name}</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeView === 'dashboard' ? 'bg-primary text-white' : 'bg-rose-50 text-textPrimary hover:bg-rose-100'}`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveView('schedule')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeView === 'schedule' ? 'bg-primary text-white' : 'bg-rose-50 text-textPrimary hover:bg-rose-100'}`}
            >
              <CalendarCog size={16} /> Manage Schedule
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-textPrimary">
                {activeView === 'dashboard' ? 'Doctor Dashboard' : 'Manage Availability'}
              </h1>
              <p className="mt-1 text-textSecondary">
                {activeView === 'dashboard'
                  ? 'Track appointments, patient updates, and reminders.'
                  : 'Configure your working days, hours, breaks, and consultation modes.'}
              </p>
            </div>

            {activeView === 'dashboard' && (
              <Button variant="outline" onClick={() => loadDashboard({ silent: true })} disabled={refreshing}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
          </Card>

          {activeView === 'schedule' && (
            <AvailabilityScheduleEditor onSaved={() => loadDashboard({ silent: true })} />
          )}

          {activeView === 'dashboard' && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={CalendarCheck2}
                  label="Today's Appointments"
                  value={summary?.todayAppointments ?? 0}
                  hint="Consultation load for today"
                />
                <StatCard
                  icon={UsersRound}
                  label="Patient List"
                  value={summary?.uniquePatients ?? patients.length}
                  hint="Unique patients assigned"
                />
                <StatCard
                  icon={Bell}
                  label="Unread Notifications"
                  value={summary?.unreadNotifications ?? unreadCount}
                  hint="Messages and lab updates"
                />
                <StatCard
                  icon={TriangleAlert}
                  label="High No-Show Risk"
                  value={summary?.highRiskAppointments ?? 0}
                  hint="AI predicted risk today"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                <Card>
                  <h2 className="mb-3 font-semibold text-textPrimary">Today's + Upcoming Appointments</h2>

                  {appointments.length === 0 && (
                    <p className="text-sm text-textSecondary">No appointments scheduled for today.</p>
                  )}

                  {appointments.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[780px] border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wide text-textSecondary">
                            <th className="px-2 py-1">Date</th>
                            <th className="px-2 py-1">Time</th>
                            <th className="px-2 py-1">Patient</th>
                            <th className="px-2 py-1">Type</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">AI No-Show Risk</th>
                            <th className="px-2 py-1">Quick Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appointment) => (
                            <tr key={appointment.appointment_id} className="rounded-xl bg-rose-50 text-sm text-textPrimary">
                              <td className="rounded-l-xl px-2 py-2 font-semibold">{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                              <td className="px-2 py-2 font-semibold">{appointment.appointment_time}</td>
                              <td className="px-2 py-2">
                                <p className="font-semibold">{appointment.patient_name}</p>
                                <p className="text-xs text-textSecondary">{appointment.patient_phone || appointment.patient_email || 'No contact'}</p>
                              </td>
                              <td className="px-2 py-2 capitalize">{appointment.visit_type || 'in-clinic'}</td>
                              <td className="px-2 py-2 capitalize">{appointment.status}</td>
                              <td className="px-2 py-2">
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getRiskStyles(appointment.no_show_risk?.label)}`}>
                                  {appointment.no_show_risk?.label || 'Low'} ({appointment.no_show_risk?.probability || 0}%)
                                </span>
                              </td>
                              <td className="rounded-r-xl px-2 py-2">
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                                    disabled={actionLoadingId === `reminder-${appointment.appointment_id}`}
                                    onClick={() => onSendReminder(appointment.appointment_id)}
                                  >
                                    <Send size={14} />
                                    {actionLoadingId === `reminder-${appointment.appointment_id}` ? 'Sending...' : 'Send Reminder'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                                    disabled={actionLoadingId === `summary-${appointment.appointment_id}`}
                                    onClick={() => onViewSummary(appointment.appointment_id)}
                                  >
                                    <FileSearch size={14} />
                                    {actionLoadingId === `summary-${appointment.appointment_id}` ? 'Loading...' : 'View Summary'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <div className="space-y-4">
                  <Card>
                    <h3 className="mb-2 font-semibold text-textPrimary">Notifications</h3>

                    {notifications.length === 0 && (
                      <p className="text-sm text-textSecondary">No notifications right now.</p>
                    )}

                    {notifications.length > 0 && (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.notification_id}
                            className={`rounded-xl border p-3 ${notification.is_read ? 'border-rose-100 bg-white' : 'border-amber-200 bg-amber-50'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-textPrimary">{notification.title}</p>
                                <p className="text-xs text-textSecondary">{notification.message}</p>
                              </div>
                              {!notification.is_read && !notification.generated && (
                                <button
                                  className="text-xs font-semibold text-primary hover:text-deepPink"
                                  onClick={() => onMarkNotificationRead(notification.notification_id)}
                                >
                                  Mark read
                                </button>
                              )}
                              {notification.generated && (
                                <span className="text-[10px] uppercase tracking-wide text-amber-700">Auto</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card>
                    <h3 className="mb-2 font-semibold text-textPrimary">Patient Summary</h3>
                    {!selectedSummary && (
                      <p className="text-sm text-textSecondary">Click View Summary on an appointment to load patient details.</p>
                    )}

                    {selectedSummary && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Patient:</span> {selectedSummary.patient_name}</p>
                        <p><span className="font-semibold">Contact:</span> {selectedSummary.patient_phone || selectedSummary.patient_email || 'No contact'}</p>
                        <p><span className="font-semibold">Visit:</span> {selectedSummary.appointment_date} {selectedSummary.appointment_time}</p>
                        <p><span className="font-semibold">Reason:</span> {selectedSummary.consultation_reason || 'N/A'}</p>
                        <p><span className="font-semibold">Medical History:</span> {selectedSummary.medical_history || 'Not available'}</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
