import Link from 'next/link'
import type { AnalyticsSummary } from '@/lib/data/analytics'
import AnalyticsMetricCard from './AnalyticsMetricCard'
import TaskCompletionCard from './TaskCompletionCard'

export interface AnalyticsSummaryViewProps {
  summary: AnalyticsSummary
}

export default function AnalyticsSummaryView({ summary }: AnalyticsSummaryViewProps) {
  const hasNoSessions = summary.week.pomodoroCount === 0

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Study Time */}
        <AnalyticsMetricCard
          label="Today's Study Time"
          value={summary.today.formattedDuration}
          description="Focused today"
          variant="indigo"
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

        {/* 2. Today's Pomodoros */}
        <AnalyticsMetricCard
          label="Today's Pomodoros"
          value={summary.today.pomodoroCount}
          description="Completed sessions"
          variant="emerald"
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

        {/* 3. Weekly Study Time */}
        <AnalyticsMetricCard
          label="Weekly Study Time"
          value={summary.week.formattedDuration}
          description="This week (Mon–Sun)"
          variant="violet"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />

        {/* 4. Weekly Pomodoros */}
        <AnalyticsMetricCard
          label="Weekly Pomodoros"
          value={summary.week.pomodoroCount}
          description="Completed sessions"
          variant="amber"
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
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343a7.975 7.975 0 010 11.314z"
              />
            </svg>
          }
        />
      </div>

      {/* Empty State Banner if no sessions yet */}
      {hasNoSessions && (
        <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">No study sessions yet</h3>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                Complete a Pomodoro focus session to start tracking your daily and weekly study statistics.
              </p>
            </div>
          </div>

          <Link
            href="/pomodoro"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <span>Start Timer</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Task Completion Card */}
      <TaskCompletionCard
        total={summary.tasks.total}
        completed={summary.tasks.completed}
        pending={summary.tasks.pending}
        completionPercentage={summary.tasks.completionPercentage}
      />

      {/* Timezone Note */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 px-1">
        <span>Metrics are calculated using your local calendar (Monday–Sunday).</span>
        <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
          TZ: {summary.timezone}
        </span>
      </div>
    </div>
  )
}
