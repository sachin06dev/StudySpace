'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UserDevice {
  id: string
  user_id: string
  device_id: string
  device_name: string
  device_type: 'mobile' | 'desktop' | 'tablet' | 'web'
  platform: string | null
  browser: string | null
  is_revoked?: boolean
  last_active_at: string
  created_at: string
}

export async function getUserDevicesAction(): Promise<{
  success: boolean
  devices?: UserDevice[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized', devices: [] }
    }

    const { data, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_revoked', false)
      .order('last_active_at', { ascending: false })

    if (error) {
      console.warn('[getUserDevicesAction] Error or table pending migration:', error.message)
      return { success: false, error: error.message, devices: [] }
    }

    return { success: true, devices: (data as UserDevice[]) || [] }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch devices'
    return { success: false, error: message, devices: [] }
  }
}

export async function registerDeviceAction(device: {
  deviceId: string
  deviceName: string
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'web'
  platform?: string
  browser?: string
}): Promise<{ success: boolean; error?: string; isRevoked?: boolean }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if this device was previously revoked
    const { data: existing } = await supabase
      .from('user_devices')
      .select('is_revoked')
      .eq('user_id', user.id)
      .eq('device_id', device.deviceId)
      .maybeSingle()

    if (existing && existing.is_revoked) {
      return { success: false, error: 'Device session has been revoked', isRevoked: true }
    }

    const { error } = await supabase.from('user_devices').upsert(
      {
        user_id: user.id,
        device_id: device.deviceId,
        device_name: device.deviceName,
        device_type: device.deviceType,
        platform: device.platform || null,
        browser: device.browser || null,
        is_revoked: false,
        last_active_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,device_id',
      }
    )

    if (error) {
      console.warn('[registerDeviceAction] Upsert error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to register device'
    return { success: false, error: message }
  }
}

export async function removeDeviceAction(target: {
  deviceId?: string
  id?: string
} | string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const deviceId = typeof target === 'string' ? target : target.deviceId
    const id = typeof target === 'object' ? target.id : undefined

    if (!deviceId && !id) {
      return { success: false, error: 'Device identifier is required' }
    }

    // 1. Mark device as revoked in user_devices (triggers realtime UPDATE so active client signs out)
    if (deviceId) {
      await supabase
        .from('user_devices')
        .update({ is_revoked: true, last_active_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
    }
    if (id) {
      await supabase
        .from('user_devices')
        .update({ is_revoked: true, last_active_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('id', id)
    }

    // 2. Also delete from user_devices table (triggers realtime DELETE)
    let deleteQuery = supabase.from('user_devices').delete().eq('user_id', user.id)
    if (deviceId) {
      deleteQuery = deleteQuery.eq('device_id', deviceId)
    } else if (id) {
      deleteQuery = deleteQuery.eq('id', id)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // 3. Check remaining active devices: if no other device remains, server-side revoke tokens via scope: 'others'
    const { data: remaining } = await supabase
      .from('user_devices')
      .select('device_id')
      .eq('user_id', user.id)
      .eq('is_revoked', false)

    if (!remaining || remaining.length <= 1) {
      try {
        await supabase.auth.signOut({ scope: 'others' })
      } catch (authErr) {
        console.warn('[removeDeviceAction] signOut(others) note:', authErr)
      }
    }

    revalidatePath('/settings', 'page')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove device'
    return { success: false, error: message }
  }
}
