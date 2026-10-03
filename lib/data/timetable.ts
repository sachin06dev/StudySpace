import { createClient } from '@/lib/supabase/server'
import type { ClassType, Subject } from './subjects'

export interface TimetableSlot {
  id: string
  user_id: string
  semester_id: string
  subject_id: string
  day_of_week: number // 0 = Monday, ..., 6 = Sunday
  start_time: string // HH:mm:ss or HH:mm
  end_time: string // HH:mm:ss or HH:mm
  room_override: string | null
  faculty_override: string | null
  class_type_override: ClassType | null
  created_at: string
  updated_at: string
}

export type TimetableSlotWithSubject = TimetableSlot & {
  subject: Subject
}

export type ExceptionType = 'cancelled' | 'extra' | 'rescheduled'

export interface TimetableException {
  id: string
  user_id: string
  semester_id: string
  timetable_slot_id: string | null
  exception_date: string // YYYY-MM-DD
  exception_type: ExceptionType
  start_time: string | null
  end_time: string | null
  replacement_date: string | null
  replacement_start_time: string | null
  replacement_end_time: string | null
  subject_id: string | null
  room: string | null
  faculty: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateTimetableSlotInput {
  userId: string
  semesterId: string
  subjectId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomOverride?: string | null
  facultyOverride?: string | null
  classTypeOverride?: ClassType | null
}

export interface UpdateTimetableSlotInput {
  subjectId?: string
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  roomOverride?: string | null
  facultyOverride?: string | null
  classTypeOverride?: ClassType | null
}

export interface CreateTimetableExceptionInput {
  userId: string
  semesterId: string
  timetableSlotId?: string | null
  exceptionDate: string
  exceptionType: ExceptionType
  startTime?: string | null
  endTime?: string | null
  replacementDate?: string | null
  replacementStartTime?: string | null
  replacementEndTime?: string | null
  subjectId?: string | null
  room?: string | null
  faculty?: string | null
  notes?: string | null
}

/**
 * Fetch all timetable slots for a semester.
 */
export async function getTimetableSlots(
  semesterId: string,
  userId: string
): Promise<TimetableSlot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable_slots')
    .select('*')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching timetable slots:', error)
    throw new Error('Failed to fetch timetable slots')
  }

  return (data || []) as TimetableSlot[]
}

/**
 * Fetch timetable slots joined with their subject.
 */
export async function getTimetableSlotsWithSubjects(
  semesterId: string,
  userId: string
): Promise<TimetableSlotWithSubject[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable_slots')
    .select('*, subject:subjects(*)')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching timetable slots with subjects:', error)
    throw new Error('Failed to fetch timetable slots with subjects')
  }

  return (data || []) as TimetableSlotWithSubject[]
}

/**
 * Fetch a single timetable slot by ID.
 */
export async function getTimetableSlot(
  id: string,
  userId: string
): Promise<TimetableSlot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable_slots')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching timetable slot ${id}:`, error)
    throw new Error('Failed to fetch timetable slot')
  }

  return data as TimetableSlot | null
}

/**
 * Create a recurring timetable slot.
 */
export async function createTimetableSlot(
  input: CreateTimetableSlotInput
): Promise<TimetableSlot> {
  if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
    throw new Error('Day of week must be between 0 (Monday) and 6 (Sunday)')
  }
  if (input.endTime <= input.startTime) {
    throw new Error('End time must be after start time')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable_slots')
    .insert({
      user_id: input.userId,
      semester_id: input.semesterId,
      subject_id: input.subjectId,
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      room_override: input.roomOverride?.trim() || null,
      faculty_override: input.facultyOverride?.trim() || null,
      class_type_override: input.classTypeOverride || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating timetable slot:', error)
    throw new Error('Failed to create timetable slot')
  }

  return data as TimetableSlot
}

/**
 * Update a timetable slot.
 */
export async function updateTimetableSlot(
  id: string,
  userId: string,
  updates: UpdateTimetableSlotInput
): Promise<TimetableSlot> {
  const supabase = await createClient()

  if (
    updates.startTime !== undefined &&
    updates.endTime !== undefined &&
    updates.endTime <= updates.startTime
  ) {
    throw new Error('End time must be after start time')
  }

  if (updates.dayOfWeek !== undefined && (updates.dayOfWeek < 0 || updates.dayOfWeek > 6)) {
    throw new Error('Day of week must be between 0 and 6')
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId
  if (updates.dayOfWeek !== undefined) payload.day_of_week = updates.dayOfWeek
  if (updates.startTime !== undefined) payload.start_time = updates.startTime
  if (updates.endTime !== undefined) payload.end_time = updates.endTime
  if (updates.roomOverride !== undefined) payload.room_override = updates.roomOverride?.trim() || null
  if (updates.facultyOverride !== undefined) payload.faculty_override = updates.facultyOverride?.trim() || null
  if (updates.classTypeOverride !== undefined) payload.class_type_override = updates.classTypeOverride || null

  const { data, error } = await supabase
    .from('timetable_slots')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating timetable slot ${id}:`, error)
    throw new Error('Failed to update timetable slot')
  }

  return data as TimetableSlot
}

/**
 * Delete a timetable slot.
 */
export async function deleteTimetableSlot(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('timetable_slots')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting timetable slot ${id}:`, error)
    throw new Error('Failed to delete timetable slot')
  }
}

