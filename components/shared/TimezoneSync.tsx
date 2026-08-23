'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { syncUserTimezoneAction } from '@/lib/actions/profile'

interface TimezoneSyncProps {
  currentTimezone?: string | null
}

export default function TimezoneSync({ currentTimezone }: TimezoneSyncProps) {
  const syncedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (syncedRef.current) return
    syncedRef.current = true

    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (!detectedTz) return

      // Check whether client cookie matches detected timezone
      const cookieMatch = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user-timezone='))
      const currentCookieVal = cookieMatch ? decodeURIComponent(cookieMatch.split('=')[1]) : null

      const needsCookieUpdate = currentCookieVal !== detectedTz
      const needsProfileSync = !currentTimezone || currentTimezone === 'UTC'

      if (needsCookieUpdate) {
        document.cookie = `user-timezone=${encodeURIComponent(detectedTz)}; path=/; max-age=31536000; SameSite=Lax`
      }

      if (needsProfileSync || needsCookieUpdate) {
        syncUserTimezoneAction(detectedTz).then((res) => {
          if (res?.success && currentTimezone && currentTimezone !== detectedTz) {
            router.refresh()
          }
        })
      }
    } catch (err) {
      console.error('Timezone auto-detection error:', err)
    }
  }, [currentTimezone, router])

  return null
}

