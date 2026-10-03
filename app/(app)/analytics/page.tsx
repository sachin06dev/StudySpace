import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCachedUser } from '@/lib/data/cachedUser'
import { getComprehensiveAnalytics } from '@/lib/data/analytics'
import PageHeader from '@/components/shared/PageHeader'
import AnalyticsView from '@/components/analytics/AnalyticsView'
import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton'

export const metadata = {
  title: 'Analytics | StudySpace',
  description: 'Track your 365-day study consistency, activity heatmap, weekly study charts, and focus insights.',
}

async function AnalyticsContent({
  userId,
  semesterId,
}: {
  userId: string
  semesterId?: string
}) {
  let cookieTz: string | undefined
  try {
    const cookieStore = await cookies()
    cookieTz = cookieStore.get('user-timezone')?.value
  } catch {}

  const data = await getComprehensiveAnalytics(userId, cookieTz, semesterId)
  return <AnalyticsView data={data} />
}

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ semester?: string }>
}) {
  const searchParams = await props.searchParams
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Study Consistency & Progress"
        description="365-day activity heatmap, streaks, weekly focus breakdown, and study insights."
      />

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent userId={user.id} semesterId={searchParams.semester} />
      </Suspense>
    </div>
  )
}
