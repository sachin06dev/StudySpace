import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Server-side session invalidation: if client presents a device cookie that is marked revoked, clear session
  const clientDeviceId = request.cookies.get('studyspace_device_id')?.value
  if (user && clientDeviceId) {
    try {
      const { data: device } = await supabase
        .from('user_devices')
        .select('is_revoked')
        .eq('user_id', user.id)
        .eq('device_id', clientDeviceId)
        .maybeSingle()

      if (device && device.is_revoked) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?revoked=true', request.url))
      }
    } catch {
      // Table may not exist or network glitch; fail open to avoid trapping legitimate users
    }
  }

  return supabaseResponse
}
