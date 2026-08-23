import { createClient } from '@/lib/supabase/server'
import type { YoutubePlaylistMetadata, YoutubeVideoMetadata } from '@/lib/youtube/client'
import {
  findOrCreateYoutubeVideo,
  type YoutubeVideo,
  type SavedVideo,
  type SavedVideoWithDetails,
} from '@/lib/data/videos'

export interface YoutubePlaylist {
  id: string
  youtube_playlist_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  channel_name: string | null
  channel_id: string | null
  created_at?: string
}

export interface SavedPlaylist {
  id: string
  user_id: string
  playlist_id: string
  saved_at: string
  last_accessed_at: string | null
  created_at?: string
}

export interface PlaylistItem {
  id: string
  playlist_id: string
  video_id: string
  position: number
  added_at: string
  created_at?: string
}

export interface SavedPlaylistWithDetails extends SavedPlaylist {
  playlist: YoutubePlaylist
  video_count: number
}

export interface PlaylistItemWithVideo {
  id: string
  playlist_id: string
  video_id: string
  position: number
  added_at: string
  video: YoutubeVideo
  savedVideo: SavedVideoWithDetails
}

export interface PlaylistWithItems {
  playlist: YoutubePlaylist
  isSavedByUser: boolean
  savedPlaylistId: string | null
  saved_at: string | null
  items: PlaylistItemWithVideo[]
  video_count: number
}

/**
 * Finds an existing playlist in the global `youtube_playlists` catalog or creates one.
 */
export async function findOrCreateYoutubePlaylist(
  metadata: YoutubePlaylistMetadata
): Promise<YoutubePlaylist> {
  const supabase = await createClient()

  // 1. Check if it already exists
  const { data: existing, error: findError } = await supabase
    .from('youtube_playlists')
    .select('*')
    .eq('youtube_playlist_id', metadata.youtube_playlist_id)
    .maybeSingle()

  if (findError) {
    console.error('Error finding youtube playlist:', findError)
  }

  if (existing) {
    return existing as YoutubePlaylist
  }

  // 2. Insert into global catalog
  const { data: inserted, error: insertError } = await supabase
    .from('youtube_playlists')
    .insert({
      youtube_playlist_id: metadata.youtube_playlist_id,
      title: metadata.title,
      description: metadata.description || null,
      thumbnail_url: metadata.thumbnail_url || null,
      channel_name: metadata.channel_name || null,
      channel_id: metadata.channel_id || null,
    })
    .select()
    .single()

  if (insertError) {
    // If unique constraint violated (concurrent insert race condition)
    if (insertError.code === '23505') {
      const { data: retryExisting, error: retryError } = await supabase
        .from('youtube_playlists')
        .select('*')
        .eq('youtube_playlist_id', metadata.youtube_playlist_id)
        .single()

      if (retryError || !retryExisting) {
        console.error('Error re-fetching youtube playlist after conflict:', retryError)
        throw new Error('Failed to retrieve playlist from catalog.')
      }

      return retryExisting as YoutubePlaylist
    }

    console.error('Error creating youtube playlist record:', insertError)
    throw new Error('Failed to save playlist to global catalog.')
  }

  return inserted as YoutubePlaylist
}

/**
 * Saves a playlist for a user in `saved_playlists`.
 * If already saved, returns `isNew: false` without throwing.
 */
export async function savePlaylistForUser(
  userId: string,
  playlistId: string
): Promise<{ savedPlaylist: SavedPlaylist; isNew: boolean }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('saved_playlists')
    .insert({
      user_id: userId,
      playlist_id: playlistId,
    })
    .select()
    .single()

  if (error) {
    // Unique constraint violation (already saved)
    if (error.code === '23505') {
      const { data: existing, error: fetchError } = await supabase
        .from('saved_playlists')
        .select('*')
        .eq('user_id', userId)
        .eq('playlist_id', playlistId)
        .single()

      if (fetchError || !existing) {
        console.error('Error fetching existing saved playlist:', fetchError)
        throw new Error('This playlist is already in your library.')
      }

      return { savedPlaylist: existing as SavedPlaylist, isNew: false }
    }

    console.error('Error saving playlist for user:', error)
    throw new Error('Failed to save playlist to library.')
  }

  return { savedPlaylist: data as SavedPlaylist, isNew: true }
}

/**
 * Syncs videos into `youtube_videos` and upserts them into `playlist_items` with positions.
 * Handles re-syncing safely without blowing up on unique constraints.
 */
