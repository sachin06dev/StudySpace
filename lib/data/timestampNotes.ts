import { createClient } from '@/lib/supabase/server'
import type { YoutubeVideo } from '@/lib/data/videos'

export interface VideoTimestampNote {
  id: string
  user_id: string
  video_id: string
  timestamp_seconds: number
  content: string
  created_at: string
  updated_at: string
}

export interface VideoTimestampNoteWithDetails extends VideoTimestampNote {
  video: YoutubeVideo | null
  savedVideoId?: string | null
  playlists?: { id: string; title: string }[]
  matchedSubjects?: { id: string; name: string; code: string | null }[]
}

export interface CreateTimestampNoteInput {
  userId: string
  videoId: string
  timestampSeconds: number
  content: string
}

/**
 * Fetches all timestamp notes across all videos for a user,
 * joined with video details, saved_video ID, and associated saved playlists.
 */
export async function getAllNotesForUser(
  userId: string
): Promise<VideoTimestampNoteWithDetails[]> {
  const supabase = await createClient()

  const [notesRes, savedVideosRes, savedPlaylistsRes, subjectsRes] = await Promise.all([
    supabase
      .from('video_timestamp_notes')
      .select(`
        *,
        video:youtube_videos (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('saved_videos')
      .select('id, video_id')
      .eq('user_id', userId),

    supabase
      .from('saved_playlists')
      .select(`
        id,
        playlist_id,
        playlist:youtube_playlists (id, title)
      `)
      .eq('user_id', userId),

    supabase
      .from('subjects')
      .select('id, name, code')
      .eq('user_id', userId)
      .eq('is_archived', false),
  ])

  if (notesRes.error) {
    console.error('Error fetching all notes for user:', notesRes.error)
    throw new Error('Failed to fetch study notes.')
  }

  const notes = notesRes.data || []
  if (notes.length === 0) {
    return []
  }

  const savedVideoMap = new Map<string, string>()
  if (savedVideosRes.data) {
    for (const sv of savedVideosRes.data) {
      savedVideoMap.set(sv.video_id, sv.id)
    }
  }

  // Map videos to their parent playlists
  const videoToPlaylistsMap = new Map<string, { id: string; title: string }[]>()
  const savedPlaylists = savedPlaylistsRes.data || []
  const playlistIds = savedPlaylists.map((sp) => sp.playlist_id).filter(Boolean)

  if (playlistIds.length > 0) {
    const { data: items } = await supabase
      .from('playlist_items')
      .select('playlist_id, video_id')
      .in('playlist_id', playlistIds)

    if (items) {
      const playlistMetaMap = new Map<string, { id: string; title: string }>()
      for (const sp of savedPlaylists) {
        const pl = sp.playlist as unknown as { id: string; title: string } | null
        if (pl) {
          playlistMetaMap.set(sp.playlist_id, { id: pl.id || sp.playlist_id, title: pl.title })
        }
      }

      for (const it of items) {
        const meta = playlistMetaMap.get(it.playlist_id)
        if (meta) {
          const existing = videoToPlaylistsMap.get(it.video_id) || []
          if (!existing.some((p) => p.id === meta.id)) {
            existing.push(meta)
          }
          videoToPlaylistsMap.set(it.video_id, existing)
        }
      }
    }
  }

  const subjectsList = subjectsRes.data || []

  return notes.map((note) => {
    const videoTitle = (note.video as unknown as YoutubeVideo)?.title?.toLowerCase() || ''
    const contentText = note.content?.toLowerCase() || ''
    const playlistTitles = (videoToPlaylistsMap.get(note.video_id) || []).map((p) => p.title.toLowerCase())

    const matchedSubjects = subjectsList.filter((s) => {
      const sName = s.name.toLowerCase().trim()
      const sCode = s.code?.toLowerCase().trim()
      if (sName && (videoTitle.includes(sName) || contentText.includes(sName) || playlistTitles.some((pt) => pt.includes(sName)))) {
        return true
      }
      if (sCode && sCode.length >= 3 && (videoTitle.includes(sCode) || contentText.includes(sCode) || playlistTitles.some((pt) => pt.includes(sCode)))) {
        return true
      }
      return false
    })

    return {
      ...note,
      video: (note.video as unknown as YoutubeVideo) || null,
      savedVideoId: savedVideoMap.get(note.video_id) || null,
      playlists: videoToPlaylistsMap.get(note.video_id) || [],
      matchedSubjects: matchedSubjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    }
  })
}

/**
 * Fetches all timestamp notes for a specific user and video,
 * ordered chronologically by timestamp_seconds ascending.
 */
export async function getNotesForVideo(
  userId: string,
  videoId: string
): Promise<VideoTimestampNote[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('video_timestamp_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .order('timestamp_seconds', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching video timestamp notes:', error)
    throw new Error('Failed to fetch timestamp notes.')
  }

  return (data || []) as VideoTimestampNote[]
}

/**
 * Creates a new timestamp note for a user on a specific video.
 */
export async function createNote(
  input: CreateTimestampNoteInput
): Promise<VideoTimestampNote> {
  const supabase = await createClient()

  const safeSeconds = Math.max(0, Math.floor(input.timestampSeconds))
  const trimmedContent = input.content.trim()

  const { data, error } = await supabase
    .from('video_timestamp_notes')
    .insert({
      user_id: input.userId,
      video_id: input.videoId,
      timestamp_seconds: safeSeconds,
      content: trimmedContent,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating video timestamp note:', error)
    throw new Error('Failed to create timestamp note.')
  }

  return data as VideoTimestampNote
}

/**
 * Updates the text content of an existing timestamp note.
 * (Note: timestamp itself is not editable after creation).
 */
export async function updateNote(
  id: string,
  userId: string,
  content: string
): Promise<VideoTimestampNote> {
  const supabase = await createClient()
  const trimmedContent = content.trim()

  const { data, error } = await supabase
    .from('video_timestamp_notes')
    .update({
      content: trimmedContent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating video timestamp note:', error)
    throw new Error('Failed to update timestamp note.')
  }

  return data as VideoTimestampNote
}

/**
 * Deletes a timestamp note for the authenticated user.
 */
export async function deleteNote(id: string, userId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('video_timestamp_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting video timestamp note:', error)
    throw new Error('Failed to delete timestamp note.')
  }
}

