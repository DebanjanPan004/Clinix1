import { CheckCircle, Calendar, Clock, Video, MapPin, FileText, IndianRupee } from 'lucide-react'
import Card from '../ui/Card'

export default function AppointmentSummary({
  doctor,
  appointmentDate,
  appointmentTime,
  visitType,
  consultationReason,
  showChecks = false,
}) {
  if (!doctor || !appointmentDate || !appointmentTime) {
    return (
      <Card className="bg-rose-50">
        <p className="text-sm text-textSecondary">Fill in appointment details to see summary</p>
      </Card>
    )
  }

  // Format date to readable format
  const dateObj = new Date(appointmentDate + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className="space-y-4 border-primary/20 bg-gradient-to-br from-rose-50 to-white">
      <h3 className="font-semibold text-textPrimary flex items-center gap-2">
        {showChecks && <CheckCircle size={20} className="text-green-500" />}
        Appointment Summary
      </h3>

      {/* Doctor Info */}
      <div className="space-y-2 border-b border-rose-200 pb-3">
        <p className="text-sm text-textSecondary">With</p>
        <div>
          <h4 className="text-base font-bold text-textPrimary">{doctor.name}</h4>
          <p className="text-xs text-primary font-medium">{doctor.specialization}</p>
        </div>
        <p className="text-xs text-textTertiary">{doctor.hospital}</p>
      </div>

      {/* Appointment Details */}
      <div className="space-y-2">
        {/* Date */}
        <div className="flex items-start gap-3">
          <Calendar size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-textSecondary">Date</p>
            <p className="text-sm font-semibold text-textPrimary">{formattedDate}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-textSecondary">Time</p>
            <p className="text-sm font-semibold text-textPrimary">{appointmentTime}</p>
          </div>
        </div>

        {/* Visit Type */}
        <div className="flex items-start gap-3">
          {visitType === 'online' ? (
            <Video size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          ) : (
            <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs text-textSecondary">Type</p>
            <p className="text-sm font-semibold text-textPrimary capitalize">
              {visitType === 'online' ? 'Online Consultation' : 'In-Clinic Visit'}
            </p>
          </div>
        </div>

        {/* Consultation Reason */}
        {consultationReason && (
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-textSecondary">Reason for visit</p>
              <p className="text-sm font-semibold text-textPrimary">{consultationReason}</p>
            </div>
          </div>
        )}

        {/* Consultation Fee */}
        <div className="flex items-start gap-3 border-t border-rose-200 pt-3">
          <IndianRupee size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-textSecondary">Consultation Fee</p>
            <p className="text-sm font-semibold text-textPrimary">₹{doctor.consultation_fee}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