export async function syncPlaylistItems(
  playlistId: string,
  videos: YoutubeVideoMetadata[]
): Promise<void> {
  const supabase = await createClient()

  if (!videos || videos.length === 0) {
    return
  }

  // 1. Collect unique YouTube video IDs
  const uniqueMetaList: YoutubeVideoMetadata[] = []
  const seenYtIds = new Set<string>()
  for (const v of videos) {
    if (v.youtube_video_id && !seenYtIds.has(v.youtube_video_id)) {
      seenYtIds.add(v.youtube_video_id)
      uniqueMetaList.push(v)
    }
  }

  const allYtIds = uniqueMetaList.map((v) => v.youtube_video_id)
  const videoCatalogMap = new Map<string, YoutubeVideo>()

  // 2. Batch check existing videos in youtube_videos in chunks of 50
  const CHUNK_SIZE = 50
  for (let i = 0; i < allYtIds.length; i += CHUNK_SIZE) {
    const chunkIds = allYtIds.slice(i, i + CHUNK_SIZE)
    const { data: existing, error: fetchErr } = await supabase
      .from('youtube_videos')
      .select('*')
      .in('youtube_video_id', chunkIds)

    if (!fetchErr && existing) {
      for (const row of existing) {
        videoCatalogMap.set(row.youtube_video_id, row as YoutubeVideo)
      }
    }
  }

  // 3. Identify missing videos and batch insert them
  const missingVideos = uniqueMetaList.filter((v) => !videoCatalogMap.has(v.youtube_video_id))
  if (missingVideos.length > 0) {
    for (let i = 0; i < missingVideos.length; i += CHUNK_SIZE) {
      const chunkMeta = missingVideos.slice(i, i + CHUNK_SIZE)
      const insertPayload = chunkMeta.map((m) => ({
        youtube_video_id: m.youtube_video_id,
        title: m.title,
        channel_name: m.channel_name || null,
        thumbnail_url: m.thumbnail_url || null,
        duration_seconds: m.duration_seconds || null,
      }))

      const { data: inserted, error: insertErr } = await supabase
        .from('youtube_videos')
        .upsert(insertPayload, { onConflict: 'youtube_video_id' })
        .select()

      if (!insertErr && inserted) {
        for (const row of inserted) {
          videoCatalogMap.set(row.youtube_video_id, row as YoutubeVideo)
        }
      } else if (insertErr) {
        console.error('Error batch inserting youtube_videos:', insertErr)
        // Fallback to individual insert
        for (const m of chunkMeta) {
          try {
            const v = await findOrCreateYoutubeVideo(m)
            videoCatalogMap.set(m.youtube_video_id, v)
          } catch (e) {
            console.error(`Failed to catalog video ${m.youtube_video_id}:`, e)
          }
        }
      }
    }
  }

  // 4. Map original playlist items to catalog videos and deduplicate (playlist_id, video_id)
  const seenVideoIds = new Set<string>()
  const playlistItemsPayload: Array<{ playlist_id: string; video_id: string; position: number }> = []

  let pos = 0
  for (const vMeta of videos) {
    const catalogVideo = videoCatalogMap.get(vMeta.youtube_video_id)
    if (catalogVideo && !seenVideoIds.has(catalogVideo.id)) {
      seenVideoIds.add(catalogVideo.id)
      playlistItemsPayload.push({
        playlist_id: playlistId,
        video_id: catalogVideo.id,
        position: pos++,
      })
    }
  }

  if (playlistItemsPayload.length === 0) {
    return
  }

  // 5. Batch upsert playlist items in chunks of 50
  for (let i = 0; i < playlistItemsPayload.length; i += CHUNK_SIZE) {
    const chunk = playlistItemsPayload.slice(i, i + CHUNK_SIZE)
    const { error: upsertErr } = await supabase
      .from('playlist_items')
      .upsert(chunk, {
        onConflict: 'playlist_id,video_id',
        ignoreDuplicates: true,
      })

    if (upsertErr) {
      console.error('Error upserting playlist items chunk:', upsertErr)
      throw new Error(`Failed to sync playlist items: ${upsertErr.message || 'Database error'}`)
    }
  }
}

/**
 * Fetches all saved playlists for a user with joined catalog details and video counts.
 */
