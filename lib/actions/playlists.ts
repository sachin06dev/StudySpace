'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseYoutubePlaylistId } from '@/lib/youtube/parseUrl'
import {
  getPlaylistMetadata,
  getPlaylistItems,
  type YoutubePlaylistMetadata,
  type YoutubeVideoMetadata,
} from '@/lib/youtube/client'
import {
  findOrCreateYoutubePlaylist,
  savePlaylistForUser,
  syncPlaylistItems,
  removeSavedPlaylist,
  type SavedPlaylistWithDetails,
} from '@/lib/data/playlists'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
  alreadySaved?: boolean
}

/**
 * Server action to save a YouTube playlist by URL or playlist ID.
 */
export async function savePlaylist(
  url: string
): Promise<ActionResult<SavedPlaylistWithDetails>> {
  try {
    const trimmedUrl = url ? url.trim() : ''
    if (!trimmedUrl) {
      return { success: false, error: 'Please enter a YouTube playlist URL.' }
    }

    // 1. Parse YouTube playlist ID
    const youtubePlaylistId = parseYoutubePlaylistId(trimmedUrl)
    if (!youtubePlaylistId) {
      return {
        success: false,
        error:
          'Invalid YouTube playlist URL. Please provide a valid playlist link (e.g., youtube.com/playlist?list=... or a URL with &list=...).',
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

    // 3. Fetch playlist videos and metadata from YouTube API
    let playlistItems: YoutubeVideoMetadata[] = []
    try {
      playlistItems = await getPlaylistItems(youtubePlaylistId)
    } catch (apiErr: unknown) {
      const errMsg =
        apiErr instanceof Error
          ? apiErr.message
          : 'Could not fetch playlist videos from YouTube.'
      return { success: false, error: errMsg }
    }

    let playlistMeta: YoutubePlaylistMetadata
    try {
      playlistMeta = await getPlaylistMetadata(youtubePlaylistId)
    } catch {
      // Fallback for auto-generated / unlisted / topic playlists where playlists.list endpoint fails
      const firstItem = playlistItems[0]
      playlistMeta = {
        youtube_playlist_id: youtubePlaylistId,
        title: firstItem ? `${firstItem.channel_name || 'YouTube'} Playlist` : 'YouTube Playlist',
        description: '',
        thumbnail_url: firstItem?.thumbnail_url || '',
        channel_name: firstItem?.channel_name || 'YouTube Channel',
        channel_id: firstItem?.channel_id || '',
      }
    }

    // Ensure thumbnail fallback if metadata has none
    if (!playlistMeta.thumbnail_url && playlistItems.length > 0) {
      playlistMeta.thumbnail_url = playlistItems[0].thumbnail_url || ''
    }

    // 4. Find or create playlist in global catalog
    const playlist = await findOrCreateYoutubePlaylist(playlistMeta)

    // 5. Sync playlist items (catalog videos and link to playlist_items)
    await syncPlaylistItems(playlist.id, playlistItems)

    // 6. Save playlist to user's personal library
    const { savedPlaylist, isNew } = await savePlaylistForUser(user.id, playlist.id)

    const resultData: SavedPlaylistWithDetails = {
      ...savedPlaylist,
      playlist,
      video_count: playlistItems.length,
    }

    if (!isNew) {
      return {
        success: false,
        alreadySaved: true,
        error: 'This playlist is already in your library.',
        data: resultData,
      }
    }

    // 7. Revalidate cache
    revalidatePath('/playlists')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')

    return {
      success: true,
      data: resultData,
    }
  } catch (err: unknown) {
    console.error('Error in savePlaylist action:', err)
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { success: false, error: message }
  }
}

/**
 * Server action to remove a playlist from user's library.
 */
export async function removePlaylist(playlistId: string): Promise<ActionResult> {
  try {
    if (!playlistId) {
      return { success: false, error: 'Playlist ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    await removeSavedPlaylist(user.id, playlistId)

    revalidatePath('/playlists')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')

    return { success: true }
  } catch (err: unknown) {
    console.error('Error in removePlaylist action:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to remove playlist.'
    return { success: false, error: message }
  }
}
