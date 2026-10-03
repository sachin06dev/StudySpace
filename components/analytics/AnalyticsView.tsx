'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronDown, ChevronUp, Layers, GraduationCap, X } from 'lucide-react'
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
  const router = useRouter()
  const hasNoSessions = data.streaks.totalPomodoros === 0 && data.streaks.totalStudyMinutes === 0
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  const semesters = data.semesters || []
  const selectedSemesterId = data.selectedSemesterId || 'all'
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId)

  const handleSemesterChange = (id: string) => {
    if (id === 'all') {
      router.push('/analytics')
    } else {
      router.push(`/analytics?semester=${id}`)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Semester Filter Switcher */}
      {semesters.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] shrink-0 mr-1">
              <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
              <span>Semester:</span>
            </div>

            <button
              type="button"
              onClick={() => handleSemesterChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedSemesterId === 'all'
                  ? 'bg-[var(--accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]/80'
              }`}
            >
              All Time
            </button>

            {semesters.map((sem) => {
              const isSelected = selectedSemesterId === sem.id
              return (
                <button
                  key={sem.id}
                  type="button"
                  onClick={() => handleSemesterChange(sem.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-xs font-semibold'
                      : 'bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]/80'
                  }`}
                >
                  <span>{sem.name}</span>
                  {sem.isActive && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md uppercase font-bold tracking-wider ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                      }`}
                    >
                      Active
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {selectedSemester && (
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[var(--foreground-muted)]">
              <span className="text-[11px]">
                {selectedSemester.startDate} to {selectedSemester.endDate}
              </span>
              <button
                type="button"
                onClick={() => handleSemesterChange('all')}
                className="p-1 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                title="Clear semester filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. New User Empty State Prompt (if zero sessions ever) */}
      {hasNoSessions && (
        <div className="bg-[var(--accent-subtle)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center shrink-0 text-xl mt-0.5 border border-[var(--border-subtle)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Welcome to StudySpace Analytics
              </h3>

              <p className="text-xs text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
                Complete your first Pomodoro session to populate your 365-day heatmap and start building your consistency streak.
              </p>
            </div>
          </div>

          <Link
            href="/pomodoro"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <span>Start First Session</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* 2. Key Consistency Pillars (Consistency Score, Monthly Pace, Weekly Target) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ConsistencyScoreCard data={data.consistencyScore} />
        <MonthlySummaryCard
          data={data.monthlySummary}
          monthlySummaries={data.monthlySummaries}
          availableMonthKeys={data.availableMonthKeys}
        />
        <WeeklyGoalCard data={data.weeklyGoal} />
      </div>

      {/* 3. Primary Visual Anchor: 365-Day Study Activity Heatmap */}
      <HeatmapGrid
        days={data.heatmap.days}
        streaks={data.streaks}
        timezone={data.timezone}
        yearlyData={data.yearlyData}
        availableYears={data.availableYears}
        selectedYear={data.selectedYear}
      />

      {/* 4. Weekly Trend & Diurnal Rhythm (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <WeeklyStudyChart data={data.weeklyGraph} />
        <ProductiveTimeCard data={data.timeOfDay} />
      </div>

      {/* 5. Achievements & Actionable Insights (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <MilestonesCard data={data.milestones} />
        <StudyInsightsCard insights={data.insights} />
      </div>

      {/* 6. Secondary Deep-Dive Section Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <span>Detailed Focus & Course Breakdown</span>
            <span className="text-[11px] text-[var(--foreground-muted)] font-normal">
              (Pomodoro sessions, courses, subjects, tasks)
            </span>
          </div>
          {showDetailedBreakdown ? (
            <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
          )}
        </button>

        {showDetailedBreakdown && (
          <div className="space-y-5 mt-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PomodoroStatsCard data={data.pomodoro} />
              <CourseProgressCard data={data.playlistProgress} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SubjectDistributionCard data={data.subjectDistribution} />
              <TaskCompletionCard
                total={data.summary.tasks.total}
                completed={data.summary.tasks.completed}
                pending={data.summary.tasks.pending}
                completionPercentage={data.summary.tasks.completionPercentage}
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. Isolated Local Timezone Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--foreground-muted)] px-1 pt-2 gap-2">
        <span>Analytics and streak calculations are isolated to your local calendar day.</span>
        <span className="font-mono text-[11px] bg-[var(--surface-muted)] text-[var(--foreground-muted)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
          Timezone: {data.timezone}
        </span>
      </div>
    </div>
  )
}