export async function getSavedPlaylists(
  userId: string
): Promise<SavedPlaylistWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('saved_playlists')
    .select(`
      *,
      playlist:youtube_playlists (*)
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved playlists:', error)
    throw new Error('Failed to fetch saved playlists.')
  }

  if (!data || data.length === 0) {
    return []
  }

  // Fetch video count for each playlist
  const playlistIds = data.map((item) => item.playlist_id).filter(Boolean)
  const countMap = new Map<string, number>()

  if (playlistIds.length > 0) {
    const { data: itemsData, error: itemsError } = await supabase
      .from('playlist_items')
      .select('playlist_id')
      .in('playlist_id', playlistIds)

    if (!itemsError && itemsData) {
      for (const item of itemsData) {
        countMap.set(item.playlist_id, (countMap.get(item.playlist_id) || 0) + 1)
      }
    }
  }

  return data
    .filter((item) => item.playlist)
    .map((item) => ({
      ...item,
      video_count: countMap.get(item.playlist_id) || 0,
    })) as SavedPlaylistWithDetails[]
}

/**
 * Fetches a playlist with all its items in order, along with user watch progress for each video.
 */
export async function getPlaylistWithItems(
  userId: string,
  identifier: string
): Promise<PlaylistWithItems | null> {
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    identifier
  )

  // 1. Find the playlist record in youtube_playlists or via saved_playlists
  let playlist: YoutubePlaylist | null = null
  let savedPlaylist: SavedPlaylist | null = null

  if (isUuid) {
    // Check by youtube_playlists.id
    const { data: pById } = await supabase
      .from('youtube_playlists')
      .select('*')
      .eq('id', identifier)
      .maybeSingle()

    if (pById) {
      playlist = pById as YoutubePlaylist
    } else {
      // Check by saved_playlists.id
      const { data: sById } = await supabase
        .from('saved_playlists')
        .select(`*, playlist:youtube_playlists(*)`)
        .eq('id', identifier)
        .eq('user_id', userId)
        .maybeSingle()

      if (sById && sById.playlist) {
        playlist = sById.playlist as YoutubePlaylist
        savedPlaylist = sById as SavedPlaylist
      }
    }
  }

  if (!playlist) {
    // Check by youtube_playlist_id
    const { data: pByYtId } = await supabase
      .from('youtube_playlists')
      .select('*')
      .eq('youtube_playlist_id', identifier)
      .maybeSingle()

    if (pByYtId) {
      playlist = pByYtId as YoutubePlaylist
    }
  }

  if (!playlist) {
    return null
  }

  // Check if user has saved this playlist if not already checked
  if (!savedPlaylist) {
    const { data: sRow } = await supabase
      .from('saved_playlists')
      .select('*')
      .eq('user_id', userId)
      .eq('playlist_id', playlist.id)
      .maybeSingle()

    if (sRow) {
      savedPlaylist = sRow as SavedPlaylist
    }
  }

  // 2. Fetch playlist items in order
  const { data: itemsData, error: itemsError } = await supabase
    .from('playlist_items')
    .select(`
      *,
      video:youtube_videos (*)
    `)
    .eq('playlist_id', playlist.id)
    .order('position', { ascending: true })

  if (itemsError) {
    console.error('Error fetching playlist items:', itemsError)
    throw new Error('Failed to fetch playlist items.')
  }

  const validItems = (itemsData || []).filter((item) => item.video)
  const videoIds = validItems.map((item) => item.video_id)

  // 3. Fetch user's saved_videos for these video IDs to show progress
  const savedVideosMap = new Map<string, SavedVideo>()
  if (videoIds.length > 0) {
    const { data: userSavedVideos } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('user_id', userId)
      .in('video_id', videoIds)

    if (userSavedVideos) {
      for (const sv of userSavedVideos) {
        savedVideosMap.set(sv.video_id, sv as SavedVideo)
      }
    }
  }

  // 4. Map items with full video details and user saved status
  const mappedItems: PlaylistItemWithVideo[] = validItems.map((item) => {
    const video = item.video as YoutubeVideo
    const userSaved = savedVideosMap.get(video.id)

    const savedVideoDetails: SavedVideoWithDetails = userSaved
      ? {
          ...userSaved,
          status:
            userSaved.status === 'completed'
              ? 'completed'
              : userSaved.status === 'in_progress' || userSaved.watch_progress_seconds > 0
              ? 'in_progress'
              : 'not_started',
          video,
        }
      : {
          id: video.id,
          user_id: userId,
          video_id: video.id,
          status: 'not_started',
          saved_at: item.added_at || new Date().toISOString(),
          last_watched_at: null,
          completed_at: null,
          watch_progress_seconds: 0,
          video,
        }

    return {
      id: item.id,
      playlist_id: item.playlist_id,
      video_id: item.video_id,
      position: item.position,
      added_at: item.added_at,
      video,
      savedVideo: savedVideoDetails,
    }
  })

  return {
    playlist,
    isSavedByUser: !!savedPlaylist,
    savedPlaylistId: savedPlaylist?.id || null,
    saved_at: savedPlaylist?.saved_at || null,
    items: mappedItems,
    video_count: mappedItems.length,
  }
}

/**
 * Removes a saved playlist record for a user.
 * Never deletes the global `youtube_playlists` or `playlist_items` rows.
 */
export async function removeSavedPlaylist(
  userId: string,
  playlistId: string
): Promise<void> {
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    playlistId
  )

  let query = supabase
    .from('saved_playlists')
    .delete()
    .eq('user_id', userId)

  if (isUuid) {
    query = query.or(`id.eq.${playlistId},playlist_id.eq.${playlistId}`)
  } else {
    // If a YouTube string ID was passed, find the playlist UUID
    const { data: pRow } = await supabase
      .from('youtube_playlists')
      .select('id')
      .eq('youtube_playlist_id', playlistId)
      .maybeSingle()

    if (pRow) {
      query = query.eq('playlist_id', pRow.id)
    } else {
      return
    }
  }

  const { error } = await query

  if (error) {
    console.error('Error removing saved playlist:', error)
    throw new Error(`Failed to remove playlist from your library: ${error.message || 'Database error'}`)
  }
}
