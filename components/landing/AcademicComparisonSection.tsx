'use client'

import React from 'react'
import { XCircle, CheckCircle2, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AcademicComparisonSection() {
  return (
    <section id="comparison" className="py-20 md:py-28 bg-slate-50/50 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Zap className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Workflow Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Stop juggling six tools for one semester.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            See how your daily academic workflow transforms when your schedule, classes, lectures, and notes share the same brain.
          </p>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: The Fragmented Routine */}
          <div className="rounded-3xl border border-rose-200/70 dark:border-rose-950/60 bg-white/70 dark:bg-zinc-900/60 p-7 sm:p-9 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200/70 dark:border-rose-900/50">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>The Fragmented Routine</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">High Mental Overhead</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Endless tab switching and lost context
              </h3>

              <div className="space-y-3.5 pt-2">
                {[
                  'Timetable is a cropped screenshot buried somewhere in your phone photo gallery',
                  'Attendance calculated in mental math while anxiously dreading the 75% cutoff',
                  'YouTube tutorial tabs filled with distracting recommendation feeds and comment sections',
                  'Notes typed in scattered Google Docs or Notion pages with zero link to video playback',
                  'Exam syllabus and previous year question papers lost in chat groups or downloads folder',
                  'Separate mobile Pomodoro timers that never record focus time to your real academic progress',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                    <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✕
                    </div>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-500 italic">
              Result: Constant context switching, scattered attention, and exam revision panic.
            </div>
          </div>

          {/* Card 2: The StudySpace System */}
          <div className="relative rounded-3xl border-2 border-violet-500/80 dark:border-violet-500/60 bg-linear-to-b from-violet-50/40 via-white to-violet-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-violet-950/20 p-7 sm:p-9 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group">
            {/* Subtle glow highlight */}
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-linear-to-r from-violet-600 to-purple-600 text-white text-[11px] font-bold shadow-xs uppercase tracking-wider">
              Unified Academic Flow
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/70 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-300/70 dark:border-violet-800/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>The StudySpace System</span>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">Zero Friction</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                A single calm space for your entire semester
              </h3>

              <div className="space-y-3.5 pt-2">
                {[
                  'Instant schedule on both Web and offline Android with room numbers and professor names',
                  '1-tap attendance marking with real-time safe bunk allowance and minimum goal calculations',
                  'Clean distraction-free lecture player stripped of recommended feeds, sidebars, and ads',
                  'Timestamped notes pinned directly to video seconds so you can click to jump back instantly',
                  'Subject-organized academic vault for course syllabus PDFs, slides, and exam question papers',
                  'Built-in Pomodoro focus timer that automatically logs focused minutes into your habit heatmap',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs">
                      ✓
                    </div>
                    <span className="leading-relaxed font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-violet-200/60 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-violet-700 dark:text-violet-300 font-semibold">
                Designed to compound your daily consistency.
              </span>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Try it free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
