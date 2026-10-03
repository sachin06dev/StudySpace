'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  getTimetableSlot,
  createTimetableException,
  updateTimetableException,
  deleteTimetableException,
  type TimetableSlot,
  type TimetableException,
  type ExceptionType,
} from '@/lib/data/timetable'
import { getSubject } from '@/lib/data/subjects'
import { getSemester } from '@/lib/data/semesters'
import type { ClassType } from '@/lib/data/subjects'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createTimetableSlotAction(input: {
  semesterId: string
  subjectId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomOverride?: string | null
  facultyOverride?: string | null
  classTypeOverride?: ClassType | null
}): Promise<ActionResult<TimetableSlot>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Verify semester belongs to user
    const semester = await getSemester(input.semesterId, user.id)
    if (!semester) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    // Verify subject belongs to user AND to this semester
    const subject = await getSubject(input.subjectId, user.id)
    if (!subject || subject.semester_id !== input.semesterId) {
      return { success: false, error: 'Subject does not belong to the selected semester.' }
    }

    if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      return { success: false, error: 'Day of week must be between 0 (Monday) and 6 (Sunday).' }
    }

    if (!input.startTime || !input.endTime) {
      return { success: false, error: 'Start and end times are required.' }
    }

    if (input.endTime <= input.startTime) {
      return { success: false, error: 'End time must be after start time.' }
    }

    const slot = await createTimetableSlot({
      userId: user.id,
      semesterId: input.semesterId,
      subjectId: input.subjectId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      roomOverride: input.roomOverride,
      facultyOverride: input.facultyOverride,
      classTypeOverride: input.classTypeOverride,
    })

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: slot }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateTimetableSlotAction(
  id: string,
  updates: {
    subjectId?: string
    dayOfWeek?: number
    startTime?: string
    endTime?: string
    roomOverride?: string | null
    facultyOverride?: string | null
    classTypeOverride?: ClassType | null
  }
): Promise<ActionResult<TimetableSlot>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existingSlot = await getTimetableSlot(id, user.id)
    if (!existingSlot) {
      return { success: false, error: 'Timetable slot not found or access denied.' }
    }

    // If subjectId is being changed, verify it belongs to the same semester
    if (updates.subjectId) {
      const subject = await getSubject(updates.subjectId, user.id)
      if (!subject || subject.semester_id !== existingSlot.semester_id) {
        return { success: false, error: 'Subject does not belong to this semester.' }
      }
    }

    if (updates.dayOfWeek !== undefined && (updates.dayOfWeek < 0 || updates.dayOfWeek > 6)) {
      return { success: false, error: 'Day of week must be between 0 and 6.' }
    }

    const effectiveStart = updates.startTime || existingSlot.start_time
    const effectiveEnd = updates.endTime || existingSlot.end_time
    if (effectiveEnd <= effectiveStart) {
      return { success: false, error: 'End time must be after start time.' }
    }

    const slot = await updateTimetableSlot(id, user.id, updates)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: slot }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function deleteTimetableSlotAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getTimetableSlot(id, user.id)
    if (!existing) {
      return { success: false, error: 'Timetable slot not found or access denied.' }
    }

    await deleteTimetableSlot(id, user.id)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function createTimetableExceptionAction(input: {
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
}): Promise<ActionResult<TimetableException>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const semester = await getSemester(input.semesterId, user.id)
    if (!semester) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    // Verify slot ownership if provided
    if (input.timetableSlotId) {
      const slot = await getTimetableSlot(input.timetableSlotId, user.id)
      if (!slot || slot.semester_id !== input.semesterId) {
        return { success: false, error: 'Timetable slot does not belong to this semester.' }
      }
    }

    // Verify subject ownership if provided
    if (input.subjectId) {
      const subject = await getSubject(input.subjectId, user.id)
      if (!subject || subject.semester_id !== input.semesterId) {
        return { success: false, error: 'Subject does not belong to this semester.' }
      }
    }

    const exception = await createTimetableException({
      userId: user.id,
      semesterId: input.semesterId,
      timetableSlotId: input.timetableSlotId,
      exceptionDate: input.exceptionDate,
      exceptionType: input.exceptionType,
      startTime: input.startTime,
      endTime: input.endTime,
      replacementDate: input.replacementDate,
      replacementStartTime: input.replacementStartTime,
      replacementEndTime: input.replacementEndTime,
      subjectId: input.subjectId,
      room: input.room,
      faculty: input.faculty,
      notes: input.notes,
    })

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: exception }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function deleteTimetableExceptionAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Look up exception before deletion to clean up any orphaned extra-class attendance records
    const { data: ex } = await supabase
      .from('timetable_exceptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    await deleteTimetableException(id, user.id)

    if (ex && ex.exception_type === 'extra' && ex.subject_id) {
      await supabase
        .from('attendance_records')
        .delete()
        .eq('user_id', user.id)
        .eq('semester_id', ex.semester_id)
        .eq('class_date', ex.exception_date)
        .eq('subject_id', ex.subject_id)
        .is('timetable_slot_id', null)
    }

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function cancelTimetableExceptionAction(
  id: string,
  cancellationReason?: string
): Promise<ActionResult<TimetableException>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Fetch existing exception
    const { data: ex, error: fetchErr } = await supabase
      .from('timetable_exceptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchErr || !ex) {
      return { success: false, error: 'Timetable exception not found.' }
    }

    const reason = cancellationReason?.trim() || 'Class cancelled'
    const newNotes = ex.notes
      ? `${ex.notes} [CANCELLED: ${reason}]`
      : `[CANCELLED: ${reason}]`

    const updated = await updateTimetableException(id, user.id, {
      notes: newNotes,
    })

    // If an attendance record exists for this extra class on this date, update its status to cancelled
    if (ex.subject_id) {
      await supabase
        .from('attendance_records')
        .update({
          status: 'cancelled',
          notes: `[Class Cancelled: ${reason}]`,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('semester_id', ex.semester_id)
        .eq('class_date', ex.exception_date)
        .eq('subject_id', ex.subject_id)
        .is('timetable_slot_id', null)
    }

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateTimetableExceptionAction(
  id: string,
  updates: {
    room?: string | null
    faculty?: string | null
    notes?: string | null
    startTime?: string | null
    endTime?: string | null
  }
): Promise<ActionResult<TimetableException>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const updated = await updateTimetableException(id, user.id, updates)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function restoreTimetableExceptionAction(
  id: string
): Promise<ActionResult<TimetableException>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Fetch existing exception
    const { data: ex, error: fetchErr } = await supabase
      .from('timetable_exceptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchErr || !ex) {
      return { success: false, error: 'Timetable exception not found.' }
    }

    // Strip [CANCELLED: ...] from notes
    const rawNotes = ex.notes || ''
    const cleanedNotes = rawNotes.replace(/\[CANCELLED:[^\]]*\]/g, '').trim()

    const updated = await updateTimetableException(id, user.id, {
      notes: cleanedNotes.length > 0 ? cleanedNotes : null,
    })

    // If an attendance record exists for this extra class on this date that was marked cancelled, remove it so it's fresh/active
    if (ex.subject_id) {
      await supabase
        .from('attendance_records')
        .delete()
        .eq('user_id', user.id)
        .eq('semester_id', ex.semester_id)
        .eq('class_date', ex.exception_date)
        .eq('subject_id', ex.subject_id)
        .is('timetable_slot_id', null)
    }

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}


