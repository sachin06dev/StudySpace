import type { Semester } from '@/lib/data/semesters'
import type { Subject, ClassType } from '@/lib/data/subjects'
import type { TimetableSlot, TimetableException } from '@/lib/data/timetable'
import type { AttendanceRecord, AttendanceStatus } from '@/lib/data/attendance'

export interface ResolvedClass {
  id: string // Unique identifier for keying in UI
  slotId: string | null
  subjectId: string
  subjectName: string
  subjectCode: string | null
  faculty: string | null
  room: string | null
  classType: ClassType
  startTime: string // HH:mm:ss or HH:mm
  endTime: string // HH:mm:ss or HH:mm
  isExtra: boolean
  isRescheduled: boolean
  isCancelled: boolean
  cancellationReason?: string | null
  attendanceStatus: AttendanceStatus | null
  attendanceRecordId: string | null
}

/**
 * Parses YYYY-MM-DD to ISO 8601 day of week:
 * 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
 */
export function getIsoDayOfWeek(dateString: string): number {
  const [yStr, mStr, dStr] = dateString.split('-')
  const y = parseInt(yStr, 10)
  const m = parseInt(mStr, 10)
  const d = parseInt(dStr, 10)

  const date = new Date(Date.UTC(y, m - 1, d))
  const jsDay = date.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  return (jsDay + 6) % 7 // 0 = Mon, ..., 6 = Sun
}

/**
 * Normalizes time string to HH:mm format for clean comparison and display.
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, '0')
    const minutes = parts[1].padStart(2, '0')
    return `${hours}:${minutes}`
  }
  return timeStr
}

/**
 * Resolves all classes for a specific date given the semester, recurring slots,
 * exceptions, and existing attendance records.
 */
