import { useMemo } from 'react'
import toast from 'react-hot-toast'
import AppointmentsCard from './AppointmentsCard'
import MedicineReminderCard from './MedicineReminderCard'
import AdherenceProgress from './AdherenceProgress'
import ActivityFeed from './ActivityFeed'
import QuickActions from './QuickActions'
import Skeleton from '../ui/Skeleton'
import useAppointments from '../../hooks/useAppointments'
import useReminders from '../../hooks/useReminders'
import useActivities from '../../hooks/useActivities'
import { uploadReport } from '../../services/reportService'

export default function PatientDashboard() {
  const patientId = useMemo(() => localStorage.getItem('clinix_patient_id'), [])
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    removeAppointment,
  } = useAppointments(patientId)
  const {
    reminders,
    loading: remindersLoading,
    error: remindersError,
    toggleReminder,
  } = useReminders(patientId)
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    addActivity,
  } = useActivities(patientId)

  const loading = appointmentsLoading || remindersLoading || activitiesLoading
  const error = appointmentsError || remindersError || activitiesError

  const onToggleReminder = async (reminder) => {
    try {
      await toggleReminder(reminder)
      await addActivity({
        patient_id: patientId,
        activity_type: 'medicine reminder updated',
        description: `${reminder.medicine_name} marked as ${reminder.status === 'completed' ? 'pending' : 'completed'}.`,
      })
      toast.success('Reminder updated')
    } catch (toggleError) {
      toast.error(toggleError.message || 'Could not update reminder')
    }
  }

  const onCancelAppointment = async (appointmentId) => {
    try {
      await removeAppointment(appointmentId)
      await addActivity({
        patient_id: patientId,
        activity_type: 'appointment cancelled',
        description: `Appointment ${appointmentId} has been cancelled.`,
      })
      toast.success('Appointment cancelled')
    } catch (cancelError) {
      toast.error(cancelError.message || 'Unable to cancel appointment')
    }
  }

  const onUploadReport = async (file) => {
    try {
      const report = await uploadReport(file, patientId)
      await addActivity({
        patient_id: patientId,
        activity_type: 'report uploaded',
        description: `Medical report uploaded: ${report.path}`,
      })
      toast.success('Report uploaded successfully')
    } catch (uploadError) {
      toast.error(uploadError.message || 'Unable to upload report')
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-2">
        <AppointmentsCard appointments={appointments} onCancel={onCancelAppointment} />
        <MedicineReminderCard reminders={reminders} onToggle={onToggleReminder} />
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <AdherenceProgress reminders={reminders} />
        <ActivityFeed activities={activities} />
        <QuickActions onUpload={onUploadReport} />
      </div>
    </div>
  )
}
