'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createSemester,
  updateSemester,
  setActiveSemester,
  archiveSemester,
  deleteSemester,
  getSemester,
  type Semester,
} from '@/lib/data/semesters'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createSemesterAction(input: {
  name: string
  startDate: string
  endDate: string
  isActive?: boolean
}): Promise<ActionResult<Semester>> {
  try {
    const trimmedName = input.name ? input.name.trim() : ''
    if (!trimmedName) {
      return { success: false, error: 'Semester name is required.' }
    }
    if (!input.startDate || !input.endDate) {
      return { success: false, error: 'Start and end dates are required.' }
    }
    if (input.endDate < input.startDate) {
      return { success: false, error: 'End date must be on or after start date.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const semester = await createSemester({
      userId: user.id,
      name: trimmedName,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: input.isActive,
    })

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: semester }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateSemesterAction(
  id: string,
  updates: {
    name?: string
    startDate?: string
    endDate?: string
    isActive?: boolean
  }
): Promise<ActionResult<Semester>> {
  try {
    if (updates.name !== undefined && !updates.name.trim()) {
      return { success: false, error: 'Semester name cannot be empty.' }
    }
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Verify ownership
    const existing = await getSemester(id, user.id)
    if (!existing) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    const finalStart = updates.startDate ?? existing.start_date
    const finalEnd = updates.endDate ?? existing.end_date
    if (finalEnd < finalStart) {
      return { success: false, error: 'End date must be on or after start date.' }
    }

    const semester = await updateSemester(id, user.id, updates)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: semester }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function setActiveSemesterAction(id: string): Promise<ActionResult<Semester>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getSemester(id, user.id)
    if (!existing) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    const semester = await setActiveSemester(id, user.id)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: semester }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function archiveSemesterAction(id: string): Promise<ActionResult<Semester>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getSemester(id, user.id)
    if (!existing) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    const semester = await archiveSemester(id, user.id)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true, data: semester }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function deleteSemesterAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const existing = await getSemester(id, user.id)
    if (!existing) {
      return { success: false, error: 'Semester not found or access denied.' }
    }

    await deleteSemester(id, user.id)

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
