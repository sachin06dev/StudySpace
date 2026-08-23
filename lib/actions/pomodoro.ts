'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createSession,
  completeSession,
  updateUserSettings,
  type PomodoroSession,
  type UserSettings,
  type SessionType,
  type SessionStatus,
  type UpdateUserSettingsInput,
} from '@/lib/data/pomodoro'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createSessionAction(input: {
  sessionType: SessionType
  plannedSeconds: number
}): Promise<ActionResult<PomodoroSession>> {
  try {
    const validTypes: SessionType[] = ['focus', 'short_break', 'long_break']
    if (!validTypes.includes(input.sessionType)) {
      return { success: false, error: 'Invalid session type.' }
    }

    if (!input.plannedSeconds || input.plannedSeconds <= 0) {
      return { success: false, error: 'Planned seconds must be greater than 0.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const session = await createSession({
      userId: user.id,
      sessionType: input.sessionType,
      plannedSeconds: Math.round(input.plannedSeconds),
    })

    revalidatePath('/pomodoro')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')
    return { success: true, data: session }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function completeSessionAction(input: {
  id: string
  actualSeconds: number
  status: SessionStatus
}): Promise<ActionResult<PomodoroSession>> {
  try {
    if (!input.id) {
      return { success: false, error: 'Session ID is required.' }
    }

    const validStatuses: SessionStatus[] = ['completed', 'cancelled', 'interrupted']
    if (!validStatuses.includes(input.status)) {
      return { success: false, error: 'Invalid session status.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const session = await completeSession(input.id, user.id, {
      actualSeconds: Math.max(0, Math.round(input.actualSeconds)),
      status: input.status,
    })

    revalidatePath('/pomodoro')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')
    return { success: true, data: session }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateUserSettingsAction(
  updates: UpdateUserSettingsInput
): Promise<ActionResult<UserSettings>> {
  try {
    const validatedUpdates: UpdateUserSettingsInput = {}

    if (updates.pomodoro_duration !== undefined) {
      const val = Number(updates.pomodoro_duration)
      if (isNaN(val) || val < 1 || val > 180) {
        return { success: false, error: 'Pomodoro duration must be between 1 and 180 minutes.' }
      }
      validatedUpdates.pomodoro_duration = Math.round(val)
    }

    if (updates.short_break_duration !== undefined) {
      const val = Number(updates.short_break_duration)
      if (isNaN(val) || val < 1 || val > 60) {
        return { success: false, error: 'Short break duration must be between 1 and 60 minutes.' }
      }
      validatedUpdates.short_break_duration = Math.round(val)
    }

    if (updates.long_break_duration !== undefined) {
      const val = Number(updates.long_break_duration)
      if (isNaN(val) || val < 1 || val > 120) {
        return { success: false, error: 'Long break duration must be between 1 and 120 minutes.' }
      }
      validatedUpdates.long_break_duration = Math.round(val)
    }

    if (updates.long_break_interval !== undefined) {
      const val = Number(updates.long_break_interval)
      if (isNaN(val) || val < 1 || val > 20) {
        return { success: false, error: 'Long break interval must be between 1 and 20 sessions.' }
      }
      validatedUpdates.long_break_interval = Math.round(val)
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const settings = await updateUserSettings(user.id, validatedUpdates)

    revalidatePath('/pomodoro')
    return { success: true, data: settings }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
