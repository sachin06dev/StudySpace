/**
 * Centralized Date & Timezone Utilities for StudySpace
 * Ensures consistent timezone-aware calendar day grouping,
 * week alignment, and date formatting across all features.
 */

export interface ZonedDateParts {
  year: number
  month: number // 1 to 12
  day: number // 1 to 31
  weekday: string // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  weekdayFull: string // 'Monday', 'Tuesday', ...
  dayOfWeek: number // 0 = Sun, 1 = Mon, ..., 6 = Sat (Standard JS convention)
  hour: number // 0 to 23
  minute: number // 0 to 59
  second: number // 0 to 59
}

export interface TimezoneDateRange {
  todayStartUtc: string
  todayEndUtc: string
  weekStartUtc: string
  weekEndUtc: string
}

const SHORT_TO_FULL_WEEKDAY: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
}

const SHORT_WEEKDAY_TO_JS_DAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/**
 * Extracts localized calendar date parts for a given Date / ISO string in a target IANA timezone.
 */
export function getZonedDateParts(
  input: Date | string | number,
  timeZone: string = 'UTC'
): ZonedDateParts {
  const date = input instanceof Date ? input : new Date(input)

  if (isNaN(date.getTime())) {
    const fallback = new Date()
    return {
      year: fallback.getUTCFullYear(),
      month: fallback.getUTCMonth() + 1,
      day: fallback.getUTCDate(),
      weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][fallback.getUTCDay()],
      weekdayFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        fallback.getUTCDay()
      ],
      dayOfWeek: fallback.getUTCDay(),
      hour: fallback.getUTCHours(),
      minute: fallback.getUTCMinutes(),
      second: fallback.getUTCSeconds(),
    }
  }

  const effectiveTz = timeZone && timeZone.trim() ? timeZone.trim() : 'UTC'

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: effectiveTz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    })

    const parts = formatter.formatToParts(date)
    const map: Record<string, string> = {}
    for (const p of parts) {
      map[p.type] = p.value
    }

    const shortWeekday = map.weekday || 'Mon'
    const jsDayOfWeek =
      SHORT_WEEKDAY_TO_JS_DAY[shortWeekday] !== undefined
        ? SHORT_WEEKDAY_TO_JS_DAY[shortWeekday]
        : 1

    return {
      year: parseInt(map.year, 10),
      month: parseInt(map.month, 10),
      day: parseInt(map.day, 10),
      weekday: shortWeekday,
      weekdayFull: SHORT_TO_FULL_WEEKDAY[shortWeekday] || shortWeekday,
      dayOfWeek: jsDayOfWeek,
      hour: parseInt(map.hour, 10) % 24,
      minute: parseInt(map.minute, 10),
      second: parseInt(map.second, 10),
    }
  } catch {
    // Fallback to UTC if timezone is invalid
    const dayOfWeek = date.getUTCDay()
    const shortDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      weekday: shortDay,
      weekdayFull: SHORT_TO_FULL_WEEKDAY[shortDay] || shortDay,
      dayOfWeek,
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
    }
  }
}

/**
 * Returns a standardized calendar date key 'YYYY-MM-DD' for a date in the given timezone.
 */
