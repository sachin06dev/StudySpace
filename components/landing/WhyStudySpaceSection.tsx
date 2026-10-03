import React from 'react'
import Link from 'next/link'
import {
  Layers,
  Clock,
  ShieldCheck,
  BookmarkCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface GroundedPillar {
  number: string
  statement: string
  detail: string
  highlight: string
  icon: React.ReactNode
}

const PILLARS: GroundedPillar[] = [
  {
    number: '01',
    statement: 'One place instead of five.',
    detail: 'No more jumping between scattered timetable images, attendance spreadsheets, YouTube video tabs, PDF viewers, and separate focus timers. Everything lives in one focused workspace.',
    highlight: 'Unified Academic Hub',
    icon: <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
  },
  {
    number: '02',
    statement: "Know what's next.",
    detail: 'Upcoming class countdown, room number, and professor details are visible the moment you open the app, so you never sprint to the wrong campus hall.',
    highlight: 'Zero Classroom Confusion',
    icon: <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
  },
  {
    number: '03',
    statement: 'Stay ahead of attendance.',
    detail: '1-tap marking right outside class gives you immediate safety margin feedback before attendance accidentally drops below the university requirement.',
    highlight: 'Automatic Safety Buffers',
    icon: <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
  },
  {
    number: '04',
    statement: 'Keep lectures and notes together.',
    detail: 'Watch course playlists distraction-free and pin notes to exact video seconds for rapid, context-rich exam revision.',
    highlight: 'Timestamp-Linked Context',
    icon: <BookmarkCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
  },
  {
    number: '05',
    statement: 'See your progress over time.',
    detail: 'Build honest study habits with daily consistency heatmaps, Pomodoro completion tallies, and assignment milestones that compound week after week.',
    highlight: 'Real Learning Momentum',
    icon: <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
  },
]

export default function WhyStudySpaceSection() {
  return (
    <section id="why" className="py-20 md:py-28 scroll-mt-16 bg-slate-50/50 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Why StudySpace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            A simpler, calmer way to stay on top of college.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Designed to remove academic friction so you can focus on learning instead of managing tools.
          </p>
        </div>

        {/* Typographic & Visual Progression */}
        <div className="space-y-4 max-w-5xl mx-auto">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="group p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50 shrink-0 group-hover:scale-105 transition-transform">
                  {pillar.icon}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                      {pillar.number}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-semibold">
                      {pillar.highlight}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                    {pillar.statement}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    {pillar.detail}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-2 md:pt-0 self-end md:self-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Experience it</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
