import React from 'react'
import Link from 'next/link'

interface DashboardPomodoroCardProps {
  studyMinutes: number
  pomodoroCount: number
  formattedDuration: string
}

export default function DashboardPomodoroCard({
  studyMinutes,
  pomodoroCount,
  formattedDuration,
}: DashboardPomodoroCardProps) {
  const hasStudyToday = pomodoroCount > 0 || studyMinutes > 0

  return (
    <div className="bg-white dark:bg-(--surface) text-gray-900 dark:text-gray-100 rounded-2xl border border-gray-200/80 dark:border-(--border-subtle) p-5 sm:p-6 shadow-2xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background subtle glow effect */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Study Focus</h2>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
            Focus Session
          </span>
        </div>

        {/* Stats Section */}
        {hasStudyToday ? (
          <div className="space-y-3 my-2">
            <div className="bg-gray-50 dark:bg-(--surface-raised) rounded-xl p-3.5 border border-gray-200/60 dark:border-(--border-subtle) flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Focused Today
                </p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-0.5">{formattedDuration}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sessions
                </p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-0.5">{pomodoroCount}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-(--surface-raised) rounded-xl p-4 border border-gray-200/60 dark:border-(--border-subtle) my-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No sessions yet today</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Start a 25-minute focus session to begin building momentum.
            </p>
          </div>
        )}
      </div>

      {/* CTA Button and Navigation */}
      <div className="pt-4 mt-2 border-t border-gray-100 dark:border-(--border-subtle) flex items-center justify-between gap-3 relative z-10">
        <Link
          href="/analytics"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
        >
          View analytics →
        </Link>

        <Link
          href="/pomodoro"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
        >
          <span>Start Focus</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
