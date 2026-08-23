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
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
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
            <h2 className="text-base font-bold text-white tracking-tight">Study Focus</h2>
          </div>

          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">
            Pomodoro
          </span>
        </div>

        {/* Stats Section */}
        {hasStudyToday ? (
          <div className="space-y-3 my-2">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider">
                  Focused Today
                </p>
                <p className="text-2xl font-extrabold text-white mt-0.5">{formattedDuration}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider">
                  Sessions
                </p>
                <p className="text-2xl font-extrabold text-white mt-0.5">{pomodoroCount}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 my-2">
            <p className="text-sm font-semibold text-white">No sessions yet today</p>
            <p className="text-xs text-indigo-200/80 mt-1">
              Start a 25-minute focus session to begin building momentum.
            </p>
          </div>
        )}
      </div>

      {/* CTA Button and Navigation */}
      <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
        <Link
          href="/analytics"
          className="text-xs text-indigo-200 hover:text-white transition-colors hover:underline"
        >
          View analytics →
        </Link>

        <Link
          href="/pomodoro"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 shadow-xs hover:shadow-md transition-all cursor-pointer"
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
