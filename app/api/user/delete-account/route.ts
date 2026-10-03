import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createApiClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { listR2Objects, deleteR2Object } from '@/lib/storage/r2'

/**
 * DELETE /api/user/delete-account
 * Deletes all user data, removes storage files from Supabase and Cloudflare R2,
 * and permanently deletes the auth user from Supabase via delete_user_account RPC
 * and the Supabase Admin API.
 */
export async function DELETE(request: Request) {
  let user: User | null = null
  let authenticatedClient: SupabaseClient | null = null

  // 1. Authenticate via Bearer token (Mobile / external API clients)
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const client = createApiClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
      const { data, error } = await client.auth.getUser(token)
      if (!error && data?.user) {
        user = data.user
        authenticatedClient = client
      }
    }
  }

  // 2. Authenticate via Cookie session (Web client)
  if (!user) {
    const supabase = await createClient()
    const {
      data: { user: cookieUser },
    } = await supabase.auth.getUser()
    if (cookieUser) {
      user = cookieUser
      authenticatedClient = supabase
    }
  }

  if (!user || !authenticatedClient) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { confirm?: string; password?: string } = {}
  try {
    body = await request.json()
  } catch {
    // ignore
  }

  if (body.confirm !== 'DELETE' && body.confirm !== 'DELETE_MY_ACCOUNT') {
    return NextResponse.json({ error: 'Please type DELETE to confirm account deletion.' }, { status: 400 })
  }

  // Re-authentication check: if password is provided, verify it
  if (body.password && user.email) {
    const { error: signInErr } = await authenticatedClient.auth.signInWithPassword({
      email: user.email,
      password: body.password,
    })
    if (signInErr) {
      return NextResponse.json({ error: 'Re-authentication failed: incorrect password.' }, { status: 403 })
    }
  }

  const uid = user.id

  try {
    // 1. Supabase Storage cleanup: delete user's files from study-documents bucket
    try {
      const { data: storageFiles } = await authenticatedClient.storage.from('study-documents').list(uid)
      if (storageFiles && storageFiles.length > 0) {
        const filePaths = storageFiles.map((f: { name: string }) => `${uid}/${f.name}`)
        await authenticatedClient.storage.from('study-documents').remove(filePaths)
      }
    } catch (storageErr) {
      console.warn('[delete-account] Supabase Storage cleanup warning:', storageErr)
    }

    // 2. Cloudflare R2 Storage cleanup: delete all user objects prefixed with `${uid}/`
    try {
      const r2Objects = await listR2Objects(`${uid}/`, 1000)
      for (const obj of r2Objects) {
        if (obj.Key) {
          await deleteR2Object(obj.Key)
        }
      }
    } catch (r2Err) {
      console.warn('[delete-account] R2 Storage cleanup warning:', r2Err)
    }

    // 3. Permanently delete user from Supabase auth.users & all tables via PostgreSQL RPC
    let rpcSuccess = false
    try {
      const { error: rpcErr } = await authenticatedClient.rpc('delete_user_account')
      if (rpcErr) {
        console.error('[delete-account] delete_user_account RPC error:', rpcErr)
      } else {
        rpcSuccess = true
        console.log(`[delete-account] Successfully purged user ${uid} via delete_user_account RPC`)
      }
    } catch (rpcEx) {
      console.error('[delete-account] Exception invoking delete_user_account RPC:', rpcEx)
    }

    // 4. Admin API Fallback (if SUPABASE_SERVICE_ROLE_KEY is configured in the environment)
    let adminSuccess = false
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (serviceRoleKey && supabaseUrl) {
      try {
        const adminClient = createApiClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
        const { error: adminErr } = await adminClient.auth.admin.deleteUser(uid)
        if (adminErr) {
          console.warn('[delete-account] Supabase admin.deleteUser error:', adminErr)
        } else {
          adminSuccess = true
          console.log(`[delete-account] Successfully deleted user ${uid} via Supabase admin.deleteUser`)
        }
      } catch (e) {
        console.warn('[delete-account] Failed to execute admin deleteUser:', e)
      }
    }

    // If neither RPC nor admin succeeded, do not claim success!
    if (!rpcSuccess && !adminSuccess) {
      throw new Error('Supabase permanent auth deletion failed. Account was not deleted from auth.users.')
    }

    // Sign out user session
    try {
      await authenticatedClient.auth.signOut()
    } catch {}

    return NextResponse.json({ success: true, message: 'Account and all data permanently deleted from Supabase.' })
  } catch (error: unknown) {
    console.error('[delete-account] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Account deletion failed. Please try again.'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
