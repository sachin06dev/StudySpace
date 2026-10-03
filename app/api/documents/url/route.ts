import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createApiClient, type SupabaseClient } from '@supabase/supabase-js'
import { getDocument, getDocumentDownloadUrl } from '@/lib/data/documents'
import { isUserStorageKey } from '@/lib/storage/keys'

export async function GET(request: NextRequest) {
  try {
    let user = null
    let authenticatedClient: SupabaseClient | null = null
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
        // Cookie client fallback
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Missing document ID parameter.' },
        { status: 400 }
      )
    }

    // Verify document existence and ownership
    const doc = await getDocument(documentId, user.id, authenticatedClient)
    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found or access denied.' },
        { status: 404 }
      )
    }

    const key = doc.storage_key || doc.file_path
    if (!isUserStorageKey(key, user.id)) {
      return NextResponse.json(
        { success: false, error: 'Access denied to document file.' },
        { status: 403 }
      )
    }

    // Generate secure short-lived presigned download/view URL
    const presignedUrl = await getDocumentDownloadUrl(
      key,
      doc.storage_provider || 'r2',
      doc.file_name
    )

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        title: doc.title,
        fileName: doc.file_name,
        url: presignedUrl,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate document link.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