export function resolveClassesForDate(params: {
  date: string // YYYY-MM-DD
  semester: Semester | null
  slots: TimetableSlot[]
  subjects: Subject[]
  exceptions: TimetableException[]
  records: AttendanceRecord[]
}): ResolvedClass[] {
  const { date, semester, slots, subjects, exceptions, records } = params

  if (!semester) return []

  // If the target date falls outside the semester bounds, no classes occur
  if (date < semester.start_date || date > semester.end_date) {
    return []
  }

  const subjectMap = new Map<string, Subject>()
  for (const sub of subjects) {
    subjectMap.set(sub.id, sub)
  }

  const isoDay = getIsoDayOfWeek(date)
  const resolvedClasses: ResolvedClass[] = []

  // Partition exceptions relevant to today
  const cancelledSlotIds = new Set<string>()
  const rescheduledAwaySlotIds = new Set<string>()
  const rescheduledToToday: TimetableException[] = []
  const extraClassesToday: TimetableException[] = []

  for (const ex of exceptions) {
    if (ex.exception_type === 'cancelled' && ex.exception_date === date && ex.timetable_slot_id) {
      cancelledSlotIds.add(ex.timetable_slot_id)
    } else if (
      ex.exception_type === 'rescheduled' &&
      ex.exception_date === date &&
      ex.timetable_slot_id
    ) {
      rescheduledAwaySlotIds.add(ex.timetable_slot_id)
    } else if (ex.exception_type === 'rescheduled' && ex.replacement_date === date) {
      rescheduledToToday.push(ex)
    } else if (ex.exception_type === 'extra' && ex.exception_date === date) {
      extraClassesToday.push(ex)
    }
  }

  // 1. Process recurring weekly slots for this day of week
  const todaySlots = slots.filter((slot) => slot.day_of_week === isoDay)

  for (const slot of todaySlots) {
    // If rescheduled away from today, it does not happen today
    if (rescheduledAwaySlotIds.has(slot.id)) {
      continue
    }

    const isCancelled = cancelledSlotIds.has(slot.id)
    const subject = subjectMap.get(slot.subject_id)
    const subjectName = subject ? subject.name : 'Unknown Subject'
    const subjectCode = subject ? subject.code : null
    const faculty = slot.faculty_override || (subject ? subject.faculty : null)
    const room = slot.room_override || (subject ? subject.default_room : null)
    const classType = slot.class_type_override || (subject ? subject.class_type : 'theory')

    // Find attendance record for this slot
    const record = records.find(
      (r) =>
        r.timetable_slot_id === slot.id ||
        (r.subject_id === slot.subject_id && formatTimeDisplay(r.start_time) === formatTimeDisplay(slot.start_time))
    )

    resolvedClasses.push({
      id: `slot_${slot.id}`,
      slotId: slot.id,
      subjectId: slot.subject_id,
      subjectName,
      subjectCode,
      faculty,
      room,
      classType,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isExtra: false,
      isRescheduled: false,
      isCancelled,
      attendanceStatus: record ? record.status : isCancelled ? 'cancelled' : null,
      attendanceRecordId: record ? record.id : null,
    })
  }

  // 2. Process classes rescheduled TO today
  for (const ex of rescheduledToToday) {
    const originatingSlot = slots.find((s) => s.id === ex.timetable_slot_id)
    const subjectId = ex.subject_id || (originatingSlot ? originatingSlot.subject_id : '')
    const subject = subjectMap.get(subjectId)
    const subjectName = subject ? subject.name : 'Rescheduled Class'
    const subjectCode = subject ? subject.code : null
    const faculty = ex.faculty || (originatingSlot?.faculty_override) || (subject ? subject.faculty : null)
    const room = ex.room || (originatingSlot?.room_override) || (subject ? subject.default_room : null)
    const classType = (originatingSlot?.class_type_override) || (subject ? subject.class_type : 'theory')
    const startTime = ex.replacement_start_time || '00:00'
    const endTime = ex.replacement_end_time || '00:00'

    const record = records.find(
      (r) =>
        (ex.timetable_slot_id && r.timetable_slot_id === ex.timetable_slot_id) ||
        (r.subject_id === subjectId && formatTimeDisplay(r.start_time) === formatTimeDisplay(startTime))
    )

    resolvedClasses.push({
      id: `rescheduled_${ex.id}`,
      slotId: ex.timetable_slot_id,
      subjectId,
      subjectName,
      subjectCode,
      faculty,
      room,
      classType,
      startTime,
      endTime,
      isExtra: false,
      isRescheduled: true,
      isCancelled: false,
      attendanceStatus: record ? record.status : null,
      attendanceRecordId: record ? record.id : null,
    })
  }

  // 3. Process extra classes on today
  for (const ex of extraClassesToday) {
    const subjectId = ex.subject_id || ''
    const subject = subjectMap.get(subjectId)
    const subjectName = subject ? subject.name : 'Extra Class'
    const subjectCode = subject ? subject.code : null
    const faculty = ex.faculty || (subject ? subject.faculty : null)
    const room = ex.room || (subject ? subject.default_room : null)
    const classType = subject ? subject.class_type : 'theory'
    const startTime = ex.start_time || '00:00'
    const endTime = ex.end_time || '00:00'

    const isCancelled = Boolean(ex.notes && ex.notes.includes('[CANCELLED'))
    const match = ex.notes ? ex.notes.match(/\[CANCELLED:\s*([^\]]+)\]/) : null
    const cancellationReason = match ? match[1] : (isCancelled ? 'Class cancelled' : null)

    const record = records.find(
      (r) =>
        r.subject_id === subjectId &&
        formatTimeDisplay(r.start_time) === formatTimeDisplay(startTime)
    )

    resolvedClasses.push({
      id: `extra_${ex.id}`,
      slotId: null,
      subjectId,
      subjectName,
      subjectCode,
      faculty,
      room,
      classType,
      startTime,
      endTime,
      isExtra: true,
      isRescheduled: false,
      isCancelled,
      cancellationReason,
      attendanceStatus: isCancelled ? 'cancelled' : (record ? record.status : null),
      attendanceRecordId: record ? record.id : null,
    })
  }

  // Sort chronologically by start_time
  resolvedClasses.sort((a, b) => a.startTime.localeCompare(b.startTime))

  return resolvedClasses
}
