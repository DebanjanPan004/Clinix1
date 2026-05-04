import { BellRing } from 'lucide-react'
import Card from '../ui/Card'

export default function MedicineReminder({ reminder, onToggle }) {
  const formatDuration = () => {
    if (reminder.duration) return reminder.duration
    if (reminder.total_days) return `${reminder.total_days} days`
    return ''
  }

  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-textPrimary">{reminder.medicine_name}</h3>
        <p className="text-sm text-textSecondary">{reminder.dosage}</p>
        {(reminder.quantity || reminder.total_days || reminder.duration || reminder.notes) && (
          <div className="mt-1 space-y-0.5 text-xs text-textSecondary">
            {reminder.quantity && <p>Quantity: {reminder.quantity}</p>}
            {formatDuration() && <p>Duration: {formatDuration()}</p>}
            {reminder.notes && <p>{reminder.notes}</p>}
          </div>
        )}
        <p className="mt-1 flex items-center gap-2 text-xs text-primary">
          <BellRing size={14} /> {reminder.reminder_time}
        </p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={reminder.status === 'completed'}
          onChange={() => onToggle(reminder)}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-rose-200 transition peer-checked:bg-primary" />
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </label>
    </Card>
  )
}
