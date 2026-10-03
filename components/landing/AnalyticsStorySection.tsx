'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Flame,
  Clock,
  ShieldCheck,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function AnalyticsStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<(HTMLDivElement | null)[]>([])

  const subjects = [
    { name: 'Data Structures & Algorithms', pct: 38, hours: '47h 15m', color: 'bg-violet-600' },
    { name: 'Operating Systems (CS204)', pct: 27, hours: '33h 30m', color: 'bg-purple-500' },
    { name: 'Computer Networks (CS208)', pct: 20, hours: '24h 50m', color: 'bg-pink-500' },
    { name: 'Database Management (CS212)', pct: 15, hours: '18h 40m', color: 'bg-indigo-500' },
  ]

  // Generate 182 cells (26 weeks x 7 days)
  const cells = Array.from({ length: 182 }, (_, i) => {
    // Generate pseudo-realistic study intensity levels (0 to 4)
    const isWeekend = i % 7 >= 5
    const seed = Math.sin(i * 12.9898) * 43758.5453
    const rand = Math.abs(seed) % 1
    const val = rand * (isWeekend ? 0.6 : 1.0)
    const level = val < 0.28 ? 0 : val < 0.48 ? 1 : val < 0.72 ? 2 : val < 0.9 ? 3 : 4
    return level
  })

  useEffect(() => {
    if (!sectionRef.current || isReducedMotion()) return

    const heatmapCells = heatmapRef.current?.querySelectorAll('.hm-cell') || []
    const validBars = barsRef.current.filter((b): b is HTMLDivElement => b !== null)

    // 1. Heatmap cells progressive stagger reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
      },
    })

    if (heatmapCells.length > 0) {
      gsap.set(heatmapCells, { scale: 0.2, opacity: 0 })
      tl.to(
        heatmapCells,
        {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          stagger: {
            amount: 1.2,
            from: 'start',
          },
          ease: 'power2.out',
        },
        0
      )
    }

    // 2. Subject progress bars filling
    validBars.forEach((bar, i) => {
      const targetWidth = bar.getAttribute('data-pct') || '0%'
      gsap.set(bar, { width: '0%' })
      tl.to(
        bar,
        {
          width: targetWidth,
          duration: 1.1,
          ease: 'power3.out',
        },
        0.3 + i * 0.12
      )
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 bg-slate-50/50 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200/80 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <BarChart3 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Habit &amp; Focus Analytics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            See the pattern in your semester effort.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Analytics generated directly from your verified attendance records, completed Pomodoro blocks, and timestamped lecture revisions.
          </p>
        </div>

        {/* 4 Top KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs text-left">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">TOTAL STUDY TIME</span>
              <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              124h 15m
            </strong>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1 font-medium">
              +14% vs last month
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs text-left">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">ACTIVE STREAK</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              7 Days
            </strong>
            <span className="text-[11px] text-orange-600 dark:text-orange-400 block mt-1 font-medium">
              Daily goal achieved
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs text-left">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">AVG ATTENDANCE</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <strong className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              85.7%
            </strong>
            <span className="text-[11px] text-slate-500 block mt-1 font-medium">
              Safe bunk buffer: 4 classes
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs text-left">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">FOCUS BLOCKS</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              148 Done
            </strong>
            <span className="text-[11px] text-violet-600 dark:text-violet-400 block mt-1 font-medium">
              25m Pomodoro cycles
            </span>
          </div>
        </div>

        {/* Analytics Composition Grid: Heatmap + Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Consistency Heatmap (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    26-Week Consistency Heatmap
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    142 active study days this academic semester
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  REALTIME LOG
                </span>
              </div>

              {/* Heatmap Grid */}
              <div
                ref={heatmapRef}
                className="grid grid-rows-7 grid-flow-col gap-1 sm:gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/70 dark:border-zinc-800 overflow-x-auto"
              >
                {cells.map((lvl, idx) => {
                  const colors = [
                    'bg-slate-200/70 dark:bg-zinc-800/60',
                    'bg-violet-200 dark:bg-violet-950',
                    'bg-violet-400 dark:bg-violet-800',
                    'bg-violet-600 dark:bg-violet-600',
                    'bg-violet-800 dark:bg-violet-400',
                  ]
                  return (
                    <div
                      key={idx}
                      className={`hm-cell w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] transition-transform hover:scale-125 ${colors[lvl]}`}
                      title={`Study Day ${idx + 1}: Level ${lvl}`}
                    />
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <span>Less active</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-200/70 dark:bg-zinc-800/60" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-violet-200 dark:bg-violet-950" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-violet-400 dark:bg-violet-800" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-violet-600 dark:bg-violet-600" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-violet-800 dark:bg-violet-400" />
                </div>
                <span>More active</span>
              </div>
            </div>
          </div>

          {/* Subject Distribution (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Subject Time Distribution
                </h4>
                <span className="text-xs text-slate-400 font-mono">By Hours</span>
              </div>

              <div className="space-y-4">
                {subjects.map((s, idx) => (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate pr-2">
                        {s.name}
                      </span>
                      <span className="font-mono text-slate-500 shrink-0 font-medium">
                        {s.hours} ({s.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          barsRef.current[idx] = el
                        }}
                        data-pct={`${s.pct}%`}
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Auto-tracked from Pomodoro</span>
              <span className="text-violet-600 dark:text-violet-400 font-semibold font-mono">100% Private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
