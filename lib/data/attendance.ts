import { createClient } from '@/lib/supabase/server'
import type { Subject } from './subjects'

export type AttendanceStatus = 'present' | 'absent' | 'cancelled'

export interface AttendanceRecord {
  id: string
  user_id: string
  semester_id: string
  subject_id: string
  timetable_slot_id: string | null
  class_date: string // YYYY-MM-DD
  start_time: string // HH:mm:ss or HH:mm
  end_time: string // HH:mm:ss or HH:mm
  status: AttendanceStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type AttendanceRecordWithSubject = AttendanceRecord & {
  subject: Subject
}

export interface MarkAttendanceInput {
  userId: string
  semesterId: string
  subjectId: string
  timetableSlotId?: string | null
  classDate: string
  startTime: string
  endTime: string
  status: AttendanceStatus
  notes?: string | null
}

export interface UpdateAttendanceRecordInput {
  status?: AttendanceStatus
  notes?: string | null
}

export interface GetAttendanceOptions {
  subjectId?: string
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
}

/**
 * Fetch attendance records for a user and semester with optional filters.
 */
export async function getAttendanceRecords(
  semesterId: string,
  userId: string,
  options?: GetAttendanceOptions
): Promise<AttendanceRecord[]> {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)

  if (options?.subjectId) {
    query = query.eq('subject_id', options.subjectId)
  }
  if (options?.startDate) {
    query = query.gte('class_date', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('class_date', options.endDate)
  }
  if (options?.status) {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query
    .order('class_date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching attendance records:', error)
    throw new Error('Failed to fetch attendance records')
  }

  return (data || []) as AttendanceRecord[]
}

/**
 * Fetch attendance records with subject details.
 */
export async function getAttendanceRecordsWithSubject(
  semesterId: string,
  userId: string,
  options?: GetAttendanceOptions
): Promise<AttendanceRecordWithSubject[]> {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_records')
    .select('*, subject:subjects(*)')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)

  if (options?.subjectId) {
    query = query.eq('subject_id', options.subjectId)
  }
  if (options?.startDate) {
    query = query.gte('class_date', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('class_date', options.endDate)
  }

  const { data, error } = await query
    .order('class_date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching attendance records with subjects:', error)
    throw new Error('Failed to fetch attendance records with subjects')
  }

  return (data || []) as AttendanceRecordWithSubject[]
}

/**
 * Fetch an attendance record for a specific slot/subject on a given date.
 */
export async function getAttendanceRecordForSlot(
  semesterId: string,
  userId: string,
  classDate: string,
  timetableSlotId?: string | null,
  subjectId?: string,
  startTime?: string
): Promise<AttendanceRecord | null> {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)
    .eq('class_date', classDate)

  if (timetableSlotId) {
    query = query.eq('timetable_slot_id', timetableSlotId)
  } else if (subjectId && startTime) {
    query = query.eq('subject_id', subjectId).eq('start_time', startTime)
  } else {
    return null
  }

  const { data, error } = await query.maybeSingle()
  if (error) {
    console.error('Error fetching attendance record for slot:', error)
    return null
  }

  return data as AttendanceRecord | null
}

/**
 * Mark or update attendance.
 * If a record already exists for the slot on that date, it updates the existing record.
 * Otherwise, it creates a new record.
 */
export async function markAttendance(input: MarkAttendanceInput): Promise<AttendanceRecord> {
  const supabase = await createClient()

  // Check if an existing record exists for this slot on this date
  const existing = await getAttendanceRecordForSlot(
    input.semesterId,
    input.userId,
    input.classDate,
    input.timetableSlotId,
    input.subjectId,
    input.startTime
  )

  if (existing) {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        status: input.status,
        notes: input.notes !== undefined ? (input.notes?.trim() || null) : existing.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .eq('user_id', input.userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating attendance record:', error)
      throw new Error('Failed to update attendance record')
    }

    return data as AttendanceRecord
  }

  // Create new record
  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      user_id: input.userId,
      semester_id: input.semesterId,
      subject_id: input.subjectId,
      timetable_slot_id: input.timetableSlotId || null,
      class_date: input.classDate,
      start_time: input.startTime,
      end_time: input.endTime,
      status: input.status,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting attendance record:', error)
    throw new Error('Failed to mark attendance')
  }

  return data as AttendanceRecord
}

/**
 * Update an existing attendance record by ID.
 */
export async function updateAttendanceRecord(
  id: string,
  userId: string,
  updates: UpdateAttendanceRecordInput
): Promise<AttendanceRecord> {
  const supabase = await createClient()
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.status !== undefined) payload.status = updates.status
  if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null

  const { data, error } = await supabase
    .from('attendance_records')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating attendance record ${id}:`, error)
    throw new Error('Failed to update attendance record')
  }

  return data as AttendanceRecord
}

/**
 * Delete an attendance record.
 */
export async function deleteAttendanceRecord(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting attendance record ${id}:`, error)
    throw new Error('Failed to delete attendance record')
  }
}

/**
 * Fetch default attendance target from user_settings.
 * Returns 75.0 if not found.
 */
export async function getDefaultAttendanceTarget(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_settings')
    .select('default_attendance_target')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data || data.default_attendance_target == null) {
    return 75.0
  }

  return Number(data.default_attendance_target)
}
