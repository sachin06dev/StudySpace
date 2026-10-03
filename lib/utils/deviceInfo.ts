'use client'

export const DEVICE_ID_KEY = 'studyspace_device_id'

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36)
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export async function detectDeviceInfo(): Promise<{
  deviceName: string
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'web'
  platform: string
  browser: string
}> {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Web Browser',
      deviceType: 'web',
      platform: 'Web',
      browser: 'Browser',
    }
  }

  const ua = navigator.userAgent
  let platform = 'Web'
  let deviceType: 'mobile' | 'desktop' | 'tablet' | 'web' = 'desktop'

  if (/android/i.test(ua)) {
    platform = 'Android'
    deviceType = 'mobile'
  } else if (/iphone|ipod/i.test(ua)) {
    platform = 'iOS'
    deviceType = 'mobile'
  } else if (/ipad/i.test(ua)) {
    platform = 'iPadOS'
    deviceType = 'tablet'
  } else if (/windows/i.test(ua)) {
    platform = 'Windows'
    deviceType = 'desktop'
  } else if (/macintosh|mac os x/i.test(ua)) {
    platform = 'macOS'
    deviceType = 'desktop'
  } else if (/linux/i.test(ua)) {
    platform = 'Linux'
    deviceType = 'desktop'
  }

  let browser = 'Browser'
  try {
    const nav = navigator as Navigator & {
      brave?: { isBrave?: () => Promise<boolean> }
    }
    if (nav.brave && typeof nav.brave.isBrave === 'function' && (await nav.brave.isBrave())) {
      browser = 'Brave'
    } else if (/edg/i.test(ua)) {
      browser = 'Edge'
    } else if (/firefox|fxios/i.test(ua)) {
      browser = 'Firefox'
    } else if (/chrome|crios/i.test(ua)) {
      browser = 'Chrome'
    } else if (/safari/i.test(ua)) {
      browser = 'Safari'
    }
  } catch {
    if (/firefox/i.test(ua)) browser = 'Firefox'
    else if (/edg/i.test(ua)) browser = 'Edge'
    else if (/chrome/i.test(ua)) browser = 'Chrome'
  }

  const deviceName = `${browser} on ${platform}`

  return {
    deviceName,
    deviceType,
    platform,
    browser,
  }
}
