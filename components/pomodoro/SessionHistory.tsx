'use client'

import { Flame, Coffee, Sparkles, Clock, CheckCircle2, AlertCircle, Ban } from 'lucide-react'
import type { PomodoroSession, SessionType, SessionStatus } from '@/lib/data/pomodoro'
import { isSameLocalDay, formatStudyDuration } from '@/lib/analytics/utils'

interface SessionHistoryProps {
  sessions: PomodoroSession[]
  timezone?: string
}

const typeStyles: Record<
  SessionType,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  focus: {
    label: 'Focus',
    badge: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--border-subtle)]',
    icon: Flame,
  },
  short_break: {
    label: 'Short Break',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: Coffee,
  },
  long_break: {
    label: 'Long Break',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    icon: Sparkles,
  },
}

const statusStyles: Record<
  SessionStatus,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Ban,
  },
  interrupted: {
    label: 'Interrupted',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: AlertCircle,
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
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs overflow-hidden transition-colors">
      {/* Card Header & Today's Summary */}
      <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">Today&apos;s Focus Activity</h2>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            Log of focus and rest intervals completed today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-center">
            <span className="block text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
              Total Focus
            </span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {formatTotalTime(totalFocusSecondsToday)}
            </span>
          </div>

          <div className="bg-[var(--accent-subtle)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-center">
            <span className="block text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">
              Sessions Done
            </span>
            <span className="text-sm font-bold text-[var(--accent)]">
              {completedFocusSessionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Session List */}
      {todaySessions.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">No sessions recorded today</p>
          <p className="text-xs text-[var(--foreground-muted)] max-w-xs mx-auto">
            Start the timer above to log your first study session of the day.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] max-h-96 overflow-y-auto">
          {todaySessions.map((session) => {
            const typeConfig = typeStyles[session.session_type] || typeStyles.focus
            const statusConfig = statusStyles[session.status] || statusStyles.completed
            const TypeIcon = typeConfig.icon
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={session.id}
                className="p-4 flex items-center justify-between hover:bg-[var(--surface-muted)]/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-[var(--accent)]">
                    <TypeIcon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--foreground)] truncate">
                        {typeConfig.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${typeConfig.badge}`}
                      >
                        {formatDuration(session)}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--foreground-muted)] mt-0.5 block">
                      Started at {formatTime(session.started_at)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${statusConfig.badge}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
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
