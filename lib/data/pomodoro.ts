import { createClient } from '@/lib/supabase/server'

export type SessionType = 'focus' | 'short_break' | 'long_break'
export type SessionStatus = 'completed' | 'cancelled' | 'interrupted'

export interface PomodoroSession {
  id: string
  user_id: string
  session_type: SessionType
  planned_seconds: number
  actual_seconds: number
  started_at: string
  completed_at: string | null
  status: SessionStatus
  created_at: string
}

export interface UserSettings {
  user_id: string
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
  long_break_interval: number
  created_at?: string
  updated_at?: string
}

export interface CreateSessionInput {
  userId: string
  sessionType: SessionType
  plannedSeconds: number
  startedAt?: string
}

export interface CompleteSessionInput {
  actualSeconds: number
  status: SessionStatus
  completedAt?: string
}

export interface UpdateUserSettingsInput {
  pomodoro_duration?: number
  short_break_duration?: number
  long_break_duration?: number
  long_break_interval?: number
}

const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'user_id'> = {
  pomodoro_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  long_break_interval: 4,
}

/**
 * Fetch the user's settings.
 * Returns default values if the row is missing for any reason.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found, return sensible defaults
      return {
        user_id: userId,
        ...DEFAULT_USER_SETTINGS,
      }
    }
    console.error(`Error fetching user settings for ${userId}:`, error)
    throw new Error('Failed to fetch user settings')
  }

  return data as UserSettings
}

/**
 * Update the user's timer duration and interval settings.
 */
export async function updateUserSettings(
  userId: string,
  updates: UpdateUserSettingsInput
): Promise<UserSettings> {
  const supabase = await createClient()
  const payload: Record<string, unknown> = {}

  if (updates.pomodoro_duration !== undefined) {
    payload.pomodoro_duration = updates.pomodoro_duration
  }
  if (updates.short_break_duration !== undefined) {
    payload.short_break_duration = updates.short_break_duration
  }
  if (updates.long_break_duration !== undefined) {
    payload.long_break_duration = updates.long_break_duration
  }
  if (updates.long_break_interval !== undefined) {
    payload.long_break_interval = updates.long_break_interval
  }

  const { data, error } = await supabase
    .from('user_settings')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating user settings for ${userId}:`, error)
    throw new Error('Failed to update user settings')
  }

  return data as UserSettings
}

/**
 * Create a new pomodoro session when the timer starts.
 * Default status is 'interrupted' so abandoned sessions are clearly marked.
 */
export async function createSession(input: CreateSessionInput): Promise<PomodoroSession> {
  const supabase = await createClient()
  const startedAt = input.startedAt || new Date().toISOString()

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      user_id: input.userId,
      session_type: input.sessionType,
      planned_seconds: input.plannedSeconds,
      actual_seconds: 0,
      started_at: startedAt,
      status: 'interrupted',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating pomodoro session:', error)
    throw new Error('Failed to create pomodoro session')
  }

  return data as PomodoroSession
}

/**
 * Update a pomodoro session upon natural completion or cancellation.
 */
export async function completeSession(
  id: string,
  userId: string,
  updates: CompleteSessionInput
): Promise<PomodoroSession> {
  const supabase = await createClient()
  const completedAt = updates.completedAt || new Date().toISOString()

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .update({
      actual_seconds: updates.actualSeconds,
      status: updates.status,
      completed_at: completedAt,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error completing pomodoro session ${id}:`, error)
    throw new Error('Failed to complete pomodoro session')
  }

  return data as PomodoroSession
}

/**
 * Fetch recent pomodoro sessions for the user.
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 30
): Promise<PomodoroSession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`Error fetching recent sessions for ${userId}:`, error)
    throw new Error('Failed to fetch recent sessions')
  }

  return (data || []) as PomodoroSession[]
}
