import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createApiClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { Semester } from '@/lib/data/semesters'

/**
 * DELETE /api/user/delete-data
 * Deletes all user study data but keeps the account.
 * Tables cleared: notes, tasks, pomodoro_sessions, semesters (cascades to subjects, slots, exceptions, attendance).
 */
export async function DELETE(request: Request) {
  let user: User | null = null
  let authenticatedClient: SupabaseClient | null = null

  // 1. Authenticate via Bearer token (Mobile / external API clients)
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const client = createApiClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
      const { data, error } = await client.auth.getUser(token)
      if (!error && data?.user) {
        user = data.user
        authenticatedClient = client
      }
    }
  }

  // 2. Authenticate via Cookie session (Web client)
  if (!user) {
    const supabase = await createClient()
    const {
      data: { user: cookieUser },
    } = await supabase.auth.getUser()
    if (cookieUser) {
      user = cookieUser
      authenticatedClient = supabase
    }
  }

  if (!user || !authenticatedClient) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Require confirmation token in body
  let body: { confirm?: string } = {}
  try {
    body = await request.json()
  } catch {
    // ignore
  }

  if (body.confirm !== 'DELETE' && body.confirm !== 'DELETE_MY_DATA') {
    return NextResponse.json({ error: 'Please type DELETE to confirm data deletion.' }, { status: 400 })
  }

  const uid = user.id

  try {
    // Delete in correct order (FK constraints)
    // Attendance records first (FK to semesters)
    await authenticatedClient.from('attendance_records').delete().eq('user_id', uid)

    // Get semester IDs for cascading deletes
    const semIds = (await authenticatedClient.from('semesters').select('id').eq('user_id', uid)).data?.map((s: Pick<Semester, 'id'>) => s.id) ?? []

    if (semIds.length > 0) {
      await authenticatedClient.from('timetable_exceptions').delete().in('semester_id', semIds)
      await authenticatedClient.from('timetable_slots').delete().in('semester_id', semIds)
      await authenticatedClient.from('subjects').delete().in('semester_id', semIds)
    }

    await authenticatedClient.from('semesters').delete().eq('user_id', uid)
    await authenticatedClient.from('tasks').delete().eq('user_id', uid)
    await authenticatedClient.from('pomodoro_sessions').delete().eq('user_id', uid)
    await authenticatedClient.from('notes').delete().eq('user_id', uid)

    // Soft-delete optional tables (non-fatal if they don't exist)
    try { await authenticatedClient.from('saved_videos').delete().eq('user_id', uid) } catch { /* ignore */ }
    try { await authenticatedClient.from('saved_playlists').delete().eq('user_id', uid) } catch { /* ignore */ }
    try { await authenticatedClient.from('study_resources').delete().eq('user_id', uid) } catch { /* ignore */ }
    try { await authenticatedClient.from('video_timestamp_notes').delete().eq('user_id', uid) } catch { /* ignore */ }
    try { await authenticatedClient.from('bookmarks').delete().eq('user_id', uid) } catch { /* ignore */ }

    return NextResponse.json({ success: true, message: 'All study data deleted successfully.' })
  } catch (error) {
    console.error('[delete-data] Error:', error)
    return NextResponse.json({ error: 'Data deletion failed. Please try again.' }, { status: 500 })
  }
}
