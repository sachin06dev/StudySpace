import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getVideoMetadata } from '@/lib/youtube/client'
import { parseYoutubeVideoId } from '@/lib/youtube/parseUrl'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
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
