import { Star, MapPin, Award, IndianRupee, Video, Building2 } from 'lucide-react'
import Button from '../ui/Button'

export default function DoctorCard({ doctor, isSelected, onSelect }) {
  const consultationModes = Array.isArray(doctor.consultation_modes) && doctor.consultation_modes.length > 0
    ? doctor.consultation_modes
    : ['online', 'in-clinic']

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
        isSelected ? 'border-primary bg-rose-50' : 'border-rose-100 hover:border-primary/50'
      }`}
    >
      <div className="space-y-3">
        {/* Doctor Name and Specialization */}
        <div>
          <h4 className="text-lg font-bold text-textPrimary">{doctor.name}</h4>
          <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
        </div>

        {/* Experience and Rating */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Award size={16} className="text-amber-600" />
            <span className="text-sm text-textSecondary">{doctor.experience} years exp.</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-textPrimary">{doctor.rating}</span>
          </div>
        </div>

        {/* Hospital and Qualification */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <p className="text-sm text-textSecondary">{doctor.hospital}</p>
          </div>
          <p className="text-xs text-textTertiary">{doctor.qualification}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {consultationModes.includes('online') && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
              <Video size={12} /> Online
            </span>
          )}
          {consultationModes.includes('in-clinic') && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <Building2 size={12} /> In-Clinic
            </span>
          )}
        </div>

        {/* Consultation Fee */}
        <div className="flex items-center justify-between border-t border-rose-200 pt-3">
          <div className="flex items-center gap-1">
            <IndianRupee size={16} className="text-primary" />
            <span className="font-semibold text-textPrimary">{doctor.consultation_fee}</span>
          </div>
          <Button
            size="sm"
            className={isSelected ? 'bg-primary text-white' : 'bg-rose-100 text-primary'}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  )
}
