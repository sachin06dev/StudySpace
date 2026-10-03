import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createApiClient, type SupabaseClient } from '@supabase/supabase-js'
import { createDocument, getDocuments } from '@/lib/data/documents'

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
        // Cookie fallback
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const docs = await getDocuments(user.id, authenticatedClient)
    return NextResponse.json({ success: true, data: docs })
  } catch (error: unknown) {
    console.error('Error fetching documents via API:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch documents.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const {
      id,
      title,
      fileName,
      storageKey,
      fileSizeBytes,
      mimeType,
      category,
      description,
      storageProvider,
    } = body

    if (!id || !fileName || !storageKey || !fileSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'Missing required document fields.' },
        { status: 400 }
      )
    }

    // Security check: ensure storageKey belongs to current user
    if (!storageKey.startsWith(`users/${user.id}/`)) {
      return NextResponse.json(
        { success: false, error: 'Invalid storage key ownership.' },
        { status: 403 }
      )
    }

    const createdDoc = await createDocument({
      id,
      userId: user.id,
      title: title || fileName,
      description: description || null,
      fileName,
      storageKey,
      storageProvider: storageProvider || 'r2',
      mimeType: mimeType || 'application/pdf',
      fileSizeBytes,
      category: category || 'other',
    }, authenticatedClient)

    return NextResponse.json({ success: true, data: createdDoc })
  } catch (error: unknown) {
    console.error('Error creating document metadata via API:', error)
    const message = error instanceof Error ? error.message : 'Failed to save document metadata.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
