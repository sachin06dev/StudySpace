import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createApiClient, type SupabaseClient } from '@supabase/supabase-js'
import { getVideoMetadata } from '@/lib/youtube/client'
import { parseYoutubeVideoId } from '@/lib/youtube/parseUrl'

export async function GET(request: NextRequest) {
  try {
    let user = null
    const authHeader = request.headers.get('Authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createApiClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
        })
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data?.user) {
          user = data.user
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

    const { searchParams } = new URL(request.url)
    const rawIdOrUrl = searchParams.get('id') || searchParams.get('url')

    if (!rawIdOrUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing YouTube video ID or URL query parameter.' },
        { status: 400 }
      )
    }

    const videoId = parseYoutubeVideoId(rawIdOrUrl)
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube video ID or URL format.' },
        { status: 400 }
      )
    }

    const metadata = await getVideoMetadata(videoId)

    return NextResponse.json({
      success: true,
      data: metadata,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch video metadata.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

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
        { success: false, error: 'Missing YouTube URL in request body.' },
        { status: 400 }
      )
    }

    const videoId = parseYoutubeVideoId(rawUrl)
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube video URL format.' },
        { status: 400 }
      )
    }

    const metadata = await getVideoMetadata(videoId)
    const { findOrCreateYoutubeVideo, saveVideoForUser } = await import('@/lib/data/videos')
    const catalogVideo = await findOrCreateYoutubeVideo(metadata, authenticatedClient)
    const { savedVideo, isNew } = await saveVideoForUser(user.id, catalogVideo.id, authenticatedClient)

    if (!isNew) {
      return NextResponse.json(
        {
          success: false,
          alreadySaved: true,
          error: 'This video is already in your library.',
          data: {
            video: catalogVideo,
            savedVideo,
            isNew: false,
          },
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        video: catalogVideo,
        savedVideo,
        isNew,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save video.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

