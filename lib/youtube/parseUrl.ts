/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats or raw ID.
 * Returns null if the input is not a valid YouTube video URL or ID.
 */
export function parseYoutubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null

  // If already a valid 11-character YouTube video ID (letters, numbers, hyphen, underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  try {
    const urlString =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`

    const url = new URL(urlString)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '')

    // Handle youtube.com or music.youtube.com
    if (hostname === 'youtube.com' || hostname === 'music.youtube.com') {
      // 1. /watch?v=VIDEO_ID
      const v = url.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v
      }

      // 2. /embed/VIDEO_ID, /v/VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (['embed', 'v', 'shorts', 'live'].includes(pathParts[0]) && pathParts[1]) {
        if (/^[a-zA-Z0-9_-]{11}$/.test(pathParts[1])) {
          return pathParts[1]
        }
      }
    }

    // Handle youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (pathParts[0] && /^[a-zA-Z0-9_-]{11}$/.test(pathParts[0])) {
        return pathParts[0]
      }
    }
  } catch {
    // If URL parsing throws, fallback to regex
  }

  // Regex fallback matching standard YouTube ID patterns in URLs
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = trimmed.match(regex)
  if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
    return match[1]
  }

  return null
}

/**
 * Extracts the YouTube playlist ID from various YouTube URL formats or raw playlist ID.
 * Returns null if the input is not a valid YouTube playlist URL or ID.
 */
export function parseYoutubePlaylistId(input: string): string | null {
  if (!input || typeof input !== 'string') return null
  // Strip whitespace, surrounding quotes, and angle brackets
  const trimmed = input.trim().replace(/^[<"']+|[>"']+$/g, '').trim()
  if (!trimmed) return null

  // If already a raw playlist ID (e.g. PL..., UU..., FL..., RD..., OLAK5uy_..., or 10-100 char ID)
  if (
    /^[a-zA-Z0-9_-]{10,100}$/.test(trimmed) &&
    !trimmed.includes('/') &&
    !trimmed.includes('?') &&
    !trimmed.includes('&') &&
    !trimmed.includes('=') &&
    !trimmed.includes('.')
  ) {
    return trimmed
  }

  try {
    const urlString =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`

    const url = new URL(urlString)
    const listParam = url.searchParams.get('list')
    if (listParam && /^[a-zA-Z0-9_-]{2,100}$/.test(listParam.trim())) {
      return listParam.trim()
    }

    // Handle pathname like /playlist/PLAYLIST_ID
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts[0] === 'playlist' && pathParts[1] && /^[a-zA-Z0-9_-]{2,100}$/.test(pathParts[1])) {
      return pathParts[1]
    }
  } catch {
    // If URL parsing throws, fallback to regex
  }

  // Regex fallback matching 'list=' parameter in any YouTube URL variant
  const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]{2,100})/i)
  if (listMatch && listMatch[1]) {
    return listMatch[1]
  }

  return null
}

