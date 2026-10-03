'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createSubject,
  updateSubject,
  archiveSubject,
  deleteSubject,
  getSubject,
  type Subject,
  type ClassType,
} from '@/lib/data/subjects'
import { getSemester } from '@/lib/data/semesters'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createSubjectAction(input: {
  semesterId: string
  name: string
  code?: string | null
  faculty?: string | null
  defaultRoom?: string | null
  classType?: ClassType
  credits?: number | null
  targetPercentage?: number | null
  baselineAttended?: number
  baselineTotal?: number
}): Promise<ActionResult<Subject>> {
  try {
    const trimmedName = input.name ? input.name.trim() : ''
    if (!trimmedName) {
      return { success: false, error: 'Subject name is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Verify semester exists and belongs to current user
    const semester = await getSemester(input.semesterId, user.id)
    if (!semester) {
      return { success: false, error: 'Target semester not found or access denied.' }
    }

    // Validate baseline numbers
    const baselineAttended = input.baselineAttended ?? 0
    const baselineTotal = input.baselineTotal ?? 0
    if (baselineAttended < 0 || baselineTotal < 0) {
      return { success: false, error: 'Baseline attendance numbers cannot be negative.' }
    }
    if (baselineAttended > baselineTotal) {
      return { success: false, error: 'Baseline attended cannot exceed baseline total classes.' }
    }

    // Validate target percentage
    if (input.targetPercentage !== undefined && input.targetPercentage !== null) {
      if (input.targetPercentage < 0 || input.targetPercentage > 100) {
        return { success: false, error: 'Target percentage must be between 0 and 100%.' }
      }
    }

    const subject = await createSubject({
      userId: user.id,
      semesterId: input.semesterId,
      name: trimmedName,
      code: input.code,
      faculty: input.faculty,
      defaultRoom: input.defaultRoom,
      classType: input.classType,
      credits: input.credits,
      targetPercentage: input.targetPercentage,
      baselineAttended,
      baselineTotal,
    })

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: subject }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateSubjectAction(
  id: string,
  updates: {
    name?: string
    code?: string | null
    faculty?: string | null
    defaultRoom?: string | null
    classType?: ClassType
    credits?: number | null
    targetPercentage?: number | null
    baselineAttended?: number
    baselineTotal?: number
    isArchived?: boolean
  }
): Promise<ActionResult<Subject>> {
  try {
    if (updates.name !== undefined && !updates.name.trim()) {
      return { success: false, error: 'Subject name cannot be empty.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getSubject(id, user.id)
    if (!existing) {
      return { success: false, error: 'Subject not found or access denied.' }
    }

    const subject = await updateSubject(id, user.id, updates)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath(`/attendance/${id}`)
    revalidatePath('/dashboard')
    return { success: true, data: subject }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function archiveSubjectAction(id: string): Promise<ActionResult<Subject>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getSubject(id, user.id)
    if (!existing) {
      return { success: false, error: 'Subject not found or access denied.' }
    }

    const subject = await archiveSubject(id, user.id)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath(`/attendance/${id}`)
    revalidatePath('/dashboard')
    return { success: true, data: subject }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getSubject(id, user.id)
    if (!existing) {
      return { success: false, error: 'Subject not found or access denied.' }
    }

    await deleteSubject(id, user.id)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
