'use client'

import Link from 'next/link'
import { useTimer } from '@/lib/pomodoro/timerStore'

export default function PomodoroMiniWidget() {
  const { sessionType, remainingSeconds, isRunning, isPaused, pause, resume, formatTimeDisplay } =
    useTimer()

  if (!isRunning && !isPaused) {
    return null
  }

  const modeThemes = {
    focus: {
      label: 'Focus',
      bg: 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-200/80 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200',
      badge: 'bg-indigo-600 text-white',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
    short_break: {
      label: 'Break',
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
      badge: 'bg-emerald-600 text-white',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    long_break: {
      label: 'Long Break',
      bg: 'bg-violet-50/90 dark:bg-violet-950/70 border-violet-200/80 dark:border-violet-800 text-violet-900 dark:text-violet-200',
      badge: 'bg-violet-600 text-white',
      accent: 'text-violet-600 dark:text-violet-400',
    },
  }

  const theme = modeThemes[sessionType]

  return (
    <div
      className={`rounded-xl border p-3 shadow-xs transition-all ${theme.bg} animate-in fade-in-50 duration-200`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider truncate">
            {theme.label}
          </span>
        </div>

        <Link
          href="/pomodoro"
          className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer underline decoration-gray-300 dark:decoration-gray-600"
          title="Open Full Timer"
        >
          Open
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link
          href="/pomodoro"
          className="font-mono text-lg font-extrabold tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
        >
          {formatTimeDisplay(remainingSeconds)}
        </Link>

        <div className="flex items-center gap-1">
          {isRunning ? (
            <button
              type="button"
              onClick={pause}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200/60 shadow-2xs transition-all cursor-pointer"
              title="Pause Timer"
              aria-label="Pause Timer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={resume}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer"
              title="Resume Timer"
              aria-label="Resume Timer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
