/**
 * SilverBook Import Compatibility Layer
 *
 * This module defines types and pure mapper functions ensuring StudySpace's
 * data model is ready to parse, preview, and map data exported from SilverBook
 * into StudySpace semesters, subjects, timetable slots, and attendance baselines/records.
 */

import type { ClassType } from '@/lib/data/subjects'
import type { AttendanceStatus } from '@/lib/data/attendance'

export interface SilverBookSubject {
  name: string
  code?: string
  faculty?: string
  room?: string
  type?: 'theory' | 'lab' | 'tutorial' | 'practical' | string
  attendedClasses?: number
  totalClasses?: number
  targetPercentage?: number
}

export interface SilverBookTimeSlot {
  dayOfWeek: number // 0-6 or 1-7 depending on SilverBook export version
  startTime: string // "09:30" or "09:30:00"
  endTime: string // "10:30" or "10:30:00"
  subjectName: string
  room?: string
  faculty?: string
}

export interface SilverBookAttendanceEntry {
  subjectName: string
  date: string // YYYY-MM-DD
  status: 'present' | 'absent' | 'cancelled' | 'holiday' | string
  notes?: string
}

export interface SilverBookExportData {
  semesterName?: string
  startDate?: string
  endDate?: string
  subjects: SilverBookSubject[]
  timetable?: SilverBookTimeSlot[]
  history?: SilverBookAttendanceEntry[]
}

export interface MappedStudySpacePayload {
  semester: {
    name: string
    startDate: string
    endDate: string
  }
  subjects: Array<{
    name: string
    code: string | null
    faculty: string | null
    defaultRoom: string | null
    classType: ClassType
    targetPercentage: number | null
    baselineAttended: number
    baselineTotal: number
  }>
  timetableSlots: Array<{
    subjectName: string
    dayOfWeek: number // Normalized to 0 (Mon) .. 6 (Sun)
    startTime: string
    endTime: string
    roomOverride: string | null
    facultyOverride: string | null
  }>
  attendanceRecords: Array<{
    subjectName: string
    date: string
    status: AttendanceStatus
    notes: string | null
  }>
}

/**
 * Normalizes class type from SilverBook into StudySpace supported types:
 * 'theory' | 'lab' | 'tutorial' | 'other'
 */
export function normalizeClassType(rawType?: string): ClassType {
  if (!rawType) return 'theory'
  const lower = rawType.toLowerCase().trim()
  if (lower.includes('lab') || lower.includes('practical')) return 'lab'
  if (lower.includes('tut')) return 'tutorial'
  if (lower.includes('theory') || lower.includes('lecture')) return 'theory'
  return 'other'
}

/**
 * Normalizes day of week to ISO 8601 (0 = Monday ... 6 = Sunday).
 */
export function normalizeDayOfWeek(rawDay: number, sourceConvention: 'iso' | 'sunday_zero' = 'iso'): number {
  if (sourceConvention === 'sunday_zero') {
    // 0 = Sunday -> 6, 1 = Monday -> 0, ...
    return (rawDay + 6) % 7
  }
  // If already 0=Mon..6=Sun
  return Math.min(Math.max(rawDay, 0), 6)
}

/**
 * Maps raw SilverBook export data into StudySpace's internal domain structure.
 */
export function mapSilverBookToStudySpace(
  data: SilverBookExportData,
  defaults: {
    semesterName?: string
    startDate: string
    endDate: string
    dayConvention?: 'iso' | 'sunday_zero'
  }
): MappedStudySpacePayload {
  const semesterName = data.semesterName?.trim() || defaults.semesterName || 'Imported Semester'
  const startDate = data.startDate || defaults.startDate
  const endDate = data.endDate || defaults.endDate
  const dayConvention = defaults.dayConvention || 'iso'

  const subjects = data.subjects.map((s) => ({
    name: s.name.trim(),
    code: s.code?.trim() || null,
    faculty: s.faculty?.trim() || null,
    defaultRoom: s.room?.trim() || null,
    classType: normalizeClassType(s.type),
    targetPercentage:
      s.targetPercentage != null && s.targetPercentage >= 0 && s.targetPercentage <= 100
        ? s.targetPercentage
        : null,
    baselineAttended: Math.max(0, s.attendedClasses || 0),
    baselineTotal: Math.max(0, s.totalClasses || 0),
  }))

  const timetableSlots = (data.timetable || []).map((slot) => ({
    subjectName: slot.subjectName.trim(),
    dayOfWeek: normalizeDayOfWeek(slot.dayOfWeek, dayConvention),
    startTime: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
    endTime: slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime,
    roomOverride: slot.room?.trim() || null,
    facultyOverride: slot.faculty?.trim() || null,
  }))

  const attendanceRecords = (data.history || [])
    .filter((entry) => ['present', 'absent', 'cancelled'].includes(entry.status.toLowerCase()))
    .map((entry) => ({
      subjectName: entry.subjectName.trim(),
      date: entry.date,
      status: entry.status.toLowerCase() as AttendanceStatus,
      notes: entry.notes?.trim() || null,
    }))

  return {
    semester: {
      name: semesterName,
      startDate,
      endDate,
    },
    subjects,
    timetableSlots,
    attendanceRecords,
  }
}
