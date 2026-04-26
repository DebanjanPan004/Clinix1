export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const CONSULTATION_MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'in-clinic', label: 'In-Clinic' },
]

export function createDefaultDoctorSchedule() {
  return {
    working_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    working_hours: {
      mon: { start: '09:00', end: '17:00' },
      tue: { start: '09:00', end: '17:00' },
      wed: { start: '09:00', end: '17:00' },
      thu: { start: '09:00', end: '17:00' },
      fri: { start: '09:00', end: '17:00' },
      sat: { start: '10:00', end: '14:00' },
      sun: null,
    },
    break_times: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    },
    consultation_modes: ['online', 'in-clinic'],
    slot_interval_minutes: 30,
  }
}

function cloneBreakTimes(source) {
  const output = {}
  for (const day of DAY_KEYS) {
    output[day] = Array.isArray(source?.[day])
      ? source[day].map((item) => ({ start: item?.start || '', end: item?.end || '' }))
      : []
  }
  return output
}

function normalizeModes(modes) {
  const fallback = ['online', 'in-clinic']
  const source = Array.isArray(modes) ? modes : fallback
  return [...new Set(source.map((mode) => String(mode).trim()).filter(Boolean))]
}

function normalizeWorkingHours(rawSchedule) {
  const workingHours = {}

  for (const day of DAY_KEYS) {
    const rawDay = rawSchedule?.working_hours?.[day] ?? rawSchedule?.[day]

    if (Array.isArray(rawDay) && rawDay.length >= 2) {
      workingHours[day] = { start: rawDay[0], end: rawDay[1] }
      continue
    }

    if (rawDay && typeof rawDay === 'object') {
      workingHours[day] = {
        start: rawDay.start || rawDay.from || '',
        end: rawDay.end || rawDay.to || '',
      }
      continue
    }

    workingHours[day] = null
  }

  return workingHours
}

export function normalizeDoctorSchedule(rawSchedule) {
  const defaultSchedule = createDefaultDoctorSchedule()

  if (!rawSchedule || typeof rawSchedule !== 'object') {
    return defaultSchedule
  }

  const workingHours = normalizeWorkingHours(rawSchedule)
  const breakTimes = cloneBreakTimes(rawSchedule.break_times || rawSchedule.breakTimes)
  const workingDays = Array.isArray(rawSchedule.working_days)
    ? rawSchedule.working_days.filter((day) => DAY_KEYS.includes(day))
    : DAY_KEYS.filter((day) => Boolean(workingHours[day]?.start && workingHours[day]?.end))

  return {
    working_days: workingDays,
    working_hours: workingHours,
    break_times: breakTimes,
    consultation_modes: normalizeModes(rawSchedule.consultation_modes),
    slot_interval_minutes: Number(rawSchedule.slot_interval_minutes || defaultSchedule.slot_interval_minutes) || 30,
  }
}

export function createScheduleFromLegacyHours(legacyHours) {
  return normalizeDoctorSchedule(legacyHours)
}

export function timeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') return null
  const [hours, minutes] = timeValue.split(':').map((part) => Number(part))
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return (hours * 60) + minutes
}

export function minutesToTime(totalMinutes) {
  const safeMinutes = ((totalMinutes % 1440) + 1440) % 1440
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, '0')
  const minutes = String(safeMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getDayKeyForDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  const orderedDayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return orderedDayKeys[date.getDay()]
}

export function generateSlotsFromSchedule(rawSchedule, selectedDate) {
  const schedule = normalizeDoctorSchedule(rawSchedule)
  const dayKey = getDayKeyForDate(selectedDate)
  if (!dayKey || !schedule.working_days.includes(dayKey)) return []

  const dayHours = schedule.working_hours[dayKey]
  if (!dayHours?.start || !dayHours?.end) return []

  const startMinutes = timeToMinutes(dayHours.start)
  const endMinutes = timeToMinutes(dayHours.end)
  const interval = schedule.slot_interval_minutes || 30

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || startMinutes >= endMinutes) {
    return []
  }

  const breaks = Array.isArray(schedule.break_times[dayKey]) ? schedule.break_times[dayKey] : []
  const slots = []

  for (let slotStart = startMinutes; slotStart + interval <= endMinutes; slotStart += interval) {
    const slotEnd = slotStart + interval
    const blocked = breaks.some((breakItem) => {
      const breakStart = timeToMinutes(breakItem?.start)
      const breakEnd = timeToMinutes(breakItem?.end)
      if (!Number.isFinite(breakStart) || !Number.isFinite(breakEnd) || breakStart >= breakEnd) return false
      return slotStart < breakEnd && slotEnd > breakStart
    })

    if (!blocked) slots.push(minutesToTime(slotStart))
  }

  return slots
}

export function validateDoctorSchedule(schedule) {
  const normalized = normalizeDoctorSchedule(schedule)
  const problems = []

  if (normalized.working_days.length === 0) {
    problems.push('Select at least one working day')
  }

  if (normalized.consultation_modes.length === 0) {
    problems.push('Select at least one consultation mode')
  }

  for (const day of normalized.working_days) {
    const hours = normalized.working_hours[day]
    if (!hours?.start || !hours?.end) {
      problems.push(`Set working hours for ${day.toUpperCase()}`)
      continue
    }

    const startMinutes = timeToMinutes(hours.start)
    const endMinutes = timeToMinutes(hours.end)
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || startMinutes >= endMinutes) {
      problems.push(`Working hours for ${day.toUpperCase()} must be valid and start before end`)
    }

    const breaks = Array.isArray(normalized.break_times[day]) ? normalized.break_times[day] : []
    const sortedBreaks = breaks
      .map((breakItem) => ({
        start: timeToMinutes(breakItem?.start),
        end: timeToMinutes(breakItem?.end),
      }))
      .filter((breakItem) => Number.isFinite(breakItem.start) && Number.isFinite(breakItem.end) && breakItem.start < breakItem.end)
      .sort((left, right) => left.start - right.start)

    sortedBreaks.forEach((breakItem, index) => {
      if (breakItem.start < startMinutes || breakItem.end > endMinutes) {
        problems.push(`Break time for ${day.toUpperCase()} must be within working hours`)
      }

      const nextBreak = sortedBreaks[index + 1]
      if (nextBreak && breakItem.end > nextBreak.start) {
        problems.push(`Break times for ${day.toUpperCase()} must not overlap`)
      }
    })
  }

  return {
    valid: problems.length === 0,
    problems,
    normalized,
  }
}
