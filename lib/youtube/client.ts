/**
 * Server-only YouTube Data API v3 Client
 */

export interface YoutubeVideoMetadata {
  youtube_video_id: string
  title: string
  description: string
  thumbnail_url: string
  channel_name: string
  channel_id: string
  duration_seconds: number
}

/**
 * Parses an ISO 8601 duration string (e.g. "PT4M13S", "PT1H2M3S", "PT45S") into seconds.
 */
export function parseIsoDuration(duration: string): number {
  if (!duration) return 0

  const regex = /P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/
  const match = duration.match(regex)
  if (!match) return 0

  const weeks = parseInt(match[1] || '0', 10)
  const days = parseInt(match[2] || '0', 10)
  const hours = parseInt(match[3] || '0', 10)
  const minutes = parseInt(match[4] || '0', 10)
  const seconds = parseInt(match[5] || '0', 10)

  return weeks * 7 * 86400 + days * 86400 + hours * 3600 + minutes * 60 + seconds
}

/**
 * Formats duration in seconds into a human-readable string (e.g., "4:13" or "1:02:30").
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'

  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const paddedSecs = secs.toString().padStart(2, '0')

  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, '0')
    return `${hrs}:${paddedMins}:${paddedSecs}`
  }

  return `${mins}:${paddedSecs}`
}

/**
 * Fetches video metadata from the YouTube Data API v3 server-side.
 */
export async function getVideoMetadata(youtubeVideoId: string): Promise<YoutubeVideoMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY environment variable is not configured.')
    throw new Error('YouTube API is not configured on the server.')
  }

  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(
    youtubeVideoId
  )}&key=${apiKey}`

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
    // Next.js fetch caching: revalidate or cache as appropriate
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errorJson = await response.json()
      if (errorJson.error?.message) {
        errorDetail = errorJson.error.message
      }
    } catch {
      // Ignore JSON parse error
    }
    console.error(`YouTube API error (${response.status}):`, errorDetail)
    throw new Error(`Failed to fetch video details from YouTube: ${errorDetail}`)
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('YouTube video not found. It may be private, unlisted, or deleted.')
  }

  const item = data.items[0]
  const snippet = item.snippet || {}
  const contentDetails = item.contentDetails || {}
  const thumbnails = snippet.thumbnails || {}

  const thumbnailUrl =
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`

  const durationSeconds = parseIsoDuration(contentDetails.duration || '')

  return {
    youtube_video_id: youtubeVideoId,
    title: snippet.title || 'Untitled Video',
    description: snippet.description || '',
    thumbnail_url: thumbnailUrl,
    channel_name: snippet.channelTitle || 'Unknown Channel',
    channel_id: snippet.channelId || '',
    duration_seconds: durationSeconds,
  }
}

export interface YoutubePlaylistMetadata {
  youtube_playlist_id: string
  title: string
  description: string
  thumbnail_url: string
  channel_name: string
  channel_id: string
}

/**
 * Fetches playlist metadata from the YouTube Data API v3 server-side.
 */
