import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Activity,
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import {
  cancelAdminAppointment,
  createAppointmentByAdmin,
  createDoctorByAdmin,
  createPatientByAdmin,
  generateAdminReport,
  getAdminAppointments,
  getAdminDashboardData,
  getAdminLookups,
  rescheduleAdminAppointment,
  updateAdminAppointmentStatus,
} from '../services/adminService'

const APPOINTMENT_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-textSecondary">{title}</p>
        <Icon size={16} className="text-primary" />
      </div>
      <p className="font-display text-3xl text-textPrimary">{value}</p>
      <p className="text-xs text-textSecondary">{hint}</p>
    </Card>
  )
}

function SeverityChip({ severity }) {
  const mapped = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${mapped[severity] || mapped.low}`}>
      {severity || 'low'}
    </span>
  )
}

function AppointmentTrendChart({ trend }) {
  const maxValue = Math.max(1, ...trend.map((item) => item.total))

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-textPrimary">Appointment Summary (Last 7 Days)</h3>
      <div className="grid grid-cols-7 gap-2">
        {trend.map((item) => {
          const totalHeight = Math.max(6, Math.round((item.total / maxValue) * 100))
          const cancelledHeight = item.total > 0 ? Math.max(4, Math.round((item.cancelled / item.total) * totalHeight)) : 0
          const label = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' })

          return (
            <div key={item.date} className="flex flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end justify-center rounded-xl bg-rose-50 px-1">
                <div
                  className="relative w-7 rounded-t-md bg-primary/35"
                  style={{ height: `${totalHeight}%` }}
                  title={`Total: ${item.total}`}
                >
                  {cancelledHeight > 0 && (
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-t-sm bg-red-400"
                      style={{ height: `${cancelledHeight}%` }}
                      title={`Cancelled: ${item.cancelled}`}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-textSecondary">{label}</p>
              <p className="text-xs font-semibold text-textPrimary">{item.total}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const name = localStorage.getItem('clinix_user_name') || 'Admin'
  const [activeSection, setActiveSection] = useState('dashboard')

  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    metrics: { totalDoctors: 0, activePatients: 0, dailyAppointments: 0, dailyCancellations: 0 },
    appointmentTrend: [],
    alerts: [],
    refreshedAt: null,
  })

  const [lookupsLoading, setLookupsLoading] = useState(true)
  const [lookups, setLookups] = useState({ doctors: [], patients: [] })

  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentsResult, setAppointmentsResult] = useState({
    appointments: [],
    pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  })

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  })

  const [rescheduleDraft, setRescheduleDraft] = useState({
    appointmentId: '',
    appointmentDate: '',
    appointmentTime: '',
  })

  const [quickAction, setQuickAction] = useState('')
  const [doctorForm, setDoctorForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [patientForm, setPatientForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    visit_type: 'in-clinic',
    consultation_reason: '',
    consultation_fee: '',
  })
  const [generatedReport, setGeneratedReport] = useState(null)

  const dashboardTitle = useMemo(() => {
    return activeSection === 'dashboard' ? 'System Activity Dashboard' : 'Manage and Track Appointments'
  }, [activeSection])

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!silent) setDashboardLoading(true)
    try {
      const data = await getAdminDashboardData()
      setDashboardData(data)
    } catch (error) {
      toast.error(error.message || 'Unable to load admin dashboard')
    } finally {
      setDashboardLoading(false)
    }
  }

  const loadLookups = async () => {
    setLookupsLoading(true)
    try {
      const data = await getAdminLookups()
      setLookups(data)
    } catch (error) {
      toast.error(error.message || 'Unable to load doctor/patient lookups')
    } finally {
      setLookupsLoading(false)
    }
  }

  const loadAppointments = async () => {
    setAppointmentsLoading(true)
    try {
      const data = await getAdminAppointments(filters)
      setAppointmentsResult(data)
    } catch (error) {
      toast.error(error.message || 'Unable to load appointments')
    } finally {
      setAppointmentsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    loadLookups()
  }, [])

  useEffect(() => {
    if (activeSection !== 'dashboard') return undefined
    const timer = setInterval(() => loadDashboard({ silent: true }), 15000)
    return () => clearInterval(timer)
  }, [activeSection])

  useEffect(() => {
    if (activeSection !== 'appointments') return
    loadAppointments()
  }, [activeSection, filters.page, filters.pageSize, filters.status, filters.dateFrom, filters.dateTo, filters.search])

  const onLogout = () => {
    localStorage.removeItem('clinix_session_token')
    localStorage.removeItem('clinix_patient_id')
    localStorage.removeItem('clinix_user_name')
    localStorage.removeItem('clinix_user_role')
    window.location.assign('/login')
  }

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await updateAdminAppointmentStatus(appointmentId, status)
      toast.success('Appointment status updated')
      await loadAppointments()
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.message || 'Unable to update status')
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await cancelAdminAppointment(appointmentId)
      toast.success('Appointment cancelled')
      await loadAppointments()
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.message || 'Unable to cancel appointment')
    }
  }

  const handleRescheduleSave = async () => {
    if (!rescheduleDraft.appointmentId || !rescheduleDraft.appointmentDate || !rescheduleDraft.appointmentTime) {
      toast.error('Select new date and time to reschedule')
      return
    }

    try {
      await rescheduleAdminAppointment(
        rescheduleDraft.appointmentId,
        rescheduleDraft.appointmentDate,
        rescheduleDraft.appointmentTime
      )
      toast.success('Appointment rescheduled')
      setRescheduleDraft({ appointmentId: '', appointmentDate: '', appointmentTime: '' })
      await loadAppointments()
      await loadDashboard({ silent: true })
    } catch (error) {
      toast.error(error.message || 'Unable to reschedule appointment')
    }
  }

  const handleCreateDoctor = async (event) => {
    event.preventDefault()
    try {
      await createDoctorByAdmin(doctorForm)
      toast.success('Doctor added successfully')
      setDoctorForm({ fullName: '', email: '', phone: '', password: '' })
      await loadDashboard({ silent: true })
      await loadLookups()
    } catch (error) {
      toast.error(error.message || 'Unable to add doctor')
    }
  }

  const handleCreatePatient = async (event) => {
    event.preventDefault()
    try {
      await createPatientByAdmin(patientForm)
      toast.success('Patient registered successfully')
      setPatientForm({ fullName: '', email: '', phone: '', password: '' })
      await loadDashboard({ silent: true })
      await loadLookups()
    } catch (error) {
      toast.error(error.message || 'Unable to register patient')
    }
  }

  const handleCreateAppointment = async (event) => {
    event.preventDefault()
    try {
      await createAppointmentByAdmin({
        ...appointmentForm,
        consultation_fee: appointmentForm.consultation_fee ? Number(appointmentForm.consultation_fee) : null,
      })
      toast.success('Appointment scheduled successfully')
      setAppointmentForm({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        visit_type: 'in-clinic',
        consultation_reason: '',
        consultation_fee: '',
      })
      await loadDashboard({ silent: true })
      if (activeSection === 'appointments') await loadAppointments()
    } catch (error) {
      toast.error(error.message || 'Unable to schedule appointment')
    }
  }

  const handleGenerateReport = async () => {
    try {
      const data = await generateAdminReport()
      setGeneratedReport(data.report || null)
      toast.success('Report generated')
    } catch (error) {
      toast.error(error.message || 'Unable to generate report')
    }
  }

  return (
    <div className="dashboard-pink-bg min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="glass-strong rounded-2xl p-4">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary to-rosePink p-4 text-white">
            <h2 className="font-display text-xl">Admin Panel</h2>
            <p className="text-sm text-rose-50">{name}</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeSection === 'dashboard' ? 'bg-primary text-white' : 'bg-rose-50 text-textPrimary hover:bg-rose-100'}`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('appointments')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeSection === 'appointments' ? 'bg-primary text-white' : 'bg-rose-50 text-textPrimary hover:bg-rose-100'}`}
            >
              <CalendarDays size={16} /> Appointment Management
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
              <h1 className="font-display text-2xl text-textPrimary">{dashboardTitle}</h1>
              <p className="mt-1 text-textSecondary">
                {activeSection === 'dashboard'
                  ? 'Monitor clinic statistics, alerts, and perform quick administrative actions.'
                  : 'Search, filter, reschedule, cancel, and update appointment statuses.'}
              </p>
            </div>

            {activeSection === 'dashboard' && (
              <Button variant="outline" onClick={() => loadDashboard({ silent: true })}>
                Refresh Metrics
              </Button>
            )}
          </Card>

          {activeSection === 'dashboard' && dashboardLoading && (
            <div className="grid gap-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-80" />
            </div>
          )}

          {activeSection === 'dashboard' && !dashboardLoading && (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Doctors" value={dashboardData.metrics?.totalDoctors ?? 0} hint="Registered doctors" icon={Stethoscope} />
                <StatCard title="Active Patients" value={dashboardData.metrics?.activePatients ?? 0} hint="Last 30 days" icon={Users} />
                <StatCard title="Daily Appointments" value={dashboardData.metrics?.dailyAppointments ?? 0} hint="Today" icon={CalendarClock} />
                <StatCard title="Daily Cancellations" value={dashboardData.metrics?.dailyCancellations ?? 0} hint="Today" icon={ShieldAlert} />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <AppointmentTrendChart trend={dashboardData.appointmentTrend || []} />

                <Card>
                  <h3 className="mb-4 font-semibold text-textPrimary">Recent Alerts</h3>
                  <div className="space-y-3">
                    {(dashboardData.alerts || []).map((alert) => (
                      <div key={alert.id} className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-textPrimary">{alert.title}</p>
                          <SeverityChip severity={alert.severity} />
                        </div>
                        <p className="text-xs text-textSecondary">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <h3 className="mb-4 font-semibold text-textPrimary">Quick Actions</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant={quickAction === 'doctor' ? 'primary' : 'secondary'} onClick={() => setQuickAction('doctor')}>
                      <UserPlus size={16} /> Add Doctor
                    </Button>
                    <Button variant={quickAction === 'patient' ? 'primary' : 'secondary'} onClick={() => setQuickAction('patient')}>
                      <Users size={16} /> Register Patient
                    </Button>
                    <Button variant={quickAction === 'appointment' ? 'primary' : 'secondary'} onClick={() => setQuickAction('appointment')}>
                      <CalendarClock size={16} /> Schedule Appointment
                    </Button>
                    <Button variant="secondary" onClick={handleGenerateReport}>
                      <Activity size={16} /> Generate Report
                    </Button>
                  </div>

                  {quickAction === 'doctor' && (
                    <form onSubmit={handleCreateDoctor} className="mt-4 grid gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-sm font-semibold text-textPrimary">Add Doctor</p>
                      <input required placeholder="Full Name" value={doctorForm.fullName} onChange={(event) => setDoctorForm((prev) => ({ ...prev, fullName: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input required type="email" placeholder="Email" value={doctorForm.email} onChange={(event) => setDoctorForm((prev) => ({ ...prev, email: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input placeholder="Phone" value={doctorForm.phone} onChange={(event) => setDoctorForm((prev) => ({ ...prev, phone: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input required type="password" placeholder="Temporary Password" value={doctorForm.password} onChange={(event) => setDoctorForm((prev) => ({ ...prev, password: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <Button type="submit">Create Doctor</Button>
                    </form>
                  )}

                  {quickAction === 'patient' && (
                    <form onSubmit={handleCreatePatient} className="mt-4 grid gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-sm font-semibold text-textPrimary">Register Patient</p>
                      <input required placeholder="Full Name" value={patientForm.fullName} onChange={(event) => setPatientForm((prev) => ({ ...prev, fullName: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input required type="email" placeholder="Email" value={patientForm.email} onChange={(event) => setPatientForm((prev) => ({ ...prev, email: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input placeholder="Phone" value={patientForm.phone} onChange={(event) => setPatientForm((prev) => ({ ...prev, phone: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input required type="password" placeholder="Temporary Password" value={patientForm.password} onChange={(event) => setPatientForm((prev) => ({ ...prev, password: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <Button type="submit">Register Patient</Button>
                    </form>
                  )}

                  {quickAction === 'appointment' && (
                    <form onSubmit={handleCreateAppointment} className="mt-4 grid gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-sm font-semibold text-textPrimary">Schedule Appointment</p>
                      <select required value={appointmentForm.patient_id} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, patient_id: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2">
                        <option value="">Select Patient</option>
                        {(lookups.patients || []).map((patient) => (
                          <option key={patient.patient_id} value={patient.patient_id}>{patient.patient_name}</option>
                        ))}
                      </select>
                      <select required value={appointmentForm.doctor_id} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctor_id: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2">
                        <option value="">Select Doctor</option>
                        {(lookups.doctors || []).map((doctor) => (
                          <option key={doctor.doctor_id} value={doctor.doctor_id}>{doctor.doctor_name}</option>
                        ))}
                      </select>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input required type="date" value={appointmentForm.appointment_date} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointment_date: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                        <input required type="time" value={appointmentForm.appointment_time} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointment_time: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      </div>
                      <select value={appointmentForm.visit_type} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, visit_type: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2">
                        <option value="in-clinic">In-Clinic</option>
                        <option value="online">Online</option>
                      </select>
                      <input placeholder="Reason" value={appointmentForm.consultation_reason} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, consultation_reason: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <input type="number" placeholder="Consultation Fee" value={appointmentForm.consultation_fee} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, consultation_fee: event.target.value }))} className="rounded-xl border border-rose-200 px-3 py-2" />
                      <Button type="submit">Schedule</Button>
                    </form>
                  )}
                </Card>

                <Card>
                  <h3 className="mb-4 font-semibold text-textPrimary">Generated Report</h3>

                  {!generatedReport && (
                    <div className="rounded-xl bg-rose-50 p-4 text-sm text-textSecondary">
                      Click Generate Report to create a real-time summary.
                    </div>
                  )}

                  {generatedReport && (
                    <div className="space-y-2 rounded-xl bg-rose-50 p-4 text-sm">
                      <p><span className="font-semibold">Period:</span> {generatedReport.period}</p>
                      <p><span className="font-semibold">Appointments:</span> {generatedReport.appointments}</p>
                      <p><span className="font-semibold">Cancellations:</span> {generatedReport.cancellations}</p>
                      <p><span className="font-semibold">Total Patients:</span> {generatedReport.totalPatients}</p>
                      <p><span className="font-semibold">Total Doctors:</span> {generatedReport.totalDoctors}</p>
                      <p className="text-xs text-textSecondary">Generated: {new Date(generatedReport.generated_at).toLocaleString()}</p>
                    </div>
                  )}

                  {lookupsLoading && <p className="mt-3 text-sm text-textSecondary">Loading doctor/patient lists...</p>}
                </Card>
              </div>
            </>
          )}

          {activeSection === 'appointments' && (
            <>
              <Card className="space-y-3">
                <div className="grid gap-2 md:grid-cols-5">
                  <input
                    placeholder="Search appointment, patient, or doctor"
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, search: event.target.value }))}
                    className="rounded-xl border border-rose-200 px-3 py-2"
                  />
                  <select
                    value={filters.status}
                    onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, status: event.target.value }))}
                    className="rounded-xl border border-rose-200 px-3 py-2"
                  >
                    <option value="">All Status</option>
                    {APPOINTMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, dateFrom: event.target.value }))}
                    className="rounded-xl border border-rose-200 px-3 py-2"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, dateTo: event.target.value }))}
                    className="rounded-xl border border-rose-200 px-3 py-2"
                  />
                  <select
                    value={filters.pageSize}
                    onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, pageSize: Number(event.target.value) }))}
                    className="rounded-xl border border-rose-200 px-3 py-2"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={30}>30 / page</option>
                  </select>
                </div>
              </Card>

              <Card>
                <h3 className="mb-3 font-semibold text-textPrimary">Appointment Table</h3>

                {appointmentsLoading && <Skeleton className="h-56" />}

                {!appointmentsLoading && appointmentsResult.appointments.length === 0 && (
                  <p className="text-sm text-textSecondary">No appointments found for selected filters.</p>
                )}

                {!appointmentsLoading && appointmentsResult.appointments.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-textSecondary">
                          <th className="px-2 py-1">Patient</th>
                          <th className="px-2 py-1">Doctor</th>
                          <th className="px-2 py-1">Date</th>
                          <th className="px-2 py-1">Time</th>
                          <th className="px-2 py-1">Status</th>
                          <th className="px-2 py-1">Visit Type</th>
                          <th className="px-2 py-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsResult.appointments.map((appointment) => (
                          <tr key={appointment.appointment_id} className="rounded-xl bg-rose-50 text-sm text-textPrimary">
                            <td className="rounded-l-xl px-2 py-2">
                              <p className="font-semibold">{appointment.patient_name}</p>
                              <p className="text-xs text-textSecondary">{appointment.patient_email}</p>
                            </td>
                            <td className="px-2 py-2">
                              <p className="font-semibold">{appointment.doctor_name || 'Unassigned'}</p>
                              <p className="text-xs text-textSecondary">{appointment.doctor_specialization || 'N/A'}</p>
                            </td>
                            <td className="px-2 py-2">{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                            <td className="px-2 py-2">{appointment.appointment_time}</td>
                            <td className="px-2 py-2">
                              <select
                                value={appointment.status}
                                onChange={(event) => handleStatusUpdate(appointment.appointment_id, event.target.value)}
                                className="rounded-lg border border-rose-200 px-2 py-1"
                              >
                                {APPOINTMENT_STATUSES.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">{appointment.visit_type}</td>
                            <td className="rounded-r-xl px-2 py-2">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="secondary"
                                  className="px-3 py-1.5 text-xs"
                                  onClick={() => setRescheduleDraft({
                                    appointmentId: appointment.appointment_id,
                                    appointmentDate: appointment.appointment_date?.slice(0, 10) || '',
                                    appointmentTime: appointment.appointment_time || '',
                                  })}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500 hover:text-white"
                                  onClick={() => handleCancelAppointment(appointment.appointment_id)}
                                >
                                  Cancel
                                </Button>
                              </div>

                              {rescheduleDraft.appointmentId === appointment.appointment_id && (
                                <div className="mt-2 grid gap-2 rounded-lg bg-white p-2">
                                  <input type="date" value={rescheduleDraft.appointmentDate} onChange={(event) => setRescheduleDraft((prev) => ({ ...prev, appointmentDate: event.target.value }))} className="rounded-lg border border-rose-200 px-2 py-1" />
                                  <input type="time" value={rescheduleDraft.appointmentTime} onChange={(event) => setRescheduleDraft((prev) => ({ ...prev, appointmentTime: event.target.value }))} className="rounded-lg border border-rose-200 px-2 py-1" />
                                  <div className="flex gap-2">
                                    <Button className="px-3 py-1.5 text-xs" onClick={handleRescheduleSave}>Save</Button>
                                    <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setRescheduleDraft({ appointmentId: '', appointmentDate: '', appointmentTime: '' })}>Close</Button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="text-textSecondary">
                    Page {appointmentsResult.pagination.page} of {appointmentsResult.pagination.totalPages} | Total {appointmentsResult.pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      disabled={appointmentsResult.pagination.page <= 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={appointmentsResult.pagination.page >= appointmentsResult.pagination.totalPages}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
          </div>
        </div>
    </div>
  )
}
