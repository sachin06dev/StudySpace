import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/data/dashboard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard'
import DashboardConsistencyCard from '@/components/dashboard/DashboardConsistencyCard'
import DashboardTaskList from '@/components/dashboard/DashboardTaskList'
import DashboardPomodoroCard from '@/components/dashboard/DashboardPomodoroCard'
import ContinueLearning from '@/components/dashboard/ContinueLearning'
import QuickActions from '@/components/dashboard/QuickActions'
import StudyLibrarySummary from '@/components/dashboard/StudyLibrarySummary'
import DashboardCardsSkeleton from '@/components/dashboard/DashboardSkeleton'

export const metadata = {
  title: 'Dashboard | StudySpace',
  description: 'Your personal study workspace overview, tasks, and daily focus progress.',
}

async function DashboardContent({
  userId,
  userEmail,
  userMetadata,
}: {
  userId: string
  userEmail?: string | null
  userMetadata?: Record<string, unknown> | null
}) {
  const dashboardData = await getDashboardData(userId, userEmail, userMetadata)

  const taskProgressDescription =
    dashboardData.today.totalTasks > 0
      ? `${dashboardData.today.taskCompletionPercentage}% completed`
      : 'No tasks yet'

  return (
    <div className="space-y-6">
      {/* 1. Today's Study Metrics (3 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Study Time Today */}
        <DashboardMetricCard
          label="Study Time Today"
          value={dashboardData.today.formattedDuration}
          description="Focused study time"
          variant="indigo"
          href="/analytics"
          footerNote="View analytics →"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* Pomodoros Today */}
        <DashboardMetricCard
          label="Pomodoros Today"
          value={dashboardData.today.pomodoroCount}
          description="Completed sessions"
          variant="emerald"
          href="/pomodoro"
          footerNote="Timer →"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* Tasks Done / Total */}
        <DashboardMetricCard
          label="Tasks Progress"
          value={`${dashboardData.today.completedTasks} / ${dashboardData.today.totalTasks}`}
          description={taskProgressDescription}
          variant="amber"
          href="/tasks"
          footerNote="Manage →"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
      </div>

      {/* 2. Consistency & Study Journey Card */}
      <DashboardConsistencyCard
        heatmap={dashboardData.heatmap}
        data={dashboardData.consistency}
      />

      {/* 3. Main Action Grid: Today's Tasks + Focus Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardTaskList
            tasks={dashboardData.pendingTasks}
            totalTasks={dashboardData.today.totalTasks}
            completedTasks={dashboardData.today.completedTasks}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardPomodoroCard
            studyMinutes={dashboardData.today.studyMinutes}
            pomodoroCount={dashboardData.today.pomodoroCount}
            formattedDuration={dashboardData.today.formattedDuration}
          />
        </div>
      </div>

      {/* 3. Continue Learning / Recent Study Content */}
      <ContinueLearning items={dashboardData.recentLearning} />

      {/* 4. Quick Actions */}
      <QuickActions />

      {/* 5. Study Library Summary */}
      <StudyLibrarySummary counts={dashboardData.libraryCounts} />
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    (user.email ? user.email.split('@')[0] : null)
  const userName = rawName ? rawName.trim() : 'Student'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Header paints instantly with initial HTML stream - immediate Desktop LCP */}
      <DashboardHeader
        heading={`Welcome, ${userName}`}
        subheading="Let's make today productive."
        formattedDate=""
        timezone=""
      />

      {/* 2. Dynamic metrics, tasks, and learning cards stream in below */}
      <Suspense fallback={<DashboardCardsSkeleton />}>
        <DashboardContent
          userId={user.id}
          userEmail={user.email}
          userMetadata={user.user_metadata as Record<string, unknown>}
        />
      </Suspense>
    </div>
  )
}
