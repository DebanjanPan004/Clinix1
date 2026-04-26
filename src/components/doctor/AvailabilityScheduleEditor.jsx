import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'
import {
  CONSULTATION_MODE_OPTIONS,
  DAY_KEYS,
  createDefaultDoctorSchedule,
  normalizeDoctorSchedule,
  validateDoctorSchedule,
} from '../../utils/doctorSchedule'
import { getDoctorAvailability, saveDoctorAvailability } from '../../services/doctorAvailabilityService'

const DAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

function DayChip({ label, active }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-primary text-white' : 'bg-rose-100 text-textSecondary'}`}>
      {label}
    </span>
  )
}

export default function AvailabilityScheduleEditor({ onSaved }) {
  const [schedule, setSchedule] = useState(createDefaultDoctorSchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const activeDays = useMemo(() => schedule.working_days || [], [schedule.working_days])

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getDoctorAvailability()
        const current = data.schedule || data.availability_schedule || data.available_hours || data.doctor?.available_hours || data
        setSchedule(normalizeDoctorSchedule(current))
      } catch (loadError) {
        setError(loadError.message || 'Unable to load availability settings')
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [])

  const updateSchedule = (updater) => {
    setSchedule((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return normalizeDoctorSchedule(next)
    })
  }

  const toggleWorkingDay = (dayKey) => {
    updateSchedule((prev) => {
      const workingDays = prev.working_days.includes(dayKey)
        ? prev.working_days.filter((item) => item !== dayKey)
        : [...prev.working_days, dayKey]

      return {
        ...prev,
        working_days: workingDays,
        working_hours: {
          ...prev.working_hours,
          [dayKey]: prev.working_hours[dayKey] || { start: '09:00', end: '17:00' },
        },
        break_times: {
          ...prev.break_times,
          [dayKey]: prev.break_times[dayKey] || [],
        },
      }
    })
  }

  const updateWorkingHours = (dayKey, field, value) => {
    updateSchedule((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [dayKey]: {
          ...(prev.working_hours[dayKey] || { start: '09:00', end: '17:00' }),
          [field]: value,
        },
      },
    }))
  }

  const addBreakTime = (dayKey) => {
    updateSchedule((prev) => ({
      ...prev,
      break_times: {
        ...prev.break_times,
        [dayKey]: [...(prev.break_times[dayKey] || []), { start: '12:00', end: '12:30' }],
      },
    }))
  }

  const updateBreakTime = (dayKey, breakIndex, field, value) => {
    updateSchedule((prev) => ({
      ...prev,
      break_times: {
        ...prev.break_times,
        [dayKey]: (prev.break_times[dayKey] || []).map((breakItem, index) => (
          index === breakIndex ? { ...breakItem, [field]: value } : breakItem
        )),
      },
    }))
  }

  const removeBreakTime = (dayKey, breakIndex) => {
    updateSchedule((prev) => ({
      ...prev,
      break_times: {
        ...prev.break_times,
        [dayKey]: (prev.break_times[dayKey] || []).filter((_, index) => index !== breakIndex),
      },
    }))
  }

  const toggleConsultationMode = (mode) => {
    updateSchedule((prev) => ({
      ...prev,
      consultation_modes: prev.consultation_modes.includes(mode)
        ? prev.consultation_modes.filter((item) => item !== mode)
        : [...prev.consultation_modes, mode],
    }))
  }

  const onSave = async () => {
    const result = validateDoctorSchedule(schedule)
    if (!result.valid) {
      const firstProblem = result.problems[0] || 'Check the entered availability settings'
      setError(firstProblem)
      toast.error(firstProblem)
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        ...result.normalized,
        working_days: [...result.normalized.working_days],
        working_hours: result.normalized.working_hours,
        break_times: result.normalized.break_times,
        consultation_modes: result.normalized.consultation_modes,
      }

      const response = await saveDoctorAvailability(payload)
      const savedSchedule = response.schedule || response.availability_schedule || payload
      setSchedule(normalizeDoctorSchedule(savedSchedule))
      toast.success('Availability schedule saved')
      onSaved?.(savedSchedule)
    } catch (saveError) {
      const message = saveError.message || 'Unable to save availability schedule'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-[640px]" />
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-textPrimary">Manage Availability Schedule</h2>
          <p className="mt-1 text-sm text-textSecondary">
            Set the days, hours, breaks, and consultation modes patients can book.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <DayChip label={`${activeDays.length} working days`} active />
          <DayChip label={`${schedule.consultation_modes.length} modes`} active={schedule.consultation_modes.length > 0} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="space-y-4 border border-rose-100 bg-white/80">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-textPrimary">Working Days</h3>
              <p className="text-xs text-textSecondary">Select the days you see patients.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DAY_KEYS.map((dayKey) => {
                const enabled = schedule.working_days.includes(dayKey)
                return (
                  <label
                    key={dayKey}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition ${enabled ? 'border-primary bg-rose-50' : 'border-rose-200 bg-white'}`}
                  >
                    <div>
                      <p className="font-semibold text-textPrimary">{DAY_LABELS[dayKey]}</p>
                      <p className="text-xs text-textSecondary">{enabled ? 'Active' : 'Closed'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleWorkingDay(dayKey)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                )
              })}
            </div>
          </Card>

          <Card className="space-y-4 border border-rose-100 bg-white/80">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-textPrimary">Working Hours and Breaks</h3>
              <p className="text-xs text-textSecondary">Breaks are removed from patient time slots.</p>
            </div>

            <div className="space-y-4">
              {DAY_KEYS.filter((dayKey) => schedule.working_days.includes(dayKey)).map((dayKey) => {
                const hours = schedule.working_hours[dayKey] || { start: '09:00', end: '17:00' }
                const breaks = schedule.break_times[dayKey] || []

                return (
                  <div key={dayKey} className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-textPrimary">{DAY_LABELS[dayKey]}</h4>
                        <p className="text-xs text-textSecondary">Time blocks available for consultations.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addBreakTime(dayKey)}
                          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                        >
                          Add Break
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm text-textSecondary">
                        <span>Start Time</span>
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(event) => updateWorkingHours(dayKey, 'start', event.target.value)}
                          className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-textSecondary">
                        <span>End Time</span>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(event) => updateWorkingHours(dayKey, 'end', event.target.value)}
                          className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-sm font-semibold text-textPrimary">Break Times</h5>
                        <span className="text-xs text-textSecondary">{breaks.length} configured</span>
                      </div>

                      {breaks.length === 0 && (
                        <p className="text-sm text-textSecondary">No breaks set for this day.</p>
                      )}

                      {breaks.map((breakItem, index) => (
                        <div key={`${dayKey}-break-${index}`} className="grid gap-2 rounded-xl border border-rose-200 bg-white p-3 md:grid-cols-[1fr_1fr_auto]">
                          <label className="space-y-1 text-xs text-textSecondary">
                            <span>Break Start</span>
                            <input
                              type="time"
                              value={breakItem.start}
                              onChange={(event) => updateBreakTime(dayKey, index, 'start', event.target.value)}
                              className="w-full rounded-xl border border-rose-200 px-3 py-2 focus:border-primary focus:outline-none"
                            />
                          </label>
                          <label className="space-y-1 text-xs text-textSecondary">
                            <span>Break End</span>
                            <input
                              type="time"
                              value={breakItem.end}
                              onChange={(event) => updateBreakTime(dayKey, index, 'end', event.target.value)}
                              className="w-full rounded-xl border border-rose-200 px-3 py-2 focus:border-primary focus:outline-none"
                            />
                          </label>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeBreakTime(dayKey, index)}
                              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4 border border-rose-100 bg-white/80">
            <h3 className="font-semibold text-textPrimary">Consultation Modes</h3>
            <p className="text-sm text-textSecondary">Choose how patients can book appointments with you.</p>

            <div className="space-y-2">
              {CONSULTATION_MODE_OPTIONS.map((option) => {
                const checked = schedule.consultation_modes.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 ${checked ? 'border-primary bg-rose-50' : 'border-rose-200 bg-white'}`}
                  >
                    <div>
                      <p className="font-semibold text-textPrimary">{option.label}</p>
                      <p className="text-xs text-textSecondary">Visible on the booking page.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleConsultationMode(option.value)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                )
              })}
            </div>
          </Card>

          <Card className="space-y-3 border border-rose-100 bg-white/80">
            <h3 className="font-semibold text-textPrimary">Preview</h3>
            <p className="text-sm text-textSecondary">
              Patients will only see time slots on your selected days, outside your configured breaks.
            </p>

            <div className="flex flex-wrap gap-2">
              {schedule.working_days.map((dayKey) => (
                <DayChip key={dayKey} label={DAY_LABELS[dayKey]} active />
              ))}
            </div>

            <div className="rounded-xl bg-rose-50 p-3 text-sm text-textSecondary">
              <p>
                <span className="font-semibold text-textPrimary">Mode(s):</span>{' '}
                {schedule.consultation_modes.length > 0 ? schedule.consultation_modes.join(', ') : 'None selected'}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-textPrimary">Slot interval:</span> {schedule.slot_interval_minutes} minutes
              </p>
            </div>

            <Button className="w-full" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Availability'}
            </Button>
          </Card>
        </div>
      </div>
    </Card>
  )
}
