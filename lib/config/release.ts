export interface MobileReleaseManifest {
  latestVersion: string
  latestBuild: number
  minimumSupportedBuild: number
  apkUrl: string
  apkSize: number
  sha256: string
  releaseDate: string
  releaseNotes: string[]
}

/**
 * Fallback manifest used when the R2 release bucket or network is temporarily unreachable.
 * Ensures the website remains 100% operational without failing page renders.
 */
export const FALLBACK_RELEASE_MANIFEST: MobileReleaseManifest = {
  latestVersion: '1.1.6',
  latestBuild: 14,
  minimumSupportedBuild: 1,
  apkUrl: 'https://pub-b4adfff8f9484716b527406a89c265c0.r2.dev/releases/studyspace-1.1.6+14.apk',
  apkSize: 71084624,
  sha256: '9bfacd27d42e4237d2f16d9bbfc2f19edfae8e54380d08a5f1dd69b1300f7c3e',
  releaseDate: '2026-10-02',
  releaseNotes: [
    'Interactive focus & Pomodoro study timer with real-time countdown and session controls',
    'Instant one-tap class cancellation with quick Undo support',
    'Always-current Home class schedule anchored strictly to real-time today date',
    'Interactive week swipe gestures for effortless timetable navigation',
    'Enhanced cross-platform real-time sync and account data export/privacy controls',
    'General performance and stability optimizations',
  ],
}

/**
 * Validates that an external or legacy fallback URL matches the expected release version.
 * Strictly prevents serving an obsolete release (e.g. v1.0.0) when advertising a newer version (e.g. v1.0.1).
 */
export function isUrlMatchingVersion(url: string, expectedVersion: string): boolean {
  if (!url || !url.startsWith('http')) return false
  const match = url.match(/(?:v|releases\/|download\/|StudySpace-v?)([0-9]+\.[0-9]+\.[0-9]+)/i)
  if (match && match[1] !== expectedVersion) {
    return false
  }
  return true
}

/**
 * Resolves the configured public mobile release base URL (e.g. Cloudflare r2.dev or custom domain).
 */
export function getMobileReleaseBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_MOBILE_RELEASE_BASE_URL ||
    process.env.MOBILE_RELEASE_BASE_URL ||
    ''
  return url.trim().replace(/\/+$/, '')
}

/**
 * Fetches the latest release manifest from the public release host with Next.js ISR revalidation.
 * Fails safely and returns fallback metadata if R2 is unavailable.
 */
export async function fetchLatestReleaseManifest(): Promise<MobileReleaseManifest> {
  const baseUrl = getMobileReleaseBaseUrl()

  if (!baseUrl) {
    // If no release base URL configured, only use legacy direct URL if it strictly matches current version
    const legacyUrl =
      process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL ||
      process.env.ANDROID_DOWNLOAD_URL
    if (legacyUrl && isUrlMatchingVersion(legacyUrl, FALLBACK_RELEASE_MANIFEST.latestVersion)) {
      return {
        ...FALLBACK_RELEASE_MANIFEST,
        apkUrl: legacyUrl,
      }
    }
    return FALLBACK_RELEASE_MANIFEST
  }

  const manifestUrl = `${baseUrl}/latest.json`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(manifestUrl, {
      signal: controller.signal,
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        Accept: 'application/json',
      },
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      console.warn(`[ReleaseManifest] Fetch failed with status ${res.status} from ${manifestUrl}`)
      return FALLBACK_RELEASE_MANIFEST
    }

    const data = await res.json()

    // Validate minimum required fields and ensure apkUrl is a valid absolute URL
    if (
      typeof data.latestVersion === 'string' &&
      typeof data.latestBuild === 'number' &&
      typeof data.apkUrl === 'string' &&
      data.apkUrl.startsWith('http')
    ) {
      return {
        latestVersion: data.latestVersion,
        latestBuild: data.latestBuild,
        minimumSupportedBuild: typeof data.minimumSupportedBuild === 'number' ? data.minimumSupportedBuild : 1,
        apkUrl: data.apkUrl,
        apkSize: typeof data.apkSize === 'number' ? data.apkSize : 0,
        sha256: typeof data.sha256 === 'string' ? data.sha256 : '',
        releaseDate: typeof data.releaseDate === 'string' ? data.releaseDate : new Date().toISOString().slice(0, 10),
        releaseNotes: Array.isArray(data.releaseNotes) ? data.releaseNotes : [],
      }
    }

    console.warn('[ReleaseManifest] Incomplete or invalid manifest schema received:', data)
    return FALLBACK_RELEASE_MANIFEST
  } catch (error) {
    console.warn('[ReleaseManifest] Failed to load latest release manifest:', error)
    return FALLBACK_RELEASE_MANIFEST
  }
}
