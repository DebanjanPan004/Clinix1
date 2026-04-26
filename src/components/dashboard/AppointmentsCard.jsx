import { CalendarDays, Clock3, Stethoscope, XCircle } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function AppointmentsCard({ appointments, onCancel }) {
  return (
    <Card>
      <h3 className="mb-4 font-semibold text-textPrimary">Upcoming Appointments</h3>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-textSecondary">No upcoming appointments available.</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.appointment_id} className="rounded-xl bg-rose-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-textPrimary">#{appointment.appointment_id}</p>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-primary">
                  {appointment.status}
                </span>
              </div>

              <p className="flex items-center gap-2 text-sm text-textSecondary">
                <Stethoscope size={14} className="text-primary" /> Dr. {appointment.doctor_name}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-textSecondary">
                <CalendarDays size={14} className="text-primary" /> {appointment.appointment_date}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-textSecondary">
                <Clock3 size={14} className="text-primary" /> {appointment.appointment_time}
              </p>

              {appointment.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  className="mt-3 w-full border-red-300 text-red-600 hover:bg-red-500 hover:text-white"
                  onClick={() => onCancel(appointment.appointment_id)}
                >
                  <XCircle size={16} /> Cancel Appointment
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
