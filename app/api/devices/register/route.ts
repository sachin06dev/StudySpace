import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Bearer token required.' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7).trim()
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Empty token.' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    // Authenticated Supabase client using user's Bearer token (no service role key)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      )
    }

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      )
    }

    const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : ''
    const deviceName = typeof body.deviceName === 'string' ? body.deviceName.trim() : ''
    const rawDeviceType =
      typeof body.deviceType === 'string' ? body.deviceType.trim().toLowerCase() : 'mobile'
    const deviceType = ['mobile', 'desktop', 'tablet', 'web'].includes(rawDeviceType)
      ? rawDeviceType
      : 'mobile'
    const platform = typeof body.platform === 'string' ? body.platform.trim() : null
    const browser = typeof body.browser === 'string' ? body.browser.trim() : null

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'deviceId is required.' },
        { status: 400 }
      )
    }

    if (!deviceName) {
      return NextResponse.json(
        { success: false, error: 'deviceName is required.' },
        { status: 400 }
      )
    }

    // Check if this device was previously revoked
    const { data: existing } = await supabase
      .from('user_devices')
      .select('is_revoked')
      .eq('user_id', user.id)
      .eq('device_id', deviceId)
      .maybeSingle()

    if (existing && existing.is_revoked) {
      return NextResponse.json(
        { success: false, error: 'Device session has been revoked', isRevoked: true },
        { status: 403 }
      )
    }

    // Upsert into user_devices using derived authenticated user.id only
    const { error: upsertError } = await supabase.from('user_devices').upsert(
      {
        user_id: user.id,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        platform: platform || null,
        browser: browser || null,
        is_revoked: false,
        last_active_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,device_id',
      }
    )

    if (upsertError) {
      console.error('[API /api/devices/register] Upsert failed:', upsertError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to register device.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully.',
    })
  } catch (err: unknown) {
    console.error('[API /api/devices/register] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
