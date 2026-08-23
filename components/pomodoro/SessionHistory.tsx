'use client'

import type { PomodoroSession, SessionType, SessionStatus } from '@/lib/data/pomodoro'
import { isSameLocalDay, formatStudyDuration } from '@/lib/analytics/utils'

interface SessionHistoryProps {
  sessions: PomodoroSession[]
  timezone?: string
}

const typeStyles: Record<SessionType, { label: string; badge: string; iconBg: string }> = {
  focus: {
    label: 'Focus',
    badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  short_break: {
    label: 'Short Break',
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
  long_break: {
    label: 'Long Break',
    badge: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    iconBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
  },
}

const statusStyles: Record<SessionStatus, { label: string; badge: string }> = {
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  interrupted: {
    label: 'Interrupted',
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
}

export default function SessionHistory({ sessions, timezone }: SessionHistoryProps) {
  const effectiveTz = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC')
  const now = new Date()

  // Filter for today's sessions in the user's target timezone
  const todaySessions = sessions.filter((s) => isSameLocalDay(s.started_at, now, effectiveTz))

  // Calculate today's stats
  const totalFocusSecondsToday = todaySessions
    .filter((s) => s.session_type === 'focus')
    .reduce((acc, s) => acc + (s.status === 'completed' ? s.planned_seconds : s.actual_seconds), 0)

  const completedFocusSessionsCount = todaySessions.filter(
    (s) => s.session_type === 'focus' && s.status === 'completed'
  ).length

  const formatTotalTime = (totalSeconds: number): string => {
    const mins = Math.round(totalSeconds / 60)
    return formatStudyDuration(mins)
  }

  const formatDuration = (session: PomodoroSession): string => {
    const plannedMin = Math.round(session.planned_seconds / 60)
    const actualMin = Math.round(session.actual_seconds / 60)

    if (session.status === 'completed') {
      return `${plannedMin} min`
    }
    if (actualMin === 0 && session.actual_seconds > 0) {
      return `<1 min / ${plannedMin} min`
    }
    return `${actualMin} min / ${plannedMin} min`
  }

  const formatTime = (dateStr: string): string => {
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat('en-US', {
        timeZone: effectiveTz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d)
    } catch {
      return ''
    }
  }


  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden transition-colors">
      {/* Card Header & Today's Summary */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Today&apos;s Sessions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Log of focus and break intervals completed today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl px-3 py-1.5 text-center">
            <span className="block text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Focus Time
            </span>
            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
              {formatTotalTime(totalFocusSecondsToday)}
            </span>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl px-3 py-1.5 text-center">
            <span className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Focus Done
            </span>
            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {completedFocusSessionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Session List */}
      {todaySessions.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No sessions recorded today</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
            Start the timer above to log your first study session of the day.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {todaySessions.map((session) => {
            const typeConfig = typeStyles[session.session_type] || typeStyles.focus
            const statusConfig = statusStyles[session.status] || statusStyles.completed

            return (
              <div
                key={session.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.iconBg}`}
                  >
                    {session.session_type === 'focus' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                        {typeConfig.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeConfig.badge}`}
                      >
                        {formatDuration(session)}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 block">
                      Started at {formatTime(session.started_at)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

