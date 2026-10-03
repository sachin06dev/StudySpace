'use client'

import React from 'react'
import Link from 'next/link'
import { Play, BookOpen, BarChart2, CheckSquare } from 'lucide-react'

interface StudyActivitySummaryProps {
  todayStudyMinutes?: number
  pomodoroCount: number
  formattedDuration: string
  completedTasks?: number
  totalTasks?: number
  pendingTasksCount: number
}

export function StudyActivitySummary({
  pomodoroCount,
  formattedDuration,
  pendingTasksCount,
}: StudyActivitySummaryProps) {
  const quickActions = [
    {
      title: 'Start Focus Session',
      subtitle: 'Launch 25:00 Pomodoro',
      href: '/pomodoro',
      icon: Play,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
    {
      title: 'Academic Tasks',
      subtitle: `${pendingTasksCount} pending tasks`,
      href: '/tasks',
      icon: CheckSquare,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      title: 'Study Materials & Vault',
      subtitle: 'Notes, videos & PDFs',
      href: '/study',
      icon: BookOpen,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      title: 'Consistency & Analytics',
      subtitle: 'Heatmap & rhythms',
      href: '/analytics',
      icon: BarChart2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Mini Focus / Study Snapshot */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Today&apos;s Focus
          </h3>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            {pomodoroCount} {pomodoroCount === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {formattedDuration || '0m'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Active focused study time logged today
            </p>
          </div>
          <Link
            href="/pomodoro"
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
            title="Open Focus Timer"
          >
            <Play className="w-4 h-4 fill-white" />
          </Link>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md p-4 sm:p-5 shadow-2xs space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
          Quick Actions
        </h4>

        <div className="space-y-1.5">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {action.title}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {action.subtitle}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-gray-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StudyActivitySummary
