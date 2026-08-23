'use client'

import React, { useState } from 'react'
import type { PreviewSection } from './previewDemoData'

interface DashboardPreviewProps {
  onNavigate: (section: PreviewSection) => void
  onSelectTimestamp?: (timestampSecs: number) => void
}

interface DashboardTask {
  id: string
  title: string
  completed: boolean
}

export default function DashboardPreview({ onNavigate, onSelectTimestamp }: DashboardPreviewProps) {
  const [tasks, setTasks] = useState<DashboardTask[]>([
    { id: 'dt-1', title: 'Finish Tree & Graph assignment', completed: true },
    { id: 'dt-2', title: 'Complete Pomodoro session #3', completed: true },
    { id: 'dt-3', title: 'Review Graph Notes (DFS recursion)', completed: false },
    { id: 'dt-4', title: 'Read OS Chapter 2: Threads', completed: false },
  ])

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const completionPercentage = Math.round((completedCount / tasks.length) * 100)

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Header Greeting inside Mockup */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              Welcome, Memo
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
              Pro Student
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Let&apos;s make today productive.
          </p>
        </div>

        {/* 7-Day Streak Badge (Clickable -> Analytics) */}
        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          title="View Streak in Analytics"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-all cursor-pointer font-bold text-[10px] sm:text-[11px] shadow-2xs shrink-0 group"
        >
          <span className="group-hover:scale-125 transition-transform">🔥</span>
          <span className="whitespace-nowrap">7-Day Streak</span>
          <span className="text-[10px] text-orange-500 font-normal">→</span>
        </button>
      </div>

      {/* Quick Interactive Metrics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Study Time Card */}
        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs transition-all text-left cursor-pointer group min-w-0 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 w-full min-w-0">
            <span className="text-[9px] sm:text-[11px] font-medium truncate block">Study Time</span>
            <span className="text-[9px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:inline">
              →
            </span>
          </div>
          <div className="text-xs sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
            2h 45m
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 truncate block mt-0.5">
            +35m today
          </span>
        </button>

        {/* Pomodoros Card */}
        <button
          type="button"
          onClick={() => onNavigate('pomodoro')}
          className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-xs transition-all text-left cursor-pointer group min-w-0 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 w-full min-w-0">
            <span className="text-[9px] sm:text-[11px] font-medium truncate block">Pomodoros</span>
            <span className="text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:inline">
              →
            </span>
          </div>
          <div className="text-xs sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            4 Done
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 truncate block mt-0.5">
            Target: 6
          </span>
        </button>

        {/* Tasks Done Card */}
        <button
          type="button"
          onClick={() => onNavigate('tasks')}
          className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 shadow-2xs hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-xs transition-all text-left cursor-pointer group min-w-0 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 w-full min-w-0">
            <span className="text-[9px] sm:text-[11px] font-medium truncate block">Tasks Done</span>
            <span className="text-[9px] text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:inline">
              →
            </span>
          </div>
          <div className="text-xs sm:text-base font-extrabold text-amber-600 dark:text-amber-400 truncate">
            {completedCount} / {tasks.length}
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 truncate block mt-0.5">
            {completionPercentage}% complete
          </span>
        </button>
      </div>

      {/* Split Screen: Active Video Study + Focus Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
        {/* Left: Video Player & Timestamped Notes (7 cols on lg+) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-3 sm:p-3.5 space-y-2.5 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-semibold text-gray-800 dark:text-gray-200 mb-2 min-w-0">
              <span className="truncate">Data Structures &amp; Algorithms</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold shrink-0">
                Lecture 14
              </span>
            </div>

            {/* Simulated Interactive Video Screen with clean 16:9 Aspect Ratio */}
            <div
              onClick={() => onNavigate('videos')}
              className="relative aspect-video w-full rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-between p-2 sm:p-2.5 overflow-hidden border border-indigo-900/50 cursor-pointer group shadow-inner"
            >
              <div className="flex items-center justify-between z-10">
                <span className="px-1.5 py-0.5 rounded bg-black/70 text-[8px] sm:text-[9px] font-mono text-gray-200 backdrop-blur-xs">
                  HD 1080p
                </span>
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-[8px] sm:text-[9px] font-semibold text-white">
                  ▶ Continue
                </span>
              </div>

              {/* Hover Center Play Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 group-hover:bg-indigo-600 backdrop-blur-sm border border-white/40 group-hover:border-indigo-400 text-white flex items-center justify-center mx-auto transition-all transform group-hover:scale-110 shadow-lg z-10">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 z-10">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-3/5 h-full bg-indigo-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[8px] sm:text-[9px] text-gray-300 font-mono">
                  <span>18:42</span>
                  <span>32:10</span>
                </div>
              </div>
            </div>

            {/* Live Timestamped Notes Rows (Grid layout: auto minmax(0, 1fr)) */}
            <div className="space-y-1.5 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  onSelectTimestamp?.(252)
                  onNavigate('videos')
                }}
                className="w-full grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/40 text-[9px] sm:text-[10px] hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 transition-colors text-left cursor-pointer min-w-0"
              >
                <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold text-[8px] sm:text-[9px] shrink-0">
                  04:12
                </span>
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  DFS traversal recursion stack explanation
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTimestamp?.(765)
                  onNavigate('videos')
                }}
                className="w-full grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 text-[9px] sm:text-[10px] hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors text-left cursor-pointer min-w-0"
              >
                <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono font-semibold text-[8px] sm:text-[9px] shrink-0">
                  12:45
                </span>
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  Adjacency list vs matrix space complexity
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[9px] sm:text-[10px] text-gray-400">
            <span>2 lecture notes</span>
            <button
              type="button"
              onClick={() => onNavigate('notes')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              All Notes →
            </button>
          </div>
        </div>

        {/* Right: Today's Focus Task Checklist (5 cols on lg+) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                  Today&apos;s Focus
                </span>
                <span className="text-[9px] text-gray-400 shrink-0">({completedCount}/{tasks.length})</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                {completionPercentage}% Done
              </span>
            </div>

            {/* Task list using Grid items to prevent text overflow */}
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`w-full grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 p-1.5 sm:p-2 rounded-xl text-[9px] sm:text-[10px] border transition-all text-left cursor-pointer min-w-0 ${
                    task.completed
                      ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-100/60 dark:border-indigo-900/30 text-gray-800 dark:text-gray-200 font-medium'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] sm:text-[9px] font-bold shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {task.completed ? '✓' : ''}
                  </span>
                  <span className={`truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500">
              <span>Weekly Goal</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                18.5 / 20 hrs
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
              <div className="w-[92%] h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
