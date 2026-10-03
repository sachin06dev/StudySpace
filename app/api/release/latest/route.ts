import { NextResponse } from 'next/server'
import { fetchLatestReleaseManifest } from '@/lib/config/release'

export const dynamic = 'force-dynamic'

export async function GET() {
  const manifest = await fetchLatestReleaseManifest()

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
