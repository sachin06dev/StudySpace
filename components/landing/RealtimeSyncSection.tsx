'use client'

import React, { useState, useRef } from 'react'
import gsap from 'gsap'
import {
  Laptop,
  Smartphone,
  Globe,
  Radio,
  Download,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

interface DeviceTask {
  id: number
  title: string
  completed: boolean
}

export default function RealtimeSyncSection() {
  const [tasks, setTasks] = useState<DeviceTask[]>([
    { id: 1, title: 'Finish Tree & Graph assignment', completed: true },
    { id: 2, title: 'Review DFS recursion notes', completed: true },
    { id: 3, title: 'Read OS Chapter 2: Threads', completed: false },
  ])

  const [lastActionOrigin, setLastActionOrigin] = useState<string>('Browser A')
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  const windowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const handleTaskToggle = (taskId: number, originName: string) => {
    setLastActionOrigin(originName)
    setIsSyncing(true)

    // Toggle task state
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    )

    // Trigger visual pulse animation on receiving panels
    if (!isReducedMotion()) {
      const otherPanels = ['Browser A', 'Browser B', 'Android'].filter((p) => p !== originName)
      otherPanels.forEach((name) => {
        const el = windowRefs.current[name]
        if (el) {
          gsap.fromTo(
            el,
            { boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.6)' },
            { boxShadow: '0 0 0 0px rgba(124, 58, 237, 0)', duration: 0.8, ease: 'power2.out' }
          )
        }
      })
    }

    setTimeout(() => {
      setIsSyncing(false)
    }, 700)
  }

  return (
    <section id="sync" className="py-20 md:py-32 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200/80 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Radio className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 animate-pulse" />
            <span>Instant Sync Across Devices</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Change it once. It&apos;s there everywhere.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Update a task, attendance record, timetable item, or note on one device and keep working from another.
          </p>
        </div>

        {/* Live Interactive Sync Stage */}
        <div className="relative max-w-5xl mx-auto mb-12">
          {/* Status Indicator Banner */}
          <div className="flex items-center justify-between mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-slate-700 dark:text-zinc-300">
                {isSyncing
                  ? `Syncing from ${lastActionOrigin} → other devices...`
                  : `Synced from ${lastActionOrigin} — live on Web & Android`}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold hidden sm:inline">
              Web &amp; Android
            </span>
          </div>

          {/* 3 Connected Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Panel 1: Browser A (Chrome) */}
            <div
              ref={(el) => {
                windowRefs.current['Browser A'] = el
              }}
              className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
                    <Laptop className="w-4 h-4 text-violet-600" />
                    <span>Browser A (Chrome)</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px]">
                    Web
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskToggle(task.id, 'Browser A')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 text-slate-400 line-through'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-200 hover:border-violet-400'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          task.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border-1.5 border-slate-300 dark:border-zinc-600'
                        }`}
                      >
                        {task.completed && '✓'}
                      </span>
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-zinc-800 text-[10.5px] text-slate-400 text-center font-mono">
                Click task to broadcast from Chrome
              </div>
            </div>

            {/* Panel 2: Browser B (Firefox / Safari) */}
            <div
              ref={(el) => {
                windowRefs.current['Browser B'] = el
              }}
              className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
                    <Globe className="w-4 h-4 text-pink-600" />
                    <span>Browser B (Firefox)</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-[10px]">
                    Web
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskToggle(task.id, 'Browser B')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 text-slate-400 line-through'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-200 hover:border-violet-400'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          task.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border-1.5 border-slate-300 dark:border-zinc-600'
                        }`}
                      >
                        {task.completed && '✓'}
                      </span>
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-zinc-800 text-[10.5px] text-slate-400 text-center font-mono">
                Click task to broadcast from Firefox
              </div>
            </div>

            {/* Panel 3: Android Companion App */}
            <div
              ref={(el) => {
                windowRefs.current['Android'] = el
              }}
              className="rounded-3xl border-2 border-violet-500/80 bg-white dark:bg-zinc-900 p-5 shadow-xl shadow-violet-500/10 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5 font-bold text-violet-700 dark:text-violet-300">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>Android Client</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    OFFLINE-READY
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskToggle(task.id, 'Android')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 text-slate-400 line-through'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-200 hover:border-violet-400'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          task.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border-1.5 border-slate-300 dark:border-zinc-600'
                        }`}
                      >
                        {task.completed && '✓'}
                      </span>
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-zinc-800 text-[10.5px] text-violet-600 dark:text-violet-400 font-semibold text-center font-mono">
                Click task to test Mobile sync
              </div>
            </div>
          </div>
        </div>

        {/* Release & Download Callout */}
        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <strong className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Latest Android APK Release
              </strong>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold">
                v1.1.3 (build 11)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Your semester timetable and attendance safe margins remain 100% available offline.
            </p>
          </div>

          <a
            href="/api/download/android"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download APK (~67 MB)</span>
          </a>
        </div>
      </div>
    </section>
  )
}
