import { createClient } from '@/lib/supabase/server'
import type { YoutubeVideoMetadata } from '@/lib/youtube/client'

export type VideoStatus = 'saved' | 'in_progress' | 'completed' | 'not_started'

export interface YoutubeVideo {
  id: string
  youtube_video_id: string
  title: string
  channel_name: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  created_at: string
}

export interface SavedVideo {
  id: string
  user_id: string
  video_id: string
  saved_at: string
  watch_progress_seconds: number
  last_watched_at: string | null
  status: VideoStatus
  completed_at: string | null
}

export interface SavedVideoWithDetails extends SavedVideo {
  video: YoutubeVideo
}

export interface VideosPageData {
  allVideos: SavedVideoWithDetails[]
  addedVideos: SavedVideoWithDetails[]
  inProgressVideos: SavedVideoWithDetails[]
  completedVideos: SavedVideoWithDetails[]
  counts: {
    total: number
    added: number
    inProgress: number
    completed: number
  }
}

/**
 * Finds or inserts a YouTube video in the global catalog.
 */
export async function findOrCreateYoutubeVideo(
  metadata: YoutubeVideoMetadata
): Promise<YoutubeVideo> {
  const supabase = await createClient()

  const { data: existing, error: findError } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('youtube_video_id', metadata.youtube_video_id)
    .maybeSingle()

  if (findError) {
    console.error('Error checking youtube_videos catalog:', findError)
    throw new Error('Database error checking video catalog.')
  }

  if (existing) {
    return existing as YoutubeVideo
  }

  const { data: created, error: insertError } = await supabase
    .from('youtube_videos')
    .insert({
      youtube_video_id: metadata.youtube_video_id,
      title: metadata.title,
      channel_name: metadata.channel_name || null,
      thumbnail_url: metadata.thumbnail_url || null,
      duration_seconds: metadata.duration_seconds || null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting into youtube_videos:', insertError)
    const { data: retryExisting } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('youtube_video_id', metadata.youtube_video_id)
      .maybeSingle()

    if (retryExisting) {
      return retryExisting as YoutubeVideo
    }

    throw new Error('Failed to save video to catalog.')
  }

  return created as YoutubeVideo
}

/**
 * Saves a video for a specific user in `saved_videos`.
 */
export async function saveVideoForUser(
  userId: string,
  videoId: string
): Promise<{ savedVideo: SavedVideo; isNew: boolean }> {
  const supabase = await createClient()

  const { data: existing, error: findError } = await supabase
    .from('saved_videos')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .maybeSingle()

  if (findError) {
    console.error('Error checking saved_videos:', findError)
    throw new Error('Database error checking saved videos.')
  }

  if (existing) {
    return { savedVideo: existing as SavedVideo, isNew: false }
  }

  const { data: created, error: insertError } = await supabase
    .from('saved_videos')
    .insert({
      user_id: userId,
      video_id: videoId,
      status: 'saved',
      watch_progress_seconds: 0,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting into saved_videos:', insertError)
    throw new Error('Failed to save video to your library.')
  }

  return { savedVideo: created as SavedVideo, isNew: true }
}

/**
 * Fetches videos for the main Videos page according to the specification:
 * 1. Individually added videos.
 * 2. Playlist videos that have been started (in_progress).
 * 3. Playlist videos that have been completed.
 * All unstarted playlist videos remain hidden from the Videos page.
 */
export async function getVideosPageData(userId: string): Promise<VideosPageData> {
  const supabase = await createClient()

  // 1. Fetch user's saved videos and saved playlists concurrently
  const [savedVideosRes, userPlaylistsRes] = await Promise.all([
    supabase
      .from('saved_videos')
      .select(`
        *,
        video:youtube_videos (*)
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false }),
    supabase
      .from('saved_playlists')
      .select('playlist_id')
      .eq('user_id', userId),
  ])

  if (savedVideosRes.error) {
    console.error('Error fetching saved videos for videos page:', savedVideosRes.error)
    throw new Error('Failed to fetch videos.')
  }

  const savedVideos = (savedVideosRes.data || []).filter(
    (item) => item.video
  ) as SavedVideoWithDetails[]

  // 2. Fetch all playlist video IDs belonging to the user's saved playlists
  const playlistIds = (userPlaylistsRes.data || [])
    .map((p) => p.playlist_id)
    .filter(Boolean)
  const playlistVideoIds = new Set<string>()

  if (playlistIds.length > 0) {
    const { data: pItems, error: pItemsError } = await supabase
      .from('playlist_items')
      .select('video_id')
      .in('playlist_id', playlistIds)

    if (!pItemsError && pItems) {
      for (const item of pItems) {
        playlistVideoIds.add(item.video_id)
      }
    }
  }

  // 3. Categorize into Added Videos, In Progress, and Completed
  const addedVideos: SavedVideoWithDetails[] = []
  const inProgressVideos: SavedVideoWithDetails[] = []
  const completedVideos: SavedVideoWithDetails[] = []
  const allEligibleVideos: SavedVideoWithDetails[] = []

  for (const sv of savedVideos) {
    const isPlaylistVideo = playlistVideoIds.has(sv.video_id)
    const isCompleted = sv.status === 'completed'
    const isInProgress = sv.status === 'in_progress'

    if (isCompleted) {
      completedVideos.push(sv)
      allEligibleVideos.push(sv)
    } else if (isInProgress) {
      inProgressVideos.push(sv)
      allEligibleVideos.push(sv)
    } else {
      // status === 'saved'
      // If it belongs to a saved playlist and has not been started, HIDE from videos page!
      // If it is NOT in a playlist, it was individually added: SHOW in addedVideos and allEligibleVideos!
      if (!isPlaylistVideo) {
        addedVideos.push(sv)
        allEligibleVideos.push(sv)
      }
    }
  }

  // Sort in-progress by last_watched_at DESC (most recently active first)
  inProgressVideos.sort((a, b) => {
    const timeA = a.last_watched_at ? new Date(a.last_watched_at).getTime() : new Date(a.saved_at).getTime()
    const timeB = b.last_watched_at ? new Date(b.last_watched_at).getTime() : new Date(b.saved_at).getTime()
    return timeB - timeA
  })

  // Sort completed by completed_at DESC (most recently completed first)
  completedVideos.sort((a, b) => {
    const timeA = a.completed_at ? new Date(a.completed_at).getTime() : new Date(a.saved_at).getTime()
    const timeB = b.completed_at ? new Date(b.completed_at).getTime() : new Date(b.saved_at).getTime()
    return timeB - timeA
  })

  // Sort all videos by most recent activity/save date
  allEligibleVideos.sort((a, b) => {
    const timeA = a.last_watched_at
      ? new Date(a.last_watched_at).getTime()
      : a.completed_at
      ? new Date(a.completed_at).getTime()
      : new Date(a.saved_at).getTime()
    const timeB = b.last_watched_at
      ? new Date(b.last_watched_at).getTime()
      : b.completed_at
      ? new Date(b.completed_at).getTime()
      : new Date(b.saved_at).getTime()
    return timeB - timeA
  })

  return {
    allVideos: allEligibleVideos,
    addedVideos,
    inProgressVideos,
    completedVideos,
    counts: {
      total: allEligibleVideos.length,
      added: addedVideos.length,
      inProgress: inProgressVideos.length,
      completed: completedVideos.length,
    },
  }
}

/**
 * Fetches all saved videos for a user with joined global video details,
 * ordered by most recently saved first.
 */
export async function getSavedVideos(userId: string): Promise<SavedVideoWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('saved_videos')
    .select(`
      *,
      video:youtube_videos (*)
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved videos:', error)
    throw new Error('Failed to fetch saved videos.')
  }

  // Filter out any rows where the joined video might be missing
  return (data || []).filter((item) => item.video) as SavedVideoWithDetails[]
}

/**
 * Fetches a single saved video for a user by saved_video ID, video UUID, or YouTube video ID.
 */
export async function getSavedVideo(
  userId: string,
  identifier: string
): Promise<SavedVideoWithDetails | null> {
  const supabase = await createClient()

  // 1. Try matching saved_videos.id or saved_videos.video_id (if UUID format)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    identifier
  )

  if (isUuid) {
    // Check by saved_videos.id
    const { data: bySavedId, error: err1 } = await supabase
      .from('saved_videos')
      .select(`
        *,
        video:youtube_videos (*)
      `)
      .eq('user_id', userId)
      .eq('id', identifier)
      .maybeSingle()

    if (!err1 && bySavedId && bySavedId.video) {
      return bySavedId as SavedVideoWithDetails
    }

    // Check by saved_videos.video_id (youtube_videos.id)
    const { data: byVideoId, error: err2 } = await supabase
      .from('saved_videos')
      .select(`
        *,
        video:youtube_videos (*)
      `)
      .eq('user_id', userId)
      .eq('video_id', identifier)
      .maybeSingle()

    if (!err2 && byVideoId && byVideoId.video) {
      return byVideoId as SavedVideoWithDetails
    }
  }

  // 2. Try matching by youtube_videos.youtube_video_id
  const { data: catalogVideo } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('youtube_video_id', identifier)
    .maybeSingle()

  if (catalogVideo) {
    const { data: byCatalogId, error: err3 } = await supabase
      .from('saved_videos')
      .select(`
        *,
        video:youtube_videos (*)
      `)
      .eq('user_id', userId)
      .eq('video_id', catalogVideo.id)
      .maybeSingle()

    if (!err3 && byCatalogId && byCatalogId.video) {
      return byCatalogId as SavedVideoWithDetails
    }
  }

  // 3. Lazy save fallback: If video exists in global youtube_videos catalog (e.g., from a playlist),
  // lazily create a saved_videos entry for the user so watch progress can be tracked.
  let foundCatalogVideo: YoutubeVideo | null = catalogVideo ? (catalogVideo as YoutubeVideo) : null

  if (!foundCatalogVideo && isUuid) {
    const { data: catById } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('id', identifier)
      .maybeSingle()

    if (catById) {
      foundCatalogVideo = catById as YoutubeVideo
    }
  }

  if (foundCatalogVideo) {
    const { savedVideo } = await saveVideoForUser(userId, foundCatalogVideo.id)
    return {
      ...savedVideo,
      video: foundCatalogVideo,
    }
  }

  return null
}

/**
 * Updates watch progress and status for a saved video.
 */
export async function updateWatchProgress(
  userId: string,
  savedVideoIdOrVideoId: string,
  progressSeconds: number,
  status?: VideoStatus
): Promise<SavedVideo> {
  const supabase = await createClient()
  const payload: Record<string, unknown> = {
    watch_progress_seconds: Math.max(0, Math.round(progressSeconds)),
    last_watched_at: new Date().toISOString(),
  }

  if (status) {
    payload.status = status
    payload.completed_at = status === 'completed' ? new Date().toISOString() : null
  }

  // Check if identifier is saved_video id or video_id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    savedVideoIdOrVideoId
  )

  let query = supabase
    .from('saved_videos')
    .update(payload)
    .eq('user_id', userId)

  if (isUuid) {
    query = query.or(`id.eq.${savedVideoIdOrVideoId},video_id.eq.${savedVideoIdOrVideoId}`)
  } else {
    query = query.eq('id', savedVideoIdOrVideoId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    console.error('Error updating watch progress:', error)
    throw new Error('Failed to update watch progress.')
  }

  return data as SavedVideo
}

/**
 * Removes a saved video record for a user.
 * Note: Never deletes the row from the global `youtube_videos` table.
 */
export async function removeSavedVideo(
  userId: string,
  savedVideoIdOrVideoId: string
): Promise<void> {
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    savedVideoIdOrVideoId
  )

  let query = supabase
    .from('saved_videos')
    .delete()
    .eq('user_id', userId)

  if (isUuid) {
    query = query.or(`id.eq.${savedVideoIdOrVideoId},video_id.eq.${savedVideoIdOrVideoId}`)
  } else {
    query = query.eq('id', savedVideoIdOrVideoId)
  }

  const { error } = await query

  if (error) {
    console.error('Error removing saved video:', error)
    throw new Error('Failed to remove video from your library.')
  }
}
