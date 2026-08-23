'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Updates the user's configured timezone in both Supabase `profiles` table
 * and the `user-timezone` cookie.
 */
export async function updateUserTimezoneAction(
  timezone: string
): Promise<ActionResult<{ timezone: string }>> {
  try {
    if (!timezone || typeof timezone !== 'string') {
      return { success: false, error: 'Valid timezone name is required.' }
    }

    const trimmedTimezone = timezone.trim()

    // Validate that the timezone is recognized by the Intl engine
    try {
      Intl.DateTimeFormat(undefined, { timeZone: trimmedTimezone })
    } catch {
      return { success: false, error: `"${trimmedTimezone}" is not a recognized IANA timezone.` }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        timezone: trimmedTimezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user timezone in profiles:', updateError)
      return { success: false, error: 'Failed to update timezone preference in database.' }
    }

    // Set cookie for instant SSR fallback
    const cookieStore = await cookies()
    cookieStore.set('user-timezone', trimmedTimezone, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
    })

    revalidatePath('/', 'layout')
    return { success: true, data: { timezone: trimmedTimezone } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Automatically syncs the user's browser-detected timezone to their profile
 * if their profile currently has 'UTC' or no timezone set.
 */
export async function syncUserTimezoneAction(
  detectedTimezone: string
): Promise<ActionResult<{ timezone: string }>> {
  try {
    if (!detectedTimezone || typeof detectedTimezone !== 'string') {
      return { success: false, error: 'Invalid timezone' }
    }

    const trimmedTimezone = detectedTimezone.trim()

    try {
      Intl.DateTimeFormat(undefined, { timeZone: trimmedTimezone })
    } catch {
      return { success: false, error: 'Unrecognized timezone' }
    }

    // Set cookie immediately for SSR
    const cookieStore = await cookies()
    cookieStore.set('user-timezone', trimmedTimezone, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .maybeSingle()

      // If database row is empty, null, or default 'UTC', update to the user's actual local timezone
      if (!profile?.timezone || profile.timezone === 'UTC') {
        await supabase
          .from('profiles')
          .update({
            timezone: trimmedTimezone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        revalidatePath('/', 'layout')
      }
    }

    return { success: true, data: { timezone: trimmedTimezone } }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