export function getLocalDayKey(
  input: Date | string | number,
  timeZone: string = 'UTC'
): string {
  const parts = getZonedDateParts(input, timeZone)
  const y = parts.year
  const m = String(parts.month).padStart(2, '0')
  const d = String(parts.day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Backward-compatible alias for getLocalDayKey.
 */
export function getZonedDateString(
  input: Date | string | number,
  timeZone: string = 'UTC'
): string {
  return getLocalDayKey(input, timeZone)
}

/**
 * Converts a localized calendar date and time (in a specific IANA timezone)
 * into the corresponding UTC Date object.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0,
  timeZone: string = 'UTC'
): Date {
  const effectiveTz = timeZone && timeZone.trim() ? timeZone.trim() : 'UTC'
  try {
    let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
    for (let i = 0; i < 3; i++) {
      const parts = getZonedDateParts(guess, effectiveTz)
      const guessLocalAsUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
      )
      const targetLocalAsUtc = Date.UTC(year, month - 1, day, hour, minute, second)
      const diff = guessLocalAsUtc - targetLocalAsUtc
      if (diff === 0) break
      guess = new Date(guess.getTime() - diff)
    }
    return guess
  } catch {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  }
}

/**
 * Computes exact UTC ISO strings for:
 * - [local today 00:00, local tomorrow 00:00)
 * - [local Monday 00:00, local next Monday 00:00)
 * based on the user's timezone.
 */
export function getZonedDateRanges(
  timeZone: string = 'UTC',
  now: Date = new Date()
): TimezoneDateRange {
  const effectiveTz = timeZone && timeZone.trim() ? timeZone.trim() : 'UTC'
  const parts = getZonedDateParts(now, effectiveTz)

  // Monday-based day offset (Mon=1, Tue=2, ..., Sun=7)
  const mondayBasedDayNum = parts.dayOfWeek === 0 ? 7 : parts.dayOfWeek
  const daysSinceMonday = mondayBasedDayNum - 1

  // Start of today in user's timezone
  const todayStartUtc = zonedTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0, effectiveTz)

  // End of today / Start of tomorrow in user's timezone
  const tomorrowCalendarDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1, 12, 0, 0))
  const todayEndUtc = zonedTimeToUtc(
    tomorrowCalendarDate.getUTCFullYear(),
    tomorrowCalendarDate.getUTCMonth() + 1,
    tomorrowCalendarDate.getUTCDate(),
    0,
    0,
    0,
    effectiveTz
  )

  // Start of this week (Monday 00:00:00)
  const mondayCalendarDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day - daysSinceMonday, 12, 0, 0)
  )
  const weekStartUtc = zonedTimeToUtc(
    mondayCalendarDate.getUTCFullYear(),
    mondayCalendarDate.getUTCMonth() + 1,
    mondayCalendarDate.getUTCDate(),
    0,
    0,
    0,
    effectiveTz
  )

  // End of this week / Start of next week (Next Monday 00:00:00)
  const nextMondayCalendarDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day - daysSinceMonday + 7, 12, 0, 0)
  )
  const weekEndUtc = zonedTimeToUtc(
    nextMondayCalendarDate.getUTCFullYear(),
    nextMondayCalendarDate.getUTCMonth() + 1,
    nextMondayCalendarDate.getUTCDate(),
    0,
    0,
    0,
    effectiveTz
  )

  return {
    todayStartUtc: todayStartUtc.toISOString(),
    todayEndUtc: todayEndUtc.toISOString(),
    weekStartUtc: weekStartUtc.toISOString(),
    weekEndUtc: weekEndUtc.toISOString(),
  }
}

/**
 * Checks whether two dates/timestamps represent the same calendar day in the given timezone.
 */
export function isSameLocalDay(
  dateA: Date | string | number,
  dateB: Date | string | number,
  timeZone: string = 'UTC'
): boolean {
  return getLocalDayKey(dateA, timeZone) === getLocalDayKey(dateB, timeZone)
}

/**
 * Converts a standard JavaScript weekday index (0=Sun, 1=Mon, ..., 6=Sat)
 * to a Monday-first index (0=Mon, 1=Tue, ..., 6=Sun).
 */
export function normalizeDayOfWeek(jsDayOfWeek: number): number {
  return jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1
}

/**
 * Formats a localized date string (e.g. "Saturday, August 22, 2026") for tooltips and headers.
 */
export function formatDateTooltip(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return dateStr
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateStr
  }
}

/**
 * Formats a date using Intl.DateTimeFormat in the target timezone.
 */
export function formatLocalDate(
  input: Date | string | number,
  timeZone: string = 'UTC',
  options?: Intl.DateTimeFormatOptions
): string {
  const date = input instanceof Date ? input : new Date(input)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timeZone || 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }

  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date)
  } catch {
    return date.toLocaleDateString('en-US')
  }
}

/**
 * Formats a timestamp into localized relative date and time labels.
 * Examples:
 * - dateLabel: "Today", "Yesterday", or "22 Aug"
 * - timeLabel: "3:45 PM"
 */
export function formatRelativeSessionDate(
  input: Date | string | number,
  timeZone: string = 'UTC'
): { dateLabel: string; timeLabel: string; fullDateStr: string } {
  const date = input instanceof Date ? input : new Date(input)
  const sessionDayKey = getLocalDayKey(date, timeZone)
  const todayDayKey = getLocalDayKey(new Date(), timeZone)

  const nowParts = getZonedDateParts(new Date(), timeZone)
  const yesterday = new Date(Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day - 1, 12, 0, 0))
  const yesterdayDayKey = getLocalDayKey(yesterday, 'UTC')

  const sessionParts = getZonedDateParts(date, timeZone)

  let dateLabel = ''
  if (sessionDayKey === todayDayKey) {
    dateLabel = 'Today'
  } else if (sessionDayKey === yesterdayDayKey) {
    dateLabel = 'Yesterday'
  } else {
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthName = monthShorts[sessionParts.month - 1] || ''
    if (sessionParts.year === nowParts.year) {
      dateLabel = `${sessionParts.day} ${monthName}`
    } else {
      dateLabel = `${sessionParts.day} ${monthName} ${sessionParts.year}`
    }
  }

  let timeLabel = ''
  try {
    timeLabel = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch {
    const h = sessionParts.hour % 12 || 12
    const m = String(sessionParts.minute).padStart(2, '0')
    const ampm = sessionParts.hour >= 12 ? 'PM' : 'AM'
    timeLabel = `${h}:${m} ${ampm}`
  }

  return {
    dateLabel,
    timeLabel,
    fullDateStr: sessionDayKey,
  }
}
