import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, Flame, CheckSquare, GraduationCap, Compass } from 'lucide-react'
import { getCachedUser, getCachedUserTimezone } from '@/lib/data/cachedUser'
import { getDashboardData } from '@/lib/data/dashboard'
import { getDashboardAttendanceData } from '@/lib/data/dashboardAttendance'
import { getDailyQuote } from '@/lib/quotes/dailyQuote'
import MetricTile from '@/components/ui/MetricTile'
import NextClassCard from '@/components/dashboard/NextClassCard'
import TodayScheduleTimeline from '@/components/dashboard/TodayScheduleTimeline'
import StudyActivitySummary from '@/components/dashboard/StudyActivitySummary'
import DashboardConsistencyCard from '@/components/dashboard/DashboardConsistencyCard'
import ContinueLearning from '@/components/dashboard/ContinueLearning'
import DashboardCardsSkeleton from '@/components/dashboard/DashboardSkeleton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Dashboard | StudySpace',
  description: 'Your personal academic workspace overview, daily schedule, and focus progress.',
}

async function DashboardContent({
  userId,
  userEmail,
  userMetadata,
  userTimezone,
}: {
  userId: string
  userEmail?: string | null
  userMetadata?: Record<string, unknown> | null
  userTimezone: string
}) {
  const [dashboardData, attendanceData] = await Promise.all([
    getDashboardData(userId, userEmail, userMetadata),
    getDashboardAttendanceData(userId, userTimezone),
  ])
  const dailyQuote = getDailyQuote(attendanceData.todayDate)

  const upcomingCount = attendanceData.todayClasses.filter(
    (c) => !c.isCancelled && !c.attendanceStatus
  ).length

  const attendanceValue = attendanceData.overallSummary
    ? `${attendanceData.overallSummary.overallPercentage}%`
    : '--'

  const attendanceRisk = attendanceData.overallSummary?.riskState || 'Not set'
  const isAttendancePositive =
    attendanceData.overallSummary?.riskState === 'SAFE'
      ? true
      : attendanceData.overallSummary?.riskState === 'CRITICAL'
      ? false
      : undefined

  return (
    <div className="space-y-6">
      {/* 1. Hero Split: Next Class (60%) + Atmospheric Focus Banner (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <NextClassCard
            nextClass={attendanceData.nextClass}
            todayDate={attendanceData.todayDate}
            semesterId={attendanceData.semester?.id || null}
            hasActiveSemester={attendanceData.hasActiveSemester}
            remainingClassesCount={upcomingCount}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="h-full rounded-3xl border border-purple-200/60 dark:border-(--border-subtle) bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 dark:from-(--surface) dark:via-(--surface) dark:to-(--surface-raised) p-6 sm:p-7 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            {/* Subtle atmospheric background graphic */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-2xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-[var(--surface-raised)] text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-[var(--border-subtle)] shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-purple-500" />
                <span>Daily Compass</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight leading-snug">
                &ldquo;{dailyQuote.text}&rdquo;
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-1.5">— {dailyQuote.author}</p>
            </div>

            <div className="pt-4 border-t border-purple-100/80 dark:border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] relative z-10">
              <span>{attendanceData.semester?.name || 'Academic Term'}</span>
              <Link
                href="/analytics"
                className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline inline-flex items-center gap-1"
              >
                <span>View Consistency</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Metric Strip: 4 High-Density Inline Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link href="/pomodoro" className="block">
          <MetricTile
            label="Study Time Today"
            value={dashboardData.today.formattedDuration || '0m'}
            trend={{
              value: `${dashboardData.today.pomodoroCount} sessions`,
              isPositive: dashboardData.today.pomodoroCount > 0,
            }}
            icon={<Clock className="w-4 h-4 text-purple-500" />}
          />
        </Link>

        <Link href="/attendance" className="block">
          <MetricTile
            label="Overall Attendance"
            value={attendanceValue}
            trend={{
              value: attendanceRisk,
              isPositive: isAttendancePositive,
            }}
            icon={<GraduationCap className="w-4 h-4 text-indigo-500" />}
          />
        </Link>

        <Link href="/analytics" className="block">
          <MetricTile
            label="Study Streak"
            value={dashboardData.heatmap.streaks.currentStreak}
            unit="days"
            trend={{
              value: `Best: ${dashboardData.heatmap.streaks.longestStreak} days`,
              isPositive: dashboardData.heatmap.streaks.currentStreak > 0,
            }}
            icon={<Flame className="w-4 h-4 text-amber-500" />}
          />
        </Link>

        <Link href="/tasks" className="block">
          <MetricTile
            label="Tasks Progress"
            value={`${dashboardData.today.completedTasks} / ${dashboardData.today.totalTasks}`}
            trend={{
              value: `${dashboardData.today.pendingTasks} remaining`,
              isPositive: dashboardData.today.completedTasks > 0,
            }}
            icon={<CheckSquare className="w-4 h-4 text-emerald-500" />}
          />
        </Link>
      </div>

      {/* 3. Main Split: Today's Schedule (65%) + Focus & Actions (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <TodayScheduleTimeline
            todayClasses={attendanceData.todayClasses}
            todayDate={attendanceData.todayDate}
            semesterId={attendanceData.semester?.id || null}
          />
        </div>

        <div className="lg:col-span-4">
          <StudyActivitySummary
            todayStudyMinutes={dashboardData.today.studyMinutes}
            pomodoroCount={dashboardData.today.pomodoroCount}
            formattedDuration={dashboardData.today.formattedDuration}
            completedTasks={dashboardData.today.completedTasks}
            totalTasks={dashboardData.today.totalTasks}
            pendingTasksCount={dashboardData.today.pendingTasks}
          />
        </div>
      </div>

      {/* 4. Consistency & Heatmap Section */}
      <DashboardConsistencyCard
        heatmap={dashboardData.heatmap}
        data={dashboardData.consistency}
      />

      {/* 5. Continue Learning */}
      <ContinueLearning items={dashboardData.recentLearning} />
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const userTimezone = await getCachedUserTimezone(user.id)

  const rawName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    (user.email ? user.email.split('@')[0] : null)
  const userName = rawName ? rawName.trim() : 'Student'

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Good day, {userName}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Today is {todayFormatted} • Let&apos;s make today count.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/timetable"
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Weekly Schedule
          </Link>
          <Link
            href="/pomodoro"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
          >
            Start Focus
          </Link>
        </div>
      </div>

      {/* Dynamic Content */}
      <Suspense fallback={<DashboardCardsSkeleton />}>
        <DashboardContent
          userId={user.id}
          userEmail={user.email}
          userMetadata={user.user_metadata as Record<string, unknown>}
          userTimezone={userTimezone}
        />
      </Suspense>
    </div>
  )
}
