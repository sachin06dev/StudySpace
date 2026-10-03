'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  markAttendance,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/lib/data/attendance'
import { getSubject } from '@/lib/data/subjects'
import { getSemester } from '@/lib/data/semesters'
import { getTimetableSlot } from '@/lib/data/timetable'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function markAttendanceAction(input: {
  semesterId: string
  subjectId: string
  timetableSlotId?: string | null
  classDate: string
  startTime: string
  endTime: string
  status: AttendanceStatus
  notes?: string | null
}): Promise<ActionResult<AttendanceRecord>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // 1. Verify semester belongs to current user
    const semester = await getSemester(input.semesterId, user.id)
    if (!semester) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    // 2. Verify class_date falls within semester bounds
    if (input.classDate < semester.start_date || input.classDate > semester.end_date) {
      return {
        success: false,
        error: `Class date (${input.classDate}) falls outside the semester bounds (${semester.start_date} to ${semester.end_date}).`,
      }
    }

    // 3. Verify subject belongs to user and semester
    const subject = await getSubject(input.subjectId, user.id)
    if (!subject || subject.semester_id !== input.semesterId) {
      return { success: false, error: 'Subject does not belong to this semester.' }
    }

    // 4. Verify timetable_slot_id if provided
    if (input.timetableSlotId) {
      const slot = await getTimetableSlot(input.timetableSlotId, user.id)
      if (!slot || slot.semester_id !== input.semesterId) {
        return { success: false, error: 'Timetable slot does not belong to this semester.' }
      }
    }

    if (!input.startTime || !input.endTime) {
      return { success: false, error: 'Start and end times are required.' }
    }

    const record = await markAttendance({
      userId: user.id,
      semesterId: input.semesterId,
      subjectId: input.subjectId,
      timetableSlotId: input.timetableSlotId,
      classDate: input.classDate,
      startTime: input.startTime,
      endTime: input.endTime,
      status: input.status,
      notes: input.notes,
    })

    revalidatePath('/attendance')
    revalidatePath(`/attendance/${input.subjectId}`)
    revalidatePath('/timetable')
    revalidatePath('/dashboard')
    return { success: true, data: record }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateAttendanceRecordAction(
  id: string,
  subjectId: string,
  updates: {
    status?: AttendanceStatus
    notes?: string | null
  }
): Promise<ActionResult<AttendanceRecord>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const record = await updateAttendanceRecord(id, user.id, updates)

    revalidatePath('/attendance')
    revalidatePath(`/attendance/${subjectId}`)
    revalidatePath('/timetable')
    revalidatePath('/dashboard')
    return { success: true, data: record }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function deleteAttendanceRecordAction(
  id: string,
  subjectId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    await deleteAttendanceRecord(id, user.id)

    revalidatePath('/attendance')
    revalidatePath(`/attendance/${subjectId}`)
    revalidatePath('/timetable')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
