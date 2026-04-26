import { Calendar, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getDoctorTimeSlots } from '../../services/appointmentService'
import toast from 'react-hot-toast'

export default function TimeSlotSelector({
  doctorId,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  disabled = false,
}) {
  const [timeSlots, setTimeSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Load available time slots when doctor or date changes
  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setTimeSlots([])
      return
    }

    const loadSlots = async () => {
      setSlotsLoading(true)
      try {
        const slots = await getDoctorTimeSlots(doctorId, selectedDate)
        if (slots.length === 0) {
          toast.error('No available slots for the selected date')
        }
        setTimeSlots(slots)
      } catch {
        toast.error('Unable to load available time slots')
        setTimeSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }

    loadSlots()
  }, [doctorId, selectedDate])

  // Get today's date
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Get max date (90 days from today)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 90)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-textPrimary">
          <Calendar size={16} />
          Select Date
        </label>
        <input
          type="date"
          min={todayStr}
          max={maxDateStr}
          value={selectedDate}
          onChange={(e) => {
            onDateChange(e.target.value)
            onTimeChange('') // Reset time when date changes
          }}
          disabled={disabled}
          className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none disabled:bg-rose-50"
        />
        <p className="mt-1 text-xs text-textTertiary">Available for next 90 days</p>
      </div>

      {/* Time Slot Selector */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-textPrimary">
          <Clock size={16} />
          Select Time Slot
        </label>

        {slotsLoading && (
          <div className="flex items-center justify-center rounded-xl bg-rose-50 py-4">
            <p className="text-sm text-textSecondary">Loading available slots...</p>
          </div>
        )}

        {!slotsLoading && !selectedDate && (
          <div className="flex items-center justify-center rounded-xl bg-rose-50 py-4">
            <p className="text-sm text-textSecondary">Select a date first</p>
          </div>
        )}

        {!slotsLoading && selectedDate && timeSlots.length === 0 && (
          <div className="flex items-center justify-center rounded-xl bg-rose-50 py-4">
            <p className="text-sm text-textSecondary">No slots available for this date</p>
          </div>
        )}

        {!slotsLoading && timeSlots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => onTimeChange(slot)}
                disabled={disabled}
                className={`rounded-lg border-2 px-2 py-3 text-center text-sm font-semibold transition-all ${
                  selectedTime === slot
                    ? 'border-primary bg-primary text-white'
                    : 'border-rose-200 text-textPrimary hover:border-primary/50'
                } disabled:opacity-50`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
