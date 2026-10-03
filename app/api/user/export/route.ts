import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/user/export
 * Exports all user data as a JSON blob.
 * Includes: notes, tasks, attendance records, timetable slots, semesters,
 *           subjects, pomodoro sessions, bookmarks, playlists, study resources.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const uid = user.id

  try {
    // Fetch all user tables in parallel
    const [
      notesRes,
      tasksRes,
      pomodoroRes,
      semestersRes,
      subjectsRes,
      slotsRes,
      attendanceRes,
    ] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', uid),
      supabase.from('tasks').select('*').eq('user_id', uid),
      supabase.from('pomodoro_sessions').select('*').eq('user_id', uid),
      supabase.from('semesters').select('*').eq('user_id', uid),
      supabase.from('subjects').select('*').in(
        'semester_id',
        (await supabase.from('semesters').select('id').eq('user_id', uid)).data?.map((s) => s.id) ?? []
      ),
      supabase.from('timetable_slots').select('*').in(
        'semester_id',
        (await supabase.from('semesters').select('id').eq('user_id', uid)).data?.map((s) => s.id) ?? []
      ),
      supabase.from('attendance_records').select('*').eq('user_id', uid),
    ])

    // Optional tables — non-fatal if they don't exist
    const safeQuery = async (table: string) => {
      try {
        const res = await supabase.from(table as never).select('*').eq('user_id', uid)
        return res.data ?? []
      } catch {
        return []
      }
    }

    const [savedVideos, savedPlaylists, studyResources] = await Promise.all([
      safeQuery('saved_videos'),
      safeQuery('saved_playlists'),
      safeQuery('study_resources'),
    ])

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userId: uid,
      email: user.email,
      notes: notesRes.data ?? [],
      tasks: tasksRes.data ?? [],
      pomodoroSessions: pomodoroRes.data ?? [],
      semesters: semestersRes.data ?? [],
      subjects: subjectsRes.data ?? [],
      timetableSlots: slotsRes.data ?? [],
      attendanceRecords: attendanceRes.data ?? [],
      savedVideos: savedVideos,
      savedPlaylists: savedPlaylists,
      studyResources: studyResources,
    }

    const json = JSON.stringify(exportPayload, null, 2)
    const filename = `studyspace-export-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[export] Error:', error)
    return NextResponse.json({ error: 'Export failed. Please try again.' }, { status: 500 })
  }
}
