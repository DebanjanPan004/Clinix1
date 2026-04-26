import { CalendarDays, Clock3, Stethoscope } from 'lucide-react'
import Card from '../ui/Card'

export default function AppointmentCard({ appointment }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-textPrimary">Appointment #{appointment.appointment_id}</h3>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-primary">
          {appointment.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-textSecondary">
        <Stethoscope size={16} className="text-primary" />
        Dr. {appointment.doctor_name}
      </div>
      <div className="flex items-center gap-2 text-sm text-textSecondary">
        <CalendarDays size={16} className="text-primary" />
        {appointment.date}
      </div>
      <div className="flex items-center gap-2 text-sm text-textSecondary">
        <Clock3 size={16} className="text-primary" />
        {appointment.time}
      </div>
    </Card>
  )
}
