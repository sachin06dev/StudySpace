import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scanTimetableImage } from '@/lib/ai/timetableScanner'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase environment configuration missing' },
        { status: 500 }
      )
    }

    // Authenticate user via Bearer token or cookie session
    let token: string | undefined
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })

    let authenticated = false
    if (token) {
      const { data, error } = await supabase.auth.getUser(token)
      if (data?.user && !error) {
        authenticated = true
      }
    } else {
      // Cookie-based session fallback for web requests
      try {
        const { createClient: createServerClient } = await import('@/lib/supabase/server')
        const serverSupabase = await createServerClient()
        const { data, error } = await serverSupabase.auth.getUser()
        if (data?.user && !error) {
          authenticated = true
        }
      } catch {
        // Fall through to 401
      }
    }

    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: missing or invalid authentication token' },
        { status: 401 }
      )
    }

    // Extract multipart file
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No image file uploaded' },
        { status: 400 }
      )
    }

    // Validate size (max 10MB)
    const MAX_BYTES = 10 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate MIME type with fallback to extension for mobile clients
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    let mimeType = file.type?.toLowerCase() || ''
    if (!mimeType || mimeType === 'application/octet-stream') {
      const name = file.name?.toLowerCase() || ''
      if (name.endsWith('.png')) mimeType = 'image/png'
      else if (name.endsWith('.webp')) mimeType = 'image/webp'
      else if (name.endsWith('.heic')) mimeType = 'image/heic'
      else if (name.endsWith('.heif')) mimeType = 'image/heif'
      else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mimeType = 'image/jpeg'
    }
    if (!mimeType) mimeType = 'image/jpeg'

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only JPEG, PNG, WebP, and HEIC images are supported.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const scanResult = await scanTimetableImage(buffer, mimeType)

    return NextResponse.json({
      success: true,
      entries: scanResult.entries,
      classes: scanResult.classes,
      warnings: scanResult.warnings,
      source: scanResult.source,
      suggestedSemesterName: scanResult.suggestedSemesterName,
      rawCount: scanResult.rawCount,
      data: scanResult,
    })
  } catch (error: unknown) {
    console.error('Mobile timetable scan API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error during scan'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
