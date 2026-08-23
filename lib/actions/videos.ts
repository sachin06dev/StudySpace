'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseYoutubeVideoId } from '@/lib/youtube/parseUrl'
import { getVideoMetadata } from '@/lib/youtube/client'
import {
  findOrCreateYoutubeVideo,
  saveVideoForUser,
  getSavedVideo,
  removeSavedVideo,
  updateWatchProgress,
  type SavedVideo,
  type SavedVideoWithDetails,
  type VideoStatus,
} from '@/lib/data/videos'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
  alreadySaved?: boolean
}

/**
 * Server action to save a YouTube video by URL or video ID.
 */
export async function saveVideo(url: string): Promise<ActionResult<SavedVideoWithDetails>> {
  try {
    const trimmedUrl = url ? url.trim() : ''
    if (!trimmedUrl) {
      return { success: false, error: 'Please enter a YouTube video URL.' }
    }

    // 1. Parse YouTube video ID
    const youtubeVideoId = parseYoutubeVideoId(trimmedUrl)
    if (!youtubeVideoId) {
      return {
        success: false,
        error: 'Invalid YouTube URL. Please provide a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...).',
      }
    }

    // 2. Auth check
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // 3. Fetch metadata from YouTube API
    let metadata
    try {
      metadata = await getVideoMetadata(youtubeVideoId)
    } catch (apiErr: unknown) {
      const errMsg =
        apiErr instanceof Error
          ? apiErr.message
          : 'Could not fetch video details from YouTube.'
      return { success: false, error: errMsg }
    }

    // 4. Find or create in global catalog
    const video = await findOrCreateYoutubeVideo(metadata)

    // 5. Save to user library
    const { savedVideo, isNew } = await saveVideoForUser(user.id, video.id)

    if (!isNew) {
      return {
        success: false,
        alreadySaved: true,
        error: 'This video is already in your library.',
        data: { ...savedVideo, video },
      }
    }

    // 6. Revalidate cache
    revalidatePath('/videos')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { ...savedVideo, video },
    }
  } catch (err: unknown) {
    console.error('Error in saveVideo action:', err)
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { success: false, error: message }
  }
}

/**
 * Server action to remove a video from user's library.
 */
export async function removeVideo(videoId: string): Promise<ActionResult> {
  try {
    if (!videoId) {
      return { success: false, error: 'Video ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    await removeSavedVideo(user.id, videoId)

    revalidatePath('/videos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: unknown) {
    console.error('Error in removeVideo action:', err)
    const message = err instanceof Error ? err.message : 'Failed to remove video.'
    return { success: false, error: message }
  }
}

/**
 * Server action to update watch progress and automatically transition video status.
 * (e.g. saved -> in_progress, and near end (~95%) -> completed).
 * Note: If video is already marked completed, it preserves completed status.
 */
export async function updateProgress(
  videoId: string,
  progressSeconds: number,
  durationSeconds?: number
): Promise<ActionResult<SavedVideo>> {
  try {
    if (!videoId) {
      return { success: false, error: 'Video ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const safeProgress = Math.max(0, Math.round(progressSeconds))

    // Fetch existing video status so we never inadvertently revert 'completed' to 'in_progress'
    const existing = await getSavedVideo(user.id, videoId)
    if (!existing) {
      return { success: false, error: 'Saved video not found.' }
    }

    let newStatus: VideoStatus = existing.status

    // Only transition if not already completed
    if (existing.status !== 'completed') {
      if (durationSeconds && durationSeconds > 0) {
        if (safeProgress / durationSeconds >= 0.95) {
          newStatus = 'completed'
        } else if (safeProgress > 0) {
          newStatus = 'in_progress'
        }
      } else if (safeProgress > 0) {
        newStatus = 'in_progress'
      }
    }

    const updated = await updateWatchProgress(
      user.id,
      existing.id,
      safeProgress,
      newStatus
    )

    revalidatePath('/videos')
    revalidatePath('/playlists')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')

    return { success: true, data: updated }
  } catch (err: unknown) {
    console.error('Error in updateProgress action:', err)
    const message = err instanceof Error ? err.message : 'Failed to update watch progress.'
    return { success: false, error: message }
  }
}

/**
 * Server action to manually mark or toggle a video as completed/watched.
 */
export async function markVideoCompleted(
  videoId: string,
  completed?: boolean
): Promise<ActionResult<SavedVideo>> {
  try {
    if (!videoId) {
      return { success: false, error: 'Video ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const savedVideo = await getSavedVideo(user.id, videoId)
    if (!savedVideo) {
      return { success: false, error: 'Saved video not found.' }
    }

    const willBeCompleted =
      completed !== undefined ? completed : savedVideo.status !== 'completed'

    const targetStatus: VideoStatus = willBeCompleted ? 'completed' : 'in_progress'
    const targetProgress = willBeCompleted
      ? savedVideo.video.duration_seconds || savedVideo.watch_progress_seconds
      : savedVideo.watch_progress_seconds

    const updated = await updateWatchProgress(
      user.id,
      savedVideo.id,
      targetProgress,
      targetStatus
    )

    revalidatePath('/videos')
    revalidatePath('/playlists')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')
    revalidatePath(`/videos/${videoId}`)
    revalidatePath(`/videos/${savedVideo.id}`)
    revalidatePath(`/videos/${savedVideo.video.youtube_video_id}`)

    return { success: true, data: updated }
  } catch (err: unknown) {
    console.error('Error in markVideoCompleted action:', err)
    const message = err instanceof Error ? err.message : 'Failed to update video status.'
    return { success: false, error: message }
  }
}

/**
 * Alias for updateProgress to preserve compatibility with existing callers.
 */
export async function updateWatchProgressAction(
  videoId: string,
  progressSeconds: number
): Promise<ActionResult<SavedVideo>> {
  return updateProgress(videoId, progressSeconds)
}
