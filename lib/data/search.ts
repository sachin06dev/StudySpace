import { createClient } from '@/lib/supabase/server'
import { formatDuration } from '@/lib/youtube/client'
import {
  APP_FEATURES,
  type SearchResultItem,
  type GroupedSearchResults,
  type AppFeature,
} from '@/lib/search/features'

export {
  APP_FEATURES,
  type SearchResultItem,
  type GroupedSearchResults,
  type AppFeature,
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface TimetableSlotRow {
  id: string
  day_of_week: number
  start_time: string | null
  end_time: string | null
  room_override: string | null
  faculty_override: string | null
  subject: { name: string; code: string | null } | null
}

interface SavedVideoRow {
  id: string
  video: { youtube_video_id: string; title: string; channel_name: string | null } | null
}

interface SavedPlaylistRow {
  id: string
  playlist: { youtube_playlist_id: string; title: string; channel_name: string | null } | null
}

interface NoteRow {
  id: string
  content: string
  timestamp_seconds: number | null
  video: { youtube_video_id: string; title: string } | null
}

/**
 * Searches authenticated user's workspace (Features + Content) with strict RLS isolation.
 * Debounced, server-side, multi-entity grouped search with dual classification.
 */
export async function performGlobalSearch(
  userId: string,
  query: string
): Promise<GroupedSearchResults[]> {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) {
    return []
  }

  // 1. Dual Classification: Features & Navigation Tools
  const q = trimmed.toLowerCase()
  const matchedFeatures: SearchResultItem[] = APP_FEATURES.filter((f) => {
    return (
      f.title.toLowerCase().includes(q) ||
      f.subtitle.toLowerCase().includes(q) ||
      f.keywords.some((k) => k.includes(q))
    )
  }).map((f) => ({
    id: f.id,
    title: f.title,
    subtitle: f.subtitle,
    category: 'Features & Tools',
    href: f.href,
    badge: 'Feature',
    resultType: 'feature',
  }))

  const supabase = await createClient()
  const cleanTerm = trimmed.replace(/[%_]/g, '') // Sanitize pattern characters
  const pattern = `%${cleanTerm}%`

  const [
    subjectsRes,
    slotsRes,
    videosRes,
    playlistsRes,
    notesRes,
    docsRes,
    resourcesRes,
    tasksRes,
  ] = await Promise.all([
    // 1. Subjects
    supabase
      .from('subjects')
      .select('id, name, code, default_room, faculty')
      .eq('user_id', userId)
      .or(`name.ilike.${pattern},code.ilike.${pattern}`)
      .limit(5),

    // 2. Timetable Classes
    supabase
      .from('timetable_slots')
      .select('id, day_of_week, start_time, end_time, room_override, faculty_override, subject:subjects!inner(name, code)')
      .eq('user_id', userId)
      .or(`room_override.ilike.${pattern},faculty_override.ilike.${pattern},subjects.name.ilike.${pattern}`)
      .limit(5),

    // 3. Saved Videos
    supabase
      .from('saved_videos')
      .select('id, video:youtube_videos!inner(youtube_video_id, title, channel_name)')
      .eq('user_id', userId)
      .or(`youtube_videos.title.ilike.${pattern},youtube_videos.channel_name.ilike.${pattern}`)
      .limit(5),

    // 4. Saved Playlists
    supabase
      .from('saved_playlists')
      .select('id, playlist:youtube_playlists!inner(youtube_playlist_id, title, channel_name)')
      .eq('user_id', userId)
      .or(`youtube_playlists.title.ilike.${pattern},youtube_playlists.channel_name.ilike.${pattern}`)
      .limit(5),

    // 5. Notes (Timestamped Video Notes)
    supabase
      .from('video_timestamp_notes')
      .select('id, content, timestamp_seconds, video:youtube_videos!inner(youtube_video_id, title)')
      .eq('user_id', userId)
      .ilike('content', pattern)
      .limit(5),

    // 6. Documents
    supabase
      .from('documents')
      .select('id, title, file_name, category, mime_type')
      .eq('user_id', userId)
      .or(`title.ilike.${pattern},file_name.ilike.${pattern},category.ilike.${pattern}`)
      .limit(5),

    // 7. Website Resources
    supabase
      .from('website_resources')
      .select('id, title, url, description, category')
      .eq('user_id', userId)
      .or(`title.ilike.${pattern},description.ilike.${pattern},url.ilike.${pattern}`)
      .limit(5),

    // 8. Tasks
    supabase
      .from('tasks')
      .select('id, title, description, status, priority')
      .eq('user_id', userId)
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(5),
  ])

  const grouped: GroupedSearchResults[] = []

  // Add Features first (prioritized)
  if (matchedFeatures.length > 0) {
    grouped.push({
      category: 'Features & Tools',
      items: matchedFeatures,
    })
  }

  // Format Subjects
  if (subjectsRes.data && subjectsRes.data.length > 0) {
    grouped.push({
      category: 'Subjects',
      items: subjectsRes.data.map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: [s.code, s.default_room ? `Room ${s.default_room}` : null, s.faculty]
          .filter(Boolean)
          .join(' • '),
        category: 'Subjects',
        href: `/attendance`,
        badge: s.code || undefined,
        resultType: 'content',
      })),
    })
  }

  // Format Timetable Classes
  if (slotsRes.data && slotsRes.data.length > 0) {
    const slotRows = slotsRes.data as unknown as TimetableSlotRow[]
    grouped.push({
      category: 'Timetable',
      items: slotRows.map((slot) => {
        const sub = slot.subject
        const day = DAY_NAMES[slot.day_of_week] || ''
        const time = `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`
        return {
          id: slot.id,
          title: sub?.name || 'Class',
          subtitle: `${day} ${time}${slot.room_override ? ` • Room ${slot.room_override}` : ''}`,
          category: 'Timetable',
          href: `/timetable`,
          badge: day,
          resultType: 'content',
        }
      }),
    })
  }

  // Format Videos
  if (videosRes.data && videosRes.data.length > 0) {
    const videoRows = videosRes.data as unknown as SavedVideoRow[]
    grouped.push({
      category: 'Videos',
      items: videoRows.map((v) => ({
        id: v.id,
        title: v.video?.title || 'Saved Video',
        subtitle: v.video?.channel_name || 'YouTube',
        category: 'Videos',
        href: `/videos/${v.id}`,
        resultType: 'content',
      })),
    })
  }

  // Format Playlists
  if (playlistsRes.data && playlistsRes.data.length > 0) {
    const playlistRows = playlistsRes.data as unknown as SavedPlaylistRow[]
    grouped.push({
      category: 'Playlists',
      items: playlistRows.map((p) => ({
        id: p.id,
        title: p.playlist?.title || 'Saved Playlist',
        subtitle: p.playlist?.channel_name || 'YouTube Playlist',
        category: 'Playlists',
        href: `/playlists/${p.id}`,
        resultType: 'content',
      })),
    })
  }

  // Format Notes
  if (notesRes.data && notesRes.data.length > 0) {
    const noteRows = notesRes.data as unknown as NoteRow[]
    grouped.push({
      category: 'Notes',
      items: noteRows.map((n) => {
        const timeStr = formatDuration(n.timestamp_seconds || 0)
        return {
          id: n.id,
          title: n.content,
          subtitle: `From "${n.video?.title || 'Video'}" at ${timeStr}`,
          category: 'Notes',
          href: `/notes`,
          badge: timeStr,
          resultType: 'content',
        }
      }),
    })
  }

  // Format Documents
  if (docsRes.data && docsRes.data.length > 0) {
    grouped.push({
      category: 'Documents',
      items: docsRes.data.map((d) => ({
        id: d.id,
        title: d.title || d.file_name,
        subtitle: [d.category, d.file_name].filter(Boolean).join(' • '),
        category: 'Documents',
        href: `/documents`,
        badge: d.category || undefined,
        resultType: 'content',
      })),
    })
  }

  // Format Website Resources
  if (resourcesRes.data && resourcesRes.data.length > 0) {
    grouped.push({
      category: 'Resources',
      items: resourcesRes.data.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.description || r.url,
        category: 'Resources',
        href: `/resources`,
        badge: r.category || undefined,
        resultType: 'content',
      })),
    })
  }

  // Format Tasks
  if (tasksRes.data && tasksRes.data.length > 0) {
    grouped.push({
      category: 'Tasks',
      items: tasksRes.data.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: [t.priority ? `${t.priority} priority` : null, t.status].filter(Boolean).join(' • '),
        category: 'Tasks',
        href: `/tasks`,
        badge: t.status,
        resultType: 'content',
      })),
    })
  }

  return grouped
}
