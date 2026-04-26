import { BellRing } from 'lucide-react'
import Card from '../ui/Card'

export default function MedicineReminderCard({ reminders, onToggle }) {
  return (
    <Card>
      <h3 className="mb-4 font-semibold text-textPrimary">Medicine Reminders</h3>
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-sm text-textSecondary">No medicine reminders set.</p>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.reminder_id} className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3">
              <div>
                <p className="font-semibold text-textPrimary">{reminder.medicine_name}</p>
                <p className="text-sm text-textSecondary">{reminder.dosage}</p>
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
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
