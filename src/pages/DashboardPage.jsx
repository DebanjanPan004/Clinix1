import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import PatientDashboard from '../components/dashboard/PatientDashboard'
import AppointmentsCard from '../components/dashboard/AppointmentsCard'
import MedicineReminderCard from '../components/dashboard/MedicineReminderCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import QuickActions from '../components/dashboard/QuickActions'
import Skeleton from '../components/ui/Skeleton'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import BookingFlow from '../components/appointment/BookingFlow'
import useAppointments from '../hooks/useAppointments'
import useReminders from '../hooks/useReminders'
import useActivities from '../hooks/useActivities'
import { uploadReport, listReports } from '../services/reportService'

function AppointmentsSection({ patientId }) {
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    removeAppointment,
  } = useAppointments(patientId)

  const [showBookingFlow, setShowBookingFlow] = useState(false)

  const handleBookingComplete = async () => {
    await fetchAppointments()
    setShowBookingFlow(false)
  }

  if (appointmentsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} className="h-56" />
        ))}
      </div>
    )
  }

  if (appointmentsError) {
    return <Card className="text-sm text-red-600">{appointmentsError}</Card>
  }

  if (showBookingFlow) {
    return (
      <BookingFlow
        patientId={patientId}
        onBookingComplete={handleBookingComplete}
        onCancel={() => setShowBookingFlow(false)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-textPrimary">Your Appointments</h3>
        <Button onClick={() => setShowBookingFlow(true)} className="w-full md:w-auto">
          Book New Appointment
        </Button>
      </div>

      <AppointmentsCard
        appointments={appointments}
        onCancel={async (appointmentId) => {
          try {
            await removeAppointment(appointmentId)
            toast.success('Appointment cancelled')
          } catch (error) {
            toast.error(error.message || 'Unable to cancel appointment')
          }
        }}
      />
    </div>
  )
}

function HistorySection({ patientId }) {
  const { activities, loading, error } = useActivities(patientId)

  if (loading) return <Skeleton className="h-64" />
  if (error) return <Card className="text-sm text-red-600">{error}</Card>

  return <ActivityFeed activities={activities} />
}

function ReportsSection({ patientId }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    if (!patientId) {
      setReports([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await listReports(patientId)
      setReports(data)
    } catch (err) {
      setError(err.message || 'Unable to load reports')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const onUpload = async (file) => {
    try {
      await uploadReport(file, patientId)
      toast.success('Report uploaded successfully')
      await loadReports()
    } catch (err) {
      toast.error(err.message || 'Unable to upload report')
    }
  }

  return (
    <div className="space-y-4">
      <QuickActions onUpload={onUpload} />

      <Card>
        <h3 className="mb-3 font-semibold text-textPrimary">Uploaded Reports</h3>

        {loading && <Skeleton className="h-28" />}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <p className="text-sm text-textSecondary">No reports uploaded yet.</p>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.path} className="flex items-center justify-between rounded-xl bg-rose-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{report.name}</p>
                  <p className="text-xs text-textSecondary">{report.created_at ? new Date(report.created_at).toLocaleString() : 'Uploaded recently'}</p>
                </div>
                <a
                  href={report.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-primary hover:text-deepPink"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function SettingsSection() {
  const [name, setName] = useState(localStorage.getItem('clinix_user_name') || '')
  const [role] = useState(localStorage.getItem('clinix_user_role') || 'patient')
  const [profileImage, setProfileImage] = useState(localStorage.getItem('clinix_profile_image') || '')
  const [previewImage, setPreviewImage] = useState(profileImage)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result
      setProfileImage(base64)
      setPreviewImage(base64)
      localStorage.setItem('clinix_profile_image', base64)
      toast.success('Profile image updated')
    }
    reader.readAsDataURL(file)
  }

  const onSave = () => {
    localStorage.setItem('clinix_user_name', name || 'Patient')
    toast.success('Profile preferences saved')
  }

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-textPrimary">Profile Settings</h3>
      
      <div className="flex flex-col items-center gap-4">
        <div>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-primary object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-rose-200 bg-rose-50">
              <span className="text-3xl text-textSecondary">👤</span>
            </div>
          )}
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <span className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-deepPink transition-colors">
            Upload Image
          </span>
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm text-textSecondary">Display Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          placeholder="Enter your name"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-textSecondary">Role</label>
        <input
          value={role}
          disabled
          className="w-full rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-textSecondary"
        />
      </div>
      <Button type="button" onClick={onSave}>Save Settings</Button>
    </Card>
  )
}

function RemindersSection({ patientId }) {
  const { reminders, loading, error, toggleReminder } = useReminders(patientId)

  if (loading) return <Skeleton className="h-56" />
  if (error) return <Card className="text-sm text-red-600">{error}</Card>

  return (
    <MedicineReminderCard
      reminders={reminders}
      onToggle={async (reminder) => {
        try {
          await toggleReminder(reminder)
          toast.success('Reminder updated')
        } catch (err) {
          toast.error(err.message || 'Unable to update reminder')
        }
      }}
    />
  )
}

export default function DashboardPage() {
  const location = useLocation()
  const patientId = useMemo(() => localStorage.getItem('clinix_patient_id'), [])

  const section = location.pathname.replace('/dashboard', '').replace(/^\//, '') || 'dashboard'

  const allowedSections = ['dashboard', 'appointments', 'history', 'reports', 'settings', 'reminders']
  if (!allowedSections.includes(section)) {
    return <Navigate to="/dashboard" replace />
  }

  const titles = {
    dashboard: 'Patient Dashboard',
    appointments: 'Appointments',
    history: 'Medical History',
    reports: 'Reports',
    settings: 'Settings',
    reminders: 'Medicine Reminders',
  }

  return (
    <div className="dashboard-pink-bg clinix-scrollbar min-h-screen overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <Sidebar />

        <div className="space-y-4">
          <Header />

          <div className="glass-strong rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl text-textPrimary">{titles[section]}</h2>
              {section !== 'dashboard' && (
                <Link to="/dashboard" className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-deepPink transition-colors duration-200">
                  Back to Dashboard
                </Link>
              )}
            </div>
          </div>

          {section === 'dashboard' && <PatientDashboard />}
          {section === 'appointments' && <AppointmentsSection patientId={patientId} />}
          {section === 'history' && <HistorySection patientId={patientId} />}
          {section === 'reports' && <ReportsSection patientId={patientId} />}
          {section === 'settings' && <SettingsSection />}
          {section === 'reminders' && <RemindersSection patientId={patientId} />}
        </div>
      </div>
    </div>
  )
}