export async function getPlaylistMetadata(
  youtubePlaylistId: string
): Promise<YoutubePlaylistMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY environment variable is not configured.')
    throw new Error('YouTube API is not configured on the server.')
  }

  const endpoint = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${encodeURIComponent(
    youtubePlaylistId
  )}&key=${apiKey}`

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errorJson = await response.json()
      if (errorJson.error?.message) {
        errorDetail = errorJson.error.message
      }
      if (errorJson.error?.errors?.[0]?.reason === 'quotaExceeded' || errorJson.error?.errors?.[0]?.reason === 'dailyLimitExceeded') {
        throw new Error('YouTube API daily quota exceeded. Please try again later.')
      }
      if (errorJson.error?.errors?.[0]?.reason === 'playlistNotFound' || response.status === 404) {
        throw new Error('YouTube playlist not found. It may be private, unlisted, or deleted.')
      }
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message.includes('YouTube API')) {
        throw parseErr
      }
    }
    console.error(`YouTube API error (${response.status}):`, errorDetail)
    if (response.status === 404) {
      throw new Error('YouTube playlist not found. It may be private, unlisted, or deleted.')
    }
    throw new Error(`Failed to fetch playlist details from YouTube: ${errorDetail}`)
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('YouTube playlist not found. It may be private, unlisted, or deleted.')
  }

  const item = data.items[0]
  const snippet = item.snippet || {}
  const thumbnails = snippet.thumbnails || {}

  const thumbnailUrl =
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ''

  return {
    youtube_playlist_id: youtubePlaylistId,
    title: snippet.title || 'Untitled Playlist',
    description: snippet.description || '',
    thumbnail_url: thumbnailUrl,
    channel_name: snippet.channelTitle || 'Unknown Channel',
    channel_id: snippet.channelId || '',
  }
}

/**
 * Fetches all video items in a playlist, handling pagination and batching video details for durations.
 */
export async function getPlaylistItems(
  youtubePlaylistId: string
): Promise<YoutubeVideoMetadata[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY environment variable is not configured.')
    throw new Error('YouTube API is not configured on the server.')
  }

  const rawItems: Array<{
    videoId: string
    title: string
    description: string
    thumbnailUrl: string
    channelName: string
    channelId: string
  }> = []

  let currentPageToken: string | undefined = undefined
  let hasMorePages = true
  let pageCount = 0
  const MAX_PAGES = 10 // Safety cap at 500 items to prevent server action timeout

  // 1. Paginate through all playlist items (up to 50 per page)
  while (hasMorePages && pageCount < MAX_PAGES) {
    pageCount++
    const pageParam: string = currentPageToken
      ? `&pageToken=${encodeURIComponent(currentPageToken)}`
      : ''
    const endpoint: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
      youtubePlaylistId
    )}&maxResults=50${pageParam}&key=${apiKey}`

    const response: Response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      let errorDetail = response.statusText
      try {
        const errorJson = await response.json()
        if (errorJson.error?.message) {
          errorDetail = errorJson.error.message
        }
        if (errorJson.error?.errors?.[0]?.reason === 'quotaExceeded' || errorJson.error?.errors?.[0]?.reason === 'dailyLimitExceeded') {
          throw new Error('YouTube API daily quota exceeded. Please try again later.')
        }
        if (errorJson.error?.errors?.[0]?.reason === 'playlistNotFound' || response.status === 404) {
          throw new Error('YouTube playlist not found. It may be private, unlisted, or deleted.')
        }
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message.includes('YouTube API')) {
          throw parseErr
        }
      }
      console.error(`YouTube API playlistItems error (${response.status}):`, errorDetail)
      if (response.status === 404) {
        throw new Error('YouTube playlist not found. It may be private, unlisted, or deleted.')
      }
      throw new Error(`Failed to fetch playlist videos from YouTube: ${errorDetail}`)
    }

    interface PlaylistItemResponse {
      snippet?: {
        title?: string
        description?: string
        channelTitle?: string
        channelId?: string
        videoOwnerChannelTitle?: string
        videoOwnerChannelId?: string
        thumbnails?: {
          maxres?: { url: string }
          standard?: { url: string }
          high?: { url: string }
          medium?: { url: string }
          default?: { url: string }
        }
        resourceId?: { videoId?: string }
      }
      contentDetails?: {
        videoId?: string
      }
    }

    const data: { items?: PlaylistItemResponse[]; nextPageToken?: string } = await response.json()

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const snippet = item.snippet || {}
        const videoId =
          item.contentDetails?.videoId || snippet.resourceId?.videoId

        // Skip items without a valid videoId or private/deleted video placeholders
        if (
          !videoId ||
          snippet.title === 'Private video' ||
          snippet.title === 'Deleted video'
        ) {
          continue
        }

        const thumbnails = snippet.thumbnails || {}
        const thumbnailUrl =
          thumbnails.maxres?.url ||
          thumbnails.standard?.url ||
          thumbnails.high?.url ||
          thumbnails.medium?.url ||
          thumbnails.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

        rawItems.push({
          videoId,
          title: snippet.title || 'Untitled Video',
          description: snippet.description || '',
          thumbnailUrl,
          channelName:
            snippet.videoOwnerChannelTitle ||
            snippet.channelTitle ||
            'Unknown Channel',
          channelId: snippet.videoOwnerChannelId || snippet.channelId || '',
        })
      }
    }

    if (data.nextPageToken) {
      currentPageToken = data.nextPageToken
    } else {
      hasMorePages = false
    }
  }

  if (rawItems.length === 0) {
    return []
  }

  // 2. Batch fetch video durations and full metadata via videos.list in chunks of 50
  const videoDetailsMap = new Map<
    string,
    {
      durationSeconds: number
      title?: string
      description?: string
      thumbnailUrl?: string
      channelName?: string
      channelId?: string
    }
  >()

  const uniqueVideoIds = Array.from(new Set(rawItems.map((r) => r.videoId)))
  const CHUNK_SIZE = 50

  for (let i = 0; i < uniqueVideoIds.length; i += CHUNK_SIZE) {
    const chunk = uniqueVideoIds.slice(i, i + CHUNK_SIZE)
    const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(
      chunk.join(',')
    )}&key=${apiKey}`

    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.items && Array.isArray(data.items)) {
          for (const vItem of data.items) {
            const vSnippet = vItem.snippet || {}
            const vContent = vItem.contentDetails || {}
            const vThumbnails = vSnippet.thumbnails || {}

            const thumb =
              vThumbnails.maxres?.url ||
              vThumbnails.standard?.url ||
              vThumbnails.high?.url ||
              vThumbnails.medium?.url ||
              vThumbnails.default?.url ||
              `https://i.ytimg.com/vi/${vItem.id}/hqdefault.jpg`

            const dur = parseIsoDuration(vContent.duration || '')

            videoDetailsMap.set(vItem.id, {
              durationSeconds: dur,
              title: vSnippet.title,
              description: vSnippet.description,
              thumbnailUrl: thumb,
              channelName: vSnippet.channelTitle,
              channelId: vSnippet.channelId,
            })
          }
        }
      }
    } catch (err) {
      console.error('Error fetching video chunk details:', err)
      // Non-fatal: fallback to playlistItem snippet details
    }
  }

  // 3. Construct ordered list of YoutubeVideoMetadata
  const result: YoutubeVideoMetadata[] = rawItems.map((item) => {
    const details = videoDetailsMap.get(item.videoId)
    return {
      youtube_video_id: item.videoId,
      title: details?.title || item.title,
      description: details?.description || item.description,
      thumbnail_url: details?.thumbnailUrl || item.thumbnailUrl,
      channel_name: details?.channelName || item.channelName,
      channel_id: details?.channelId || item.channelId,
      duration_seconds: details?.durationSeconds || 0,
    }
  })

  return result
}

