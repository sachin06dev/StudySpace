'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createUserCategory, deleteUserCategory, type UserCategory } from '@/lib/data/categories'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Updates the user's weekly study goal (in hours).
 * Persists to Supabase Auth metadata, cookies, and user_settings table.
 */
export async function updateWeeklyGoalAction(
  goalHours: number
): Promise<ActionResult<{ goalHours: number; goalMinutes: number }>> {
  try {
    if (typeof goalHours !== 'number' || !Number.isFinite(goalHours) || isNaN(goalHours)) {
      return { success: false, error: 'Goal hours must be a valid number.' }
    }

    if (goalHours < 1 || goalHours > 168) {
      return { success: false, error: 'Weekly study goal must be between 1 and 168 hours.' }
    }

    const goalMinutes = Math.round(goalHours * 60)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Your session expired. Please sign in again.' }
    }

    // 1. Persist to Supabase Auth User Metadata
    try {
      const { error: metaErr } = await supabase.auth.updateUser({
        data: {
          weekly_goal_minutes: goalMinutes,
        },
      })
      if (metaErr) {
        console.error('[Update Weekly Goal] Auth metadata update failed:', {
          message: metaErr.message,
          code: (metaErr as { code?: string }).code,
          status: metaErr.status,
        })
      }
    } catch (metaErr) {
      console.error('[Update Weekly Goal] Error updating user metadata:', metaErr)
    }

    // 2. Set Cookie for immediate SSR availability across routes
    try {
      const cookieStore = await cookies()
      cookieStore.set('user-weekly-goal-minutes', String(goalMinutes), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    } catch (cookieErr) {
      console.error('[Update Weekly Goal] Error setting weekly goal cookie:', cookieErr)
    }

    // 3. Try to update user_settings table if column exists in schema
    try {
      const { error: settingsErr } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            weekly_goal_minutes: goalMinutes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
      if (settingsErr && settingsErr.code !== 'PGRST204') {
        console.warn('[Update Weekly Goal] user_settings upsert note:', settingsErr.message)
      }
    } catch (dbErr) {
      // Non-fatal if column is not migrated in database
      console.warn('[Update Weekly Goal] user_settings DB update note:', dbErr)
    }

    revalidatePath('/analytics')
    revalidatePath('/dashboard')
    return { success: true, data: { goalHours, goalMinutes } }
  } catch (err: unknown) {
    const errObj = err as Record<string, unknown>
    console.error('[updateWeeklyGoalAction] Failed:', {
      message: (err as Error)?.message,
      code: errObj?.code,
      details: errObj?.details,
      hint: errObj?.hint,
    })
    return {
      success: false,
      error: "Couldn't update weekly study goal. Please try again.",
    }
  }
}

/**
 * Creates a new custom category for the user.
 */
export async function createCategoryAction(input: {
  name: string
  icon?: string | null
  description?: string | null
}): Promise<ActionResult<UserCategory>> {
  try {
    const trimmedName = input.name ? input.name.trim() : ''
    if (!trimmedName) {
      return { success: false, error: 'Category name is required.' }
    }

    if (trimmedName.length > 50) {
      return { success: false, error: 'Category name must be 50 characters or less.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const category = await createUserCategory(user.id, {
      name: trimmedName,
      icon: input.icon,
      description: input.description,
    })

    revalidatePath('/analytics')
    revalidatePath('/resources')
    revalidatePath('/documents')
    return { success: true, data: category }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Deletes a custom user category.
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    if (!categoryId) {
      return { success: false, error: 'Category ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    await deleteUserCategory(user.id, categoryId)

    revalidatePath('/analytics')
    revalidatePath('/resources')
    revalidatePath('/documents')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
