import Link from 'next/link'
import type { FullAnalyticsData } from '@/lib/data/analytics'
import HeatmapGrid from './HeatmapGrid'
import WeeklyStudyChart from './WeeklyStudyChart'
import MonthlySummaryCard from './MonthlySummaryCard'
import ConsistencyScoreCard from './ConsistencyScoreCard'
import WeeklyGoalCard from './WeeklyGoalCard'
import PomodoroStatsCard from './PomodoroStatsCard'
import CourseProgressCard from './CourseProgressCard'
import SubjectDistributionCard from './SubjectDistributionCard'
import ProductiveTimeCard from './ProductiveTimeCard'
import MilestonesCard from './MilestonesCard'
import StudyInsightsCard from './StudyInsightsCard'
import TaskCompletionCard from './TaskCompletionCard'

export interface AnalyticsViewProps {
  data: FullAnalyticsData
}

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  const hasNoSessions = data.streaks.totalPomodoros === 0 && data.streaks.totalStudyMinutes === 0

  return (
    <div className="space-y-6 pb-12">
      {/* 1. New User Empty State Prompt (if zero sessions ever) */}
      {hasNoSessions && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 text-xl mt-0.5">
              ✨
            </div>
            <div>
              <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
                Welcome to StudySpace Analytics
              </h3>

              <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                Complete your first Pomodoro session to populate your 365-day heatmap and start building your consistency streak.
              </p>
            </div>
          </div>

          <Link
            href="/pomodoro"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-2xl shadow-xs transition-colors shrink-0"
          >
            <span>Start First Session</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* 2. 365-Day Study Activity Heatmap & Streaks */}
      <HeatmapGrid
        days={data.heatmap.days}
        streaks={data.streaks}
        timezone={data.timezone}
        yearlyData={data.yearlyData}
        availableYears={data.availableYears}
        selectedYear={data.selectedYear}
      />

      {/* 3. Weekly Study Time Graph */}
      <WeeklyStudyChart data={data.weeklyGraph} />

      {/* 4. Consistency & Progress Pillars (3 Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MonthlySummaryCard
          data={data.monthlySummary}
          monthlySummaries={data.monthlySummaries}
          availableMonthKeys={data.availableMonthKeys}
        />
        <ConsistencyScoreCard data={data.consistencyScore} />
        <WeeklyGoalCard data={data.weeklyGoal} />
      </div>

      {/* 5. Deep-Dive Section: Pomodoro & Course Progress (2 Cards Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PomodoroStatsCard data={data.pomodoro} />
        <CourseProgressCard data={data.playlistProgress} />
      </div>

      {/* 6. Context & Time-of-Day Rhythm (2 Cards Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProductiveTimeCard data={data.timeOfDay} />
        <SubjectDistributionCard data={data.subjectDistribution} />
      </div>

      {/* 7. Achievements, Insights & Task Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MilestonesCard data={data.milestones} />
        <StudyInsightsCard insights={data.insights} />
      </div>

      {/* 8. Task Completion Card */}
      <TaskCompletionCard
        total={data.summary.tasks.total}
        completed={data.summary.tasks.completed}
        pending={data.summary.tasks.pending}
        completionPercentage={data.summary.tasks.completionPercentage}
      />

      {/* Timezone Note */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-1 pt-2">
        <span>Analytics and streak calculations are isolated to your local calendar day.</span>
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          Timezone: {data.timezone}
        </span>
      </div>
    </div>
  )
}
