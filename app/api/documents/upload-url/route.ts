import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createApiClient } from '@supabase/supabase-js'
import { getPresignedUploadUrl } from '@/lib/storage/r2'
import { generateDocumentStorageKey } from '@/lib/storage/keys'

const MOBILE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB strict limit for mobile

export async function POST(request: NextRequest) {
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
        // Cookie fallback
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fileName, fileSizeBytes, mimeType } = body

    if (!fileName || typeof fileName !== 'string' || !fileName.trim()) {
      return NextResponse.json(
        { success: false, error: 'File name is required.' },
        { status: 400 }
      )
    }

    // Strictly enforce PDF file format on mobile
    const lowerName = fileName.trim().toLowerCase()
    if (!lowerName.endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF documents (.pdf) are supported for mobile document upload.' },
        { status: 400 }
      )
    }

    if (!fileSizeBytes || typeof fileSizeBytes !== 'number' || fileSizeBytes <= 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot upload an empty file (0 bytes).' },
        { status: 400 }
      )
    }

    // Strictly enforce 10 MB mobile limit
    if (fileSizeBytes > MOBILE_MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mobile PDF uploads are limited to 10 MB. Please choose a smaller file.',
        },
        { status: 400 }
      )
    }

    // Generate unique document UUID and user-scoped storage key
    const documentId = crypto.randomUUID()
    const storageKey = generateDocumentStorageKey(user.id, documentId, fileName.trim())

    // Generate presigned PUT URL valid for 10 minutes
    const contentType = mimeType || 'application/pdf'
    const uploadUrl = await getPresignedUploadUrl(storageKey, contentType, 600)

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        uploadUrl,
        storageKey,
        storageProvider: 'r2',
      },
    })
  } catch (error: unknown) {
    console.error('Error generating presigned upload URL for mobile:', error)
    const message = error instanceof Error ? error.message : 'Failed to authorize document upload.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
