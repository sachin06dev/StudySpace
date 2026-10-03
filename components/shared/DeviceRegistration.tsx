'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerDeviceAction } from '@/lib/actions/devices'

import { getOrCreateDeviceId, detectDeviceInfo } from '@/lib/utils/deviceInfo'

const LAST_REGISTER_KEY = 'studyspace_device_last_reg'

export default function DeviceRegistration() {
  useEffect(() => {
    const registerCurrentDevice = async (force = false) => {
      const now = Date.now()
      const lastReg = sessionStorage.getItem(LAST_REGISTER_KEY)
      // Only register once every 5 minutes unless forced
      if (!force && lastReg && now - parseInt(lastReg, 10) < 5 * 60 * 1000) {
        return
      }

      const deviceId = getOrCreateDeviceId()
      const info = await detectDeviceInfo()

      const res = await registerDeviceAction({
        deviceId,
        deviceName: info.deviceName,
        deviceType: info.deviceType,
        platform: info.platform,
        browser: info.browser,
      })

      if (res.success) {
        sessionStorage.setItem(LAST_REGISTER_KEY, now.toString())
      }
    }

    // Initial registration on mount
    void registerCurrentDevice()

    // Listen for auth state changes (login, token refresh)
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
      ) {
        void registerCurrentDevice(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
