'use client'

import React, { useState } from 'react'
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

const STAGES = [
  {
    id: 'setup',
    num: 'Stage 01',
    tab: 'Before Classes',
    headline: 'Set up once. Everything attaches automatically.',
    description:
      'Create your semester and set your required attendance threshold (75% or 85%). Scan your schedule routine board with AI or enter class slots by hand. Your subjects become the single source of truth.',
    icon: Calendar,
    tools: [
      { name: 'Semester Engine', desc: 'Define active term, term dates & targets' },
      { name: 'Subjects Master', desc: 'Add courses once for attendance, notes & tasks' },
      { name: 'AI Routine Scanner', desc: 'Digitize timetable from a camera photo' },
    ],
    badge: 'Semester Setup',
  },
  {
    id: 'during',
    num: 'Stage 02',
    tab: 'During the Term',
    headline: 'Run the week without mental friction.',
    description:
      'Check your daily countdown to see what room to head to. Mark attendance in 1 tap and see your live bunk allowance. Watch lectures distraction-free and link notes to exact seconds while Pomodoro logs your focus.',
    icon: Clock,
    tools: [
      { name: '1-Tap Attendance', desc: 'Present, Absent, or Cancel with instant buffer math' },
      { name: 'YouTube Lecture Hub', desc: 'Save YouTube lectures with resume & speed controls' },
      { name: 'Timestamped Notes', desc: 'Take notes linked to the exact lecture second' },
      { name: 'Pomodoro Suite', desc: 'Deep focus intervals with ambient soundscapes' },
    ],
    badge: 'Weekly Execution',
  },
  {
    id: 'exams',
    num: 'Stage 03',
    tab: 'Exam Season',
    headline: 'Revise with immediate context and clarity.',
    description:
      'When midterms and finals arrive, you don’t need to dig through messy chat groups. Everything you collected all term is already organized by subject, with notes jumping straight back to difficult lecture concepts.',
    icon: GraduationCap,
    tools: [
      { name: 'Document Vault', desc: 'Syllabus PDFs, lecture slides, and past exam papers' },
      { name: 'Linked Revision', desc: 'Click any note timestamp to re-watch tough proofs' },
      { name: 'Consistency Analytics', desc: 'Review 365-day study heatmap and subject balance' },
    ],
    badge: 'Exam Mastery',
  },
]

export default function SemesterJourneySection() {
  const [activeStage, setActiveStage] = useState(1) // Default to Stage 2: During the Term

  const current = STAGES[activeStage]
  const Icon = current.icon

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200/80 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <BookOpen className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>The Semester Progression</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Built around how a semester actually unfolds.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Three distinct phases. Each one leans on the tools that matter most right then.
          </p>
        </div>

        {/* Stage Selector Segment Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeStage === idx
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="hidden sm:inline font-mono mr-1.5 opacity-75">{s.num}:</span>
                <span>{s.tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Stage Presentation Card */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-6 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Story column */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  {current.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">{current.num} of 3</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
                {current.headline}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                {current.description}
              </p>

              <div className="pt-2">
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm hover:underline"
                >
                  <span>Experience {current.tab} in StudySpace</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Tools list card */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono">
                      Integrated Stage Tools
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{current.tools.length} Features Active</span>
                </div>

                {current.tools.map((t) => (
                  <div
                    key={t.name}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                        {t.name}
                      </strong>
                      <span className="text-[11.5px] text-slate-500 dark:text-zinc-400 leading-snug">
                        {t.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
