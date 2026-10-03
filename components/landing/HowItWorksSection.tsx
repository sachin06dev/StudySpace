'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ScanLine,
  ShieldCheck,
  Video,
  BarChart2,
  Clock,
  Link as LinkIcon,
  BookOpen,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function ScanVisual() {
  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border-2 border-dashed border-violet-400/40 bg-zinc-900/90 p-5 text-center min-h-[110px] flex flex-col items-center justify-center gap-2">
        <ScanLine className="w-7 h-7 text-violet-400 animate-pulse" />
        <span className="text-[11px] font-mono text-violet-300">Scanning college routine board…</span>
        <div className="absolute inset-x-4 top-1/2 h-px bg-violet-500/40 animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
        {[
          { sub: 'DBMS', room: 'A-204', time: '9:00 AM' },
          { sub: 'OS Lab', room: 'B-301', time: '11:00 AM' },
          { sub: 'CN', room: 'A-101', time: '2:00 PM' },
        ].map((c) => (
          <div key={c.sub} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-center">
            <strong className="block text-white text-xs">{c.sub}</strong>
            <span className="text-[10px] text-zinc-400">{c.room}</span>
            <span className="block text-violet-400 text-[10px] font-bold">{c.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceVisual() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-zinc-400">Operating Systems · Attendance</span>
          <span className="text-base font-extrabold text-emerald-400 font-mono">85.7%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: '85.7%' }} />
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center shadow-xs">
          ✓ Present
        </div>
        <div className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400 text-xs font-bold text-center">
          ✗ Absent
        </div>
      </div>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-xs font-mono text-emerald-300">
          Safe margin: <strong>Safe to miss 4 classes</strong>
        </span>
      </div>
    </div>
  )
}

function StudyVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-md">
            <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-white ml-0.5" />
          </div>
          <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-300 bg-black/70 px-2 py-0.5 rounded">
            14:32 / 52:18
          </div>
        </div>
        <div className="h-1 bg-zinc-800">
          <div className="h-full bg-violet-600" style={{ width: '28%' }} />
        </div>
      </div>
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-950/50 border border-violet-800/40 text-xs">
        <LinkIcon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span className="font-mono text-violet-200">
          <strong className="text-violet-400">14:32</strong> → Quicksort partition function
        </span>
      </div>
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
        <Clock className="w-4 h-4 text-amber-400" />
        <span className="font-mono text-zinc-300">
          Pomodoro: <strong className="text-amber-300">18:42</strong> focus active
        </span>
      </div>
    </div>
  )
}

function TrackVisual() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-400 block mb-2.5 uppercase tracking-wider">
          Study Activity — 12-Week Consistency
        </span>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 84 }, (_, i) => {
            const levels = [0, 1, 2, 3, 4]
            const level = levels[Math.abs(Math.sin(i * 7.3) * 4) | 0]
            const colors = ['bg-zinc-800', 'bg-violet-950', 'bg-violet-800', 'bg-violet-600', 'bg-violet-400']
            return <div key={i} className={`h-2.5 rounded-xs ${colors[level]}`} />
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 text-center font-mono">
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
          <strong className="text-2xl text-amber-400 block font-bold">87%</strong>
          <span className="text-zinc-500 text-[10px]">Consistency</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
          <strong className="text-2xl text-violet-400 block font-bold">142</strong>
          <span className="text-zinc-500 text-[10px]">Focus sessions</span>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    id: 'scan',
    number: '01',
    tag: 'AI Timetable Scanner',
    title: 'Scan your timetable in 10 seconds.',
    description:
      "Point your phone camera at your college notice board or syllabus paper. StudySpace's AI extracts class slots, room numbers, timings, and professors into a live schedule — zero tedious manual entry.",
    icon: ScanLine,
    Visual: ScanVisual,
  },
  {
    id: 'attendance',
    number: '02',
    tag: 'Safe Bunk Engine',
    title: '1-tap attendance, instant safety margin.',
    description:
      'Right outside the lecture hall, mark Present or Absent in one tap. StudySpace recalculates your exact safe bunk margin and warns you weeks before you risk breaching the 75% university threshold.',
    icon: ShieldCheck,
    Visual: AttendanceVisual,
  },
  {
    id: 'study',
    number: '03',
    tag: 'Distraction-Free Study',
    title: 'Watch lectures, pin notes, stay focused.',
    description:
      'Focused YouTube lecture player with playback speed controls. Pin timestamped notes to exact video seconds so you can jump straight to professor explanations during exam revision. Integrated Pomodoro logs your focus automatically.',
    icon: Video,
    Visual: StudyVisual,
  },
  {
    id: 'track',
    number: '04',
    tag: 'Consistency Analytics',
    title: 'See your real progress over the semester.',
    description:
      'Your 365-day activity heatmap tracks every focus session, attendance mark, and completed task. Watch your consistency score compound week after week — building genuine academic discipline without burnout.',
    icon: BarChart2,
    Visual: TrackVisual,
  },
]

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (!sectionRef.current || isReducedMotion()) return

    const mm = gsap.matchMedia()

    // Desktop: CSS Sticky left visual + ScrollTrigger on right scrolling blocks
    mm.add('(min-width: 768px)', () => {
      stepCardRefs.current.forEach((card, idx) => {
        if (!card) return

        ScrollTrigger.create({
          trigger: card,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => setActiveStep(idx),
          onEnterBack: () => setActiveStep(idx),
        })
      })
    })

    return () => mm.revert()
  }, [])

  const CurrentVisual = STEPS[activeStep].Visual

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 scroll-mt-16 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-violet-200/70 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <BookOpen className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Your full semester in{' '}
            <span className="text-violet-600 dark:text-violet-400">
              4 simple steps.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Set up once at the start of term. Every tool connects to the same subjects so you stay ahead effortlessly.
          </p>
        </div>

        {/* Desktop: 2-Column Unpinned Sticky Layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: CSS Sticky Visual Display */}
          <div className="md:col-span-5 sticky top-24 self-start space-y-4">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-300">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                    STEP {STEPS[activeStep].number} — {STEPS[activeStep].tag}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                  {activeStep + 1} of {STEPS.length}
                </span>
              </div>

              {/* Dynamic Step Visual */}
              <div className="min-h-[260px] flex flex-col justify-center">
                <CurrentVisual />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 px-2">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeStep === i
                      ? 'w-10 bg-violet-600 dark:bg-violet-400'
                      : 'w-2 bg-slate-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Standard Scrolling Step Blocks */}
          <div className="md:col-span-7 space-y-24 py-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isCurrent = activeStep === idx

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    stepCardRefs.current[idx] = el
                  }}
                  className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 min-h-[50vh] flex flex-col justify-center ${
                    isCurrent
                      ? 'bg-white dark:bg-zinc-900/90 border-violet-500/80 shadow-lg'
                      : 'bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200/60 dark:border-zinc-850 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 inline-flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span>STEP {step.number}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 mb-3 tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile: Linear Stacked Layout (No Sticky, Visual Inline With Card) */}
        <div className="md:hidden space-y-8">
          {STEPS.map((step) => {
            const Visual = step.Visual
            return (
              <div
                key={step.id}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                    STEP {step.number}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>

                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
                  <Visual />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
