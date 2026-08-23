'use client'

import Link from 'next/link'
import type { PomodoroAnalyticsData } from '@/lib/data/analytics'

export interface PomodoroStatsCardProps {
  data: PomodoroAnalyticsData
}

export default function PomodoroStatsCard({ data }: PomodoroStatsCardProps) {
  const hasSessions = data.totalCompleted > 0
  const recentList = (data.recentSessions || []).slice(0, 4)

  return (
    <div
      id="pomodoro-stats"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4 transition-all"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
            🍅
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pomodoro Focus Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your focus sessions at a glance
            </p>
          </div>
        </div>

        <Link
          href="/pomodoro"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>Open Timer</span>
          <span>→</span>
        </Link>
      </div>

      {/* 2. 4 Compact Aggregate Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Sessions */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5 transition-all">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>🍅</span>
            <span>Sessions</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {data.totalCompleted}
          </div>
        </div>

        {/* Total Focus */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5 transition-all">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>⏱️</span>
            <span>Total Focus</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
            {data.formattedFocusTime || '0 min'}
          </div>
        </div>

        {/* Avg Session */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5 transition-all">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>⌛</span>
            <span>Avg Session</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
            {data.averageSessionMinutes > 0 ? `${data.averageSessionMinutes} min` : '0 min'}
          </div>
        </div>

        {/* Longest Session */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5 transition-all">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>🔥</span>
            <span>Longest</span>
          </div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">
            {data.formattedLongestSession || (data.longestSessionMinutes > 0 ? `${data.longestSessionMinutes} min` : '0 min')}
          </div>
        </div>
      </div>

      {/* 3. Optional Recent Focus Sessions */}
      {hasSessions && recentList.length > 0 ? (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Recent Focus Sessions</span>
            <span className="text-[11px] font-normal text-slate-400">Last {recentList.length}</span>
          </div>

          <div className="space-y-1.5">
            {recentList.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {session.dateLabel}
                  </span>
                  {session.timeLabel && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {session.timeLabel}
                    </span>
                  )}
                </div>

                <div className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-[11px]">
                  {session.formattedDuration}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-1">
            No completed sessions recorded yet. Start a focus interval to see stamina metrics.
          </p>
        </div>
      )}
    </div>
  )
}
