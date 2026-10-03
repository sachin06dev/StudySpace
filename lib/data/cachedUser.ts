import { cache } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { UserSettings } from '@/lib/data/pomodoro'
import type { Semester } from '@/lib/data/semesters'

export interface ProfileMetadata {
  id: string
  display_name: string | null
  full_name?: string | null
  avatar_url: string | null
  timezone: string
}

const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'user_id'> = {
  pomodoro_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  long_break_interval: 4,
}

/**
 * Request-memoized current Supabase user.
 * Avoids repeated network roundtrips to supabase.auth.getUser() within the same request lifecycle.
 */
export const getCachedUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch {
    return null
  }
})

/**
 * Request-memoized profile metadata for the given user.
 * Combines timezone, display_name, and avatar_url into a single query per request.
 */
export const getCachedUserProfile = cache(
  async (userId: string): Promise<ProfileMetadata | null> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, avatar_url, timezone')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return data as ProfileMetadata
    } catch {
      return null
    }
  }
)

/**
 * Request-memoized user settings for timer & goals.
 */
export const getCachedUserSettings = cache(
  async (userId: string): Promise<UserSettings> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) {
        return {
          user_id: userId,
          ...DEFAULT_USER_SETTINGS,
        }
      }

      return data as UserSettings
    } catch {
      return {
        user_id: userId,
        ...DEFAULT_USER_SETTINGS,
      }
    }
  }
)

/**
 * Request-memoized user timezone resolution.
 * Checks profile timezone -> cookie -> UTC.
 */
export const getCachedUserTimezone = cache(
  async (userId: string): Promise<string> => {
    let cookieTz: string | undefined
    try {
      const cookieStore = await cookies()
      cookieTz = cookieStore.get('user-timezone')?.value
    } catch {}

    const profile = await getCachedUserProfile(userId)
    const dbTimezone = profile?.timezone

    if (dbTimezone && dbTimezone !== 'UTC') {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: dbTimezone })
        return dbTimezone
      } catch {}
    }

    if (cookieTz) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: cookieTz })
        return cookieTz
      } catch {}
    }

    return 'UTC'
  }
)

/**
 * Request-memoized active semester lookup.
 */
export const getCachedActiveSemester = cache(
  async (userId: string): Promise<Semester | null> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return data as Semester
    } catch {
      return null
    }
  }
)
