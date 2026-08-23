import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getComprehensiveAnalytics } from '@/lib/data/analytics'
import PageHeader from '@/components/shared/PageHeader'
import AnalyticsView from '@/components/analytics/AnalyticsView'
import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton'

export const metadata = {
  title: 'Analytics | StudySpace',
  description: 'Track your 365-day study consistency, activity heatmap, weekly study charts, and focus insights.',
}


async function AnalyticsContent({ userId }: { userId: string }) {
  let cookieTz: string | undefined
  try {
    const cookieStore = await cookies()
    cookieTz = cookieStore.get('user-timezone')?.value
  } catch {}

  const data = await getComprehensiveAnalytics(userId, cookieTz)
  return <AnalyticsView data={data} />
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
        <AnalyticsContent userId={user.id} />
      </Suspense>
    </div>
  )
}
