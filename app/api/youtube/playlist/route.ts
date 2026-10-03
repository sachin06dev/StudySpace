import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createApiClient, type SupabaseClient } from '@supabase/supabase-js'
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
} from '@/lib/data/playlists'

export async function POST(request: NextRequest) {
  try {
    let user = null
    let authenticatedClient: SupabaseClient | undefined = undefined
    const authHeader = request.headers.get('Authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createApiClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        })
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data?.user) {
          user = data.user
          authenticatedClient = supabase
        }
      }
    }

    if (!user) {
      try {
        const supabase = await createServerClient()
        const {
          data: { user: cookieUser },
          error: authError,
        } = await supabase.auth.getUser()
        if (!authError && cookieUser) {
          user = cookieUser
          authenticatedClient = supabase
        }
      } catch {
        // Fallback failed
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const rawUrl = body.url

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing YouTube playlist URL in request body.' },
        { status: 400 }
      )
    }

    const youtubePlaylistId = parseYoutubePlaylistId(rawUrl)
    if (!youtubePlaylistId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube playlist URL or ID format.' },
        { status: 400 }
      )
    }

    let playlistItems: YoutubeVideoMetadata[] = []
    try {
      playlistItems = await getPlaylistItems(youtubePlaylistId)
    } catch (apiErr: unknown) {
      const errMsg =
        apiErr instanceof Error
          ? apiErr.message
          : 'Could not fetch playlist videos from YouTube.'
      return NextResponse.json({ success: false, error: errMsg }, { status: 400 })
    }

    let playlistMeta: YoutubePlaylistMetadata
    try {
      playlistMeta = await getPlaylistMetadata(youtubePlaylistId)
    } catch {
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

    if (!playlistMeta.thumbnail_url && playlistItems.length > 0) {
      playlistMeta.thumbnail_url = playlistItems[0].thumbnail_url || ''
    }

    const playlist = await findOrCreateYoutubePlaylist(playlistMeta, authenticatedClient)
    await syncPlaylistItems(playlist.id, playlistItems, authenticatedClient)
    const { savedPlaylist, isNew } = await savePlaylistForUser(user.id, playlist.id, authenticatedClient)

    if (!isNew) {
      return NextResponse.json(
        {
          success: false,
          alreadySaved: true,
          error: 'This playlist is already in your library.',
          data: {
            playlist,
            savedPlaylist,
            isNew: false,
          },
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        playlist,
        savedPlaylist,
        isNew,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save playlist.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
