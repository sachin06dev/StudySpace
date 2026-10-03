import { NextResponse } from 'next/server'
import { fetchLatestReleaseManifest, isUrlMatchingVersion } from '@/lib/config/release'

export const dynamic = 'force-dynamic'

export async function GET() {
  const manifest = await fetchLatestReleaseManifest()

  let targetUrl = manifest.apkUrl

  // If manifest does not contain a full URL, only fallback to env variable if it matches current release version
  if (!targetUrl || !targetUrl.startsWith('http')) {
    const envFallback =
      process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL ||
      process.env.ANDROID_DOWNLOAD_URL ||
      ''
    if (envFallback && isUrlMatchingVersion(envFallback, manifest.latestVersion)) {
      targetUrl = envFallback
    } else {
      targetUrl = ''
    }
  } else if (!isUrlMatchingVersion(targetUrl, manifest.latestVersion)) {
    console.warn(`[DownloadRoute] Manifest apkUrl points to mismatched version: ${targetUrl} (expected ${manifest.latestVersion})`)
    targetUrl = ''
  }

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return NextResponse.json(
      {
        success: false,
        error: `StudySpace Android APK for v${manifest.latestVersion} (Build ${manifest.latestBuild}) is currently being prepared on the release CDN. Please check back shortly.`,
        version: manifest.latestVersion,
        build: manifest.latestBuild,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }

  // Extract or build appropriate filename
  const filename =
    targetUrl.split('/').pop() || `StudySpace-v${manifest.latestVersion}.apk`

  // Issue temporary redirect directly to the APK binary on Cloudflare R2
  // NEVER streams the full APK through Vercel serverless functions
  const response = NextResponse.redirect(targetUrl, 307)
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  )
  response.headers.set('Content-Type', 'application/vnd.android.package-archive')
  response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
  return response
}