/**
 * Fetch exceptions for a semester within an optional date range.
 */
export async function getTimetableExceptions(
  semesterId: string,
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<TimetableException[]> {
  const supabase = await createClient()
  let query = supabase
    .from('timetable_exceptions')
    .select('*')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)

  if (startDate) {
    query = query.gte('exception_date', startDate)
  }
  if (endDate) {
    query = query.lte('exception_date', endDate)
  }

  const { data, error } = await query.order('exception_date', { ascending: true })

  if (error) {
    console.error('Error fetching timetable exceptions:', error)
    throw new Error('Failed to fetch timetable exceptions')
  }

  return (data || []) as TimetableException[]
}

/**
 * Create a timetable exception (cancelled, extra, or rescheduled).
 */
export async function createTimetableException(
  input: CreateTimetableExceptionInput
): Promise<TimetableException> {
  const supabase = await createClient()

  // Validate semantic constraints according to exception type
  if (input.exceptionType === 'cancelled') {
    if (!input.timetableSlotId) {
      throw new Error('Cancelled exception requires a timetable_slot_id')
    }
  } else if (input.exceptionType === 'extra') {
    if (!input.subjectId) {
      throw new Error('Extra class requires a subject_id')
    }
    if (!input.startTime || !input.endTime) {
      throw new Error('Extra class requires start_time and end_time')
    }
    if (input.endTime <= input.startTime) {
      throw new Error('Extra class end_time must be after start_time')
    }
  } else if (input.exceptionType === 'rescheduled') {
    if (!input.timetableSlotId) {
      throw new Error('Rescheduled exception requires a timetable_slot_id')
    }
    if (!input.replacementDate || !input.replacementStartTime || !input.replacementEndTime) {
      throw new Error(
        'Rescheduled exception requires replacement_date, replacement_start_time, and replacement_end_time'
      )
    }
    if (input.replacementEndTime <= input.replacementStartTime) {
      throw new Error('Replacement end_time must be after replacement_start_time')
    }
  }

  const { data, error } = await supabase
    .from('timetable_exceptions')
    .insert({
      user_id: input.userId,
      semester_id: input.semesterId,
      timetable_slot_id: input.timetableSlotId || null,
      exception_date: input.exceptionDate,
      exception_type: input.exceptionType,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      replacement_date: input.replacementDate || null,
      replacement_start_time: input.replacementStartTime || null,
      replacement_end_time: input.replacementEndTime || null,
      subject_id: input.subjectId || null,
      room: input.room?.trim() || null,
      faculty: input.faculty?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating timetable exception:', error)
    throw new Error('Failed to create timetable exception')
  }

  return data as TimetableException
}

/**
 * Delete a timetable exception.
 */
export async function deleteTimetableException(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('timetable_exceptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting timetable exception ${id}:`, error)
    throw new Error('Failed to delete timetable exception')
  }
}

/**
 * Update an existing timetable exception.
 */
export async function updateTimetableException(
  id: string,
  userId: string,
  updates: {
    room?: string | null
    faculty?: string | null
    notes?: string | null
    startTime?: string | null
    endTime?: string | null
  }
): Promise<TimetableException> {
  const supabase = await createClient()

  const payload: Record<string, unknown> = {}
  if (updates.room !== undefined) payload.room = updates.room?.trim() || null
  if (updates.faculty !== undefined) payload.faculty = updates.faculty?.trim() || null
  if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null
  if (updates.startTime !== undefined) payload.start_time = updates.startTime || null
  if (updates.endTime !== undefined) payload.end_time = updates.endTime || null

  const { data, error } = await supabase
    .from('timetable_exceptions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating timetable exception ${id}:`, error)
    throw new Error('Failed to update timetable exception')
  }

  return data as TimetableException
}

