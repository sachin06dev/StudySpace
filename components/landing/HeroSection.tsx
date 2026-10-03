'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Calendar,
  Timer,
  FileText,
  Pause,
  Bell,
  CheckSquare,
  BookOpen,
  FolderArchive,
  Video,
  ListVideo,
} from 'lucide-react'
import HandDrawnUnderline from '@/components/landing/HandDrawnUnderline'
import type { MobileReleaseManifest } from '@/lib/config/release'
import { isReducedMotion, setupMagnetic } from '@/lib/animations/landing'

type DemoTab = 'dashboard' | 'attendance' | 'timetable' | 'study' | 'analytics'
type StudySubTab = 'pomodoro' | 'tasks' | 'notes' | 'videos' | 'playlists' | 'resources' | 'documents'

export default function HeroSection({ release }: { release?: MobileReleaseManifest }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaGroupRef = useRef<HTMLDivElement>(null)
  const primaryCtaRef = useRef<HTMLAnchorElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)

  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)
  const card4Ref = useRef<HTMLDivElement>(null)

  // Interactive Demo State
  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard')
  const [studySubTab, setStudySubTab] = useState<StudySubTab>('pomodoro')

  // Live Timer State
  const [focusSeconds, setFocusSeconds] = useState(1458) // 24:18
  const [isFocusTicking, setIsFocusTicking] = useState(true)

  // Attendance Simulation State
  const [attendanceBuffer, setAttendanceBuffer] = useState(4)
  const [attendanceMarked, setAttendanceMarked] = useState<boolean | null>(true)

  // Tasks State
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Finish OS Semaphore Lab', tag: 'CS204', priority: 'High', completed: true },
    { id: 2, title: 'Review Graph DFS recursion stack', tag: 'CS201', priority: 'High', completed: true },
    { id: 3, title: 'Submit DBMS Normalization Sheet', tag: 'CS301', priority: 'Med', completed: false },
    { id: 4, title: 'Read Computer Networks Chapter 3', tag: 'CS304', priority: 'Med', completed: false },
    { id: 5, title: 'Practice Discrete Probability Proofs', tag: 'MA202', priority: 'Low', completed: true },
  ])

  // Timetable Day State
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Thu')

  const versionText = release?.latestVersion ? `v${release.latestVersion}` : 'v1.1.3'

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Ticking demo timer for live feel
  useEffect(() => {
    if (!isFocusTicking) return
    const interval = setInterval(() => {
      setFocusSeconds((prev) => (prev > 0 ? prev - 1 : 1500))
    }, 1000)
    return () => clearInterval(interval)
  }, [isFocusTicking])

  const toggleTask = (id: number) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  // Natural random heatmap data (52 weeks for edge-to-edge full width layout)
  const miniHeatmap = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280
      return x - Math.floor(x)
    }

    const weeks = []
    for (let w = 0; w < 52; w++) {
      const days = []
      for (let d = 0; d < 7; d++) {
        const rand = seededRandom(w * 7 + d + 33)
        let level = 0
        if (rand > 0.55 && rand <= 0.78) level = 1
        else if (rand > 0.78 && rand <= 0.90) level = 2
        else if (rand > 0.90) level = 3
        days.push(level)
      }
      weeks.push(days)
    }
    return weeks
  }, [])

  // Robust GSAP Entrance & perpetual floating physics + mouse parallax
  useEffect(() => {
    if (!heroRef.current) return
    const reduced = isReducedMotion()

    const cleanupMagnetic = primaryCtaRef.current
      ? setupMagnetic(primaryCtaRef.current, 0.2, 0.3)
      : () => {}

    if (reduced) return () => cleanupMagnetic()

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    if (eyebrowRef.current) {
      tl.fromTo(eyebrowRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5 }, 0)
    }

    if (line1Ref.current && line2Ref.current) {
      tl.fromTo(line1Ref.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75 }, 0.1)
      tl.fromTo(line2Ref.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75 }, 0.22)
    }

    if (paragraphRef.current) {
      tl.fromTo(paragraphRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.32)
    }

    if (ctaGroupRef.current) {
      tl.fromTo(ctaGroupRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.42)
    }

    // Floating cards entrance with spring back
    const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current].filter(Boolean)
    if (cards.length > 0) {
      tl.fromTo(
        cards,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'back.out(1.5)' },
        0.5
      )

      // Perpetual individual floating motion (customized duration & phase for organic feeling)
      if (card1Ref.current) {
        gsap.to(card1Ref.current, {
          y: '-=9',
          rotation: -1.2,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
      if (card2Ref.current) {
        gsap.to(card2Ref.current, {
          y: '-=8',
          rotation: 1.0,
          duration: 3.0,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.4,
        })
      }
      if (card3Ref.current) {
        gsap.to(card3Ref.current, {
          y: '-=11',
          rotation: 0.9,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.8,
        })
      }
      if (card4Ref.current) {
        gsap.to(card4Ref.current, {
          y: '-=8',
          rotation: -1.1,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.2,
        })
      }
    }

    // Interactive Mouse Parallax for Cards
    const heroEl = heroRef.current
    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroEl.getBoundingClientRect()
      const xRel = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      const yRel = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)

      if (card1Ref.current) {
        gsap.to(card1Ref.current, { x: xRel * -16, y: yRel * -10, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
      }
      if (card2Ref.current) {
        gsap.to(card2Ref.current, { x: xRel * 18, y: yRel * -12, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
      }
      if (card3Ref.current) {
        gsap.to(card3Ref.current, { x: xRel * -14, y: yRel * 12, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
      }
      if (card4Ref.current) {
        gsap.to(card4Ref.current, { x: xRel * 15, y: yRel * 10, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
      }
    }

    heroEl.addEventListener('mousemove', handleMouseMove)

    if (demoRef.current) {
      tl.fromTo(demoRef.current, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0.6)
    }

    return () => {
      heroEl.removeEventListener('mousemove', handleMouseMove)
      cleanupMagnetic()
      tl.kill()
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative pt-10 pb-16 md:pt-16 md:pb-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
        {/* Floating Feature Cards Around Heading (Desktop Absolute Positioning) */}
        <div className="relative max-w-4xl mx-auto">
          {/* Card 1: Attendance Safeguard (Top Left Float) */}
          <div ref={card1Ref} className="hidden xl:block absolute -left-36 top-2 w-64 hero-float-card z-20 text-left">
            <button
              type="button"
              onClick={() => {
                setAttendanceBuffer((prev) => (prev > 1 ? prev - 1 : 5))
                if (card1Ref.current) {
                  gsap.fromTo(card1Ref.current, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
                }
              }}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-violet-400 dark:hover:border-violet-600 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs font-bold font-mono">
                    85%
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Attendance</strong>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">Digital Electronics</span>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>✓ Safe to miss</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 font-bold font-mono text-xs">
                  {attendanceBuffer}
                </span>
                <span>classes</span>
              </div>
              <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 block mt-1">
                Tap to simulate next absence
              </span>
            </button>
          </div>

          {/* Card 2: Focus Session (Top Right Float) */}
          <div ref={card2Ref} className="hidden xl:block absolute -right-36 top-2 w-64 hero-float-card z-20 text-left">
            <button
              type="button"
              onClick={() => {
                setIsFocusTicking(!isFocusTicking)
                if (card2Ref.current) {
                  gsap.fromTo(card2Ref.current, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
                }
              }}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-violet-400 dark:hover:border-violet-600 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 flex items-center justify-center text-xs font-mono font-bold">
                    <Timer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Focus Session</strong>
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono font-bold flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isFocusTicking ? 'bg-pink-500 animate-pulse' : 'bg-slate-400'}`} />
                      {isFocusTicking ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-500 font-mono">🔥 7d</span>
              </div>
              <div className="text-sm font-mono font-extrabold text-slate-900 dark:text-zinc-100">
                {formatTime(focusSeconds)}
              </div>
              <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 block mt-1">
                Tap to {isFocusTicking ? 'pause' : 'resume'} timer
              </span>
            </button>
          </div>

          {/* Card 3: Lecture Note (Mid Left Float) - Interactive */}
          <div ref={card3Ref} className="hidden xl:block absolute -left-32 bottom-2 w-64 hero-float-card z-20 text-left">
            <button
              type="button"
              onClick={() => {
                setActiveTab('study')
                setStudySubTab('notes')
                demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                if (card3Ref.current) {
                  gsap.fromTo(card3Ref.current, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
                }
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-violet-400 dark:hover:border-violet-600 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold">
                  14:32
                </span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 truncate">
                  Virtual Memory Page Table
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                Hardware MMU translates virtual page numbers.
              </p>
              <span className="text-[9.5px] text-violet-600 dark:text-violet-400 font-semibold block mt-1 group-hover:translate-x-0.5 transition-transform">
                Open in Lecture Hub →
              </span>
            </button>
          </div>

          {/* Card 4: Next Class Alert (Mid Right Float) - Interactive */}
          <div ref={card4Ref} className="hidden xl:block absolute -right-32 bottom-2 w-64 hero-float-card z-20 text-left">
            <button
              type="button"
              onClick={() => {
                setActiveTab('timetable')
                demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                if (card4Ref.current) {
                  gsap.fromTo(card4Ref.current, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
                }
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-violet-400 dark:hover:border-violet-600 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ● NEXT CLASS 10:30 AM
                </span>
                <Bell className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <strong className="text-[11.5px] font-bold text-slate-900 dark:text-zinc-100 block truncate">
                Digital Electronics (CT-05)
              </strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate">
                Room CT-05 · Mr. Deepak Sankhla
              </span>
              <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1 group-hover:translate-x-0.5 transition-transform">
                View Today&apos;s Routine →
              </span>
            </button>
          </div>

          {/* 1. Student Eyebrow */}
          <div ref={eyebrowRef} className="mb-3.5 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>StudySpace 4U · Web + Android</span>
              <span className="text-slate-300 dark:text-zinc-600">•</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                Free for University Students ({versionText})
              </span>
            </div>
          </div>

          {/* 2. Hero Headline with visible animated lines */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-[1.12] sm:leading-[1.14] mb-3">
            <span ref={line1Ref} className="block will-change-transform">
              Your semester,
            </span>
            <span ref={line2Ref} className="relative inline-block text-violet-600 dark:text-violet-400 will-change-transform mt-1">
              finally in one place.
              <HandDrawnUnderline className="w-full" color="#7c3aed" />
            </span>
          </h1>

          {/* 3. Supporting Copy */}
          <p
            ref={paragraphRef}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto mb-5 font-normal leading-relaxed"
          >
            Classes, attendance, lectures, tasks, notes, documents, and focus — all together in one privacy-respecting study workspace.
          </p>

          {/* 4. Action CTAs */}
          <div
            ref={ctaGroupRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6"
          >
            <Link
              ref={primaryCtaRef}
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all group"
            >
              <span>Start free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/#product"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold text-sm transition-colors"
            >
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Mobile/Tablet 2x2 Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto mb-6 xl:hidden text-left">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                ATTENDANCE: 85%
              </span>
              <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                {attendanceBuffer} safe bunks left
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono text-pink-600 dark:text-pink-400 font-bold block">
                POMODORO: {formatTime(focusSeconds)}
              </span>
              <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                🔥 7 Day Streak
              </strong>
            </div>
          </div>
        </div>

        {/* 5. Central Interactive Product Demo (Full 5-Column Width, Zero Side Crowding) */}
        <div
          ref={demoRef}
          className="relative max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden text-left"
        >
          {/* Browser Window Chrome */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 ml-2">
                studyspace4u.app/workspace
              </span>
            </div>

            {/* Navigation Tabs (Dashboard, Attendance, Timetable, Study, Analytics) */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-zinc-800/80 rounded-xl overflow-x-auto select-none">
              {(
                [
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'attendance', label: 'Attendance' },
                  { id: 'timetable', label: 'Timetable' },
                  { id: 'study', label: 'Study' },
                  { id: 'analytics', label: 'Analytics' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: DASHBOARD VIEW (Pixel-authentic to real app screenshot) */}
          {activeTab === 'dashboard' && (
            <div className="p-4 sm:p-6 space-y-5 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
              {/* Header: Greeting & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold block">
                    OVERVIEW
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                    Good day, Sachin
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Today is Thu, Oct 1 • Let&apos;s make today count.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Weekly Schedule
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('study')
                      setStudySubTab('pomodoro')
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Start Focus
                  </button>
                </div>
              </div>

              {/* Next Class & Daily Compass Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Next Class Card (7 cols) */}
                <div className="md:col-span-7 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold font-mono text-[10px]">
                      NEXT CLASS
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      ⏱ 10:30 - 11:30
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Digital Electronics <span className="text-xs font-normal text-slate-400">3IT3-04</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      📍 Room CT-05 · Mr. Deepak Sankhla · Theory
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAttendanceMarked(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          attendanceMarked === true
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        ✓ Mark Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceMarked(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          attendanceMarked === false
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        ✕ Mark Absent
                      </button>
                    </div>
                    <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                      Course Standing →
                    </span>
                  </div>
                </div>

                {/* Daily Compass Quote (5 cols) */}
                <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 font-bold block mb-1">
                      ✦ Daily Compass
                    </span>
                    <blockquote className="text-xs text-slate-700 dark:text-zinc-300 italic leading-relaxed">
                      &ldquo;Be not afraid of going slowly; be afraid only of standing still.&rdquo;
                    </blockquote>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-1">
                      — Chinese Proverb
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-[10.5px]">
                    <span className="text-slate-500 dark:text-zinc-400 font-mono">3rd Sem MTT-2</span>
                    <span className="text-violet-600 dark:text-violet-400 font-semibold">View Consistency →</span>
                  </div>
                </div>
              </div>

              {/* 4 Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-bold block">
                    Study Time Today
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-0.5">
                    25 min
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">1 session logged</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-bold block">
                    Overall Attendance
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    75.9%
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    WARNING · 4 bunks left
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-bold block">
                    Study Streak
                  </span>
                  <div className="text-xl font-bold font-mono text-orange-500 mt-0.5">
                    7 days
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">Best: 8 days</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-bold block">
                    Tasks Progress
                  </span>
                  <div className="text-xl font-bold font-mono text-violet-600 dark:text-violet-400 mt-0.5">
                    5 / 6
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">1 task remaining</span>
                </div>
              </div>

              {/* Today's Schedule & Focus Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Schedule List (7 cols) */}
                <div className="md:col-span-7 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-zinc-800">
                    <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Today&apos;s Schedule (5 classes)
                    </strong>
                    <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                      View Timetable →
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {[
                      { time: '08:30', name: 'Digital Electronics Lab', code: '3IT4-24', room: 'BG-16', type: 'Lab' },
                      { time: '10:30', name: 'Digital Electronics', code: '3IT3-04', room: 'CT-05', type: 'Theory' },
                      { time: '11:30', name: 'Software Engineering', code: '3IT4-07', room: 'CT-05', type: 'Theory' },
                      { time: '13:30', name: 'Object Oriented Programming', code: '3IT4-06', room: 'CT-05', type: 'Theory' },
                      { time: '14:30', name: 'Mentor-Mentee Discussion', code: 'Other', room: 'CT-05', type: 'Other' },
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-zinc-400 w-10">
                            {cls.time}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                              {cls.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {cls.room} · {cls.type}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          Scheduled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Focus (5 cols) */}
                <div className="md:col-span-5 space-y-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-bold block mb-1">
                      TODAY&apos;S FOCUS
                    </span>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {formatTime(focusSeconds)}
                        </div>
                        <span className="text-[10.5px] text-slate-500">Active focused study session</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFocusTicking(!isFocusTicking)}
                        className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        title={isFocusTicking ? 'Pause' : 'Play'}
                      >
                        {isFocusTicking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-bold block">
                      QUICK ACTIONS
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {[
                        { label: 'Start Focus Session', sub: 'Launch 25:00 Pomodoro', action: () => { setActiveTab('study'); setStudySubTab('pomodoro'); } },
                        { label: 'Academic Tasks', sub: '1 pending task', action: () => { setActiveTab('study'); setStudySubTab('tasks'); } },
                        { label: 'Study Materials & Vault', sub: 'Notes, videos & PDFs', action: () => { setActiveTab('study'); setStudySubTab('documents'); } },
                        { label: 'Consistency & Analytics', sub: 'Heatmap & rhythms', action: () => setActiveTab('analytics') },
                      ].map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={item.action}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-zinc-700 transition-colors text-left cursor-pointer"
                        >
                          <div>
                            <strong className="text-slate-900 dark:text-zinc-100 block text-xs">
                              {item.label}
                            </strong>
                            <span className="text-[10px] text-slate-400">{item.sub}</span>
                          </div>
                          <span className="text-slate-400">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Journey Heatmap Crop */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <strong className="text-slate-900 dark:text-zinc-100">
                      Your Study Journey 2026
                    </strong>
                    <span className="text-[10px] text-orange-500 font-mono font-bold">
                      🔥 7 day streak · 74 active days
                    </span>
                  </div>
                  <span className="text-violet-600 dark:text-violet-400 font-medium">View Analytics →</span>
                </div>

                <div className="overflow-x-auto pb-1">
                  <div className="flex items-center justify-between w-full min-w-[640px] gap-1 sm:gap-1.5">
                    {miniHeatmap.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-1 sm:gap-1.5 flex-1">
                        {week.map((level, di) => {
                          const bg =
                            level === 3
                              ? 'bg-violet-600 dark:bg-violet-500'
                              : level === 2
                              ? 'bg-violet-400 dark:bg-violet-700'
                              : level === 1
                              ? 'bg-violet-200 dark:bg-violet-900/60'
                              : 'bg-slate-200/70 dark:bg-zinc-800'
                          return (
                            <div
                              key={di}
                              className={`w-full aspect-square rounded-[2px] ${bg} transition-transform hover:scale-125 cursor-pointer`}
                              title={`Week ${wi + 1}, Day ${di + 1}`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="p-4 sm:p-6 space-y-5 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Attendance Safeguard Engine
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Mathematical bunk margins and recovery threshold calculator
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Semester Average</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    78.4%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { name: 'Digital Electronics (CS204)', attended: 23, total: 28, pct: 82.1, status: 'SAFE', bunks: 3 },
                  { name: 'Software Engineering (CS301)', attended: 19, total: 25, pct: 76.0, status: 'WARNING', bunks: 1 },
                  { name: 'Object Oriented Programming (CS202)', attended: 22, total: 25, pct: 88.0, status: 'SAFE', bunks: 4 },
                  { name: 'Discrete Mathematics (MA201)', attended: 17, total: 25, pct: 68.0, status: 'CRITICAL', recovery: 4 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {item.name}
                      </strong>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.status === 'SAFE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : item.status === 'WARNING'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">
                        {item.pct}%
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {item.attended} / {item.total} classes attended
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'SAFE' ? 'bg-emerald-500' : item.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>

                    <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                      {item.status === 'CRITICAL' ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          ⚠️ Attend next {item.recovery} consecutive classes to cross 75%
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ✓ Safe to miss {item.bunks} classes without penalty
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TIMETABLE TAB */}
          {activeTab === 'timetable' && (
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Weekly Timetable &amp; Schedule
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Visual day-by-day routines with AI camera scan import
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl">
                  {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedTimetableDay(day)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedTimetableDay === day
                          ? 'bg-violet-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { time: '09:00 - 10:00', code: 'CS204', name: 'Operating Systems', room: 'Room 304', instructor: 'Prof. Vance', type: 'Theory' },
                  { time: '10:00 - 11:00', code: 'CS202', name: 'Object Oriented Programming', room: 'Room 304', instructor: 'Dr. Sharma', type: 'Theory' },
                  { time: '11:15 - 13:15', code: 'CS204L', name: 'OS Systems & Shell Programming Lab', room: 'Lab B-2', instructor: 'Prof. Vance', type: 'Lab' },
                  { time: '14:00 - 15:00', code: 'MA201', name: 'Discrete Mathematics', room: 'Room 201', instructor: 'Dr. Kulkarni', type: 'Theory' },
                ].map((slot, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 w-24">
                        {slot.time}
                      </div>
                      <div>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                          {slot.name} <span className="text-xs font-normal text-slate-400 font-mono">({slot.code})</span>
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {slot.room} · {slot.instructor}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                      {slot.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STUDY HUB (Pomodoro, Tasks, Notes, Videos, Playlists, Resources, Documents) */}
          {activeTab === 'study' && (
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
              {/* Study Sub-Navigation Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-zinc-800 text-xs font-semibold select-none">
                {(
                  [
                    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
                    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                    { id: 'notes', label: 'Notes', icon: FileText },
                    { id: 'videos', label: 'Videos', icon: Video },
                    { id: 'playlists', label: 'Playlists', icon: ListVideo },
                    { id: 'resources', label: 'Resources', icon: BookOpen },
                    { id: 'documents', label: 'Documents', icon: FolderArchive },
                  ] as const
                ).map((sub) => {
                  const Icon = sub.icon
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setStudySubTab(sub.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                        studySubTab === sub.id
                          ? 'bg-violet-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Subtab: Pomodoro */}
              {studySubTab === 'pomodoro' && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-4">
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 tracking-wider">
                    {formatTime(focusSeconds)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Session 3 of 4 · Deep Work: OS Memory Paging
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFocusTicking(!isFocusTicking)}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {isFocusTicking ? 'Pause Session' : 'Resume Session'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFocusTicking(false)
                        setFocusSeconds(1500)
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Reset (25m)
                    </button>
                  </div>
                </div>
              )}

              {/* Subtab: Tasks */}
              {studySubTab === 'tasks' && (
                <div className="space-y-2">
                  {demoTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:border-violet-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                            t.completed
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-slate-300 dark:border-zinc-600'
                          }`}
                        >
                          {t.completed && '✓'}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            t.completed ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-900 dark:text-zinc-100'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {t.tag}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab: Notes */}
              {studySubTab === 'notes' && (
                <div className="space-y-2">
                  {[
                    { time: '04:15', title: 'Process Control Block (PCB)', desc: 'Stores process state, PID, register values, and priority in PCB table.' },
                    { time: '14:32', title: 'Virtual Memory & Page Table Translation', desc: 'Hardware MMU translates virtual page numbers to physical frames.' },
                    { time: '28:50', title: 'Semaphore Wait/Signal Mutex', desc: 'Dijkstra counting semaphores use atomic wait (P) and signal (V) operations.' },
                  ].map((note, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-mono text-xs font-bold">
                          {note.time}
                        </span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {note.title}
                        </strong>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 pl-1">
                        {note.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab: Videos */}
              {studySubTab === 'videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { title: 'OOPs Tutorial in One Shot | C++', channel: 'Apna College', duration: '2h 4m', progress: '42%' },
                    { title: 'Maxima & Minima - Lagrange Multipliers', channel: 'Dr. Gajendra Purohit', duration: '26m', progress: '28%' },
                    { title: 'Object Oriented Programming in 5 Hours', channel: '5 Minutes Engineering', duration: '5h 27m', progress: '46%' },
                    { title: 'Operation Research | Simplex Method', channel: 'Dr. Gajendra Purohit', duration: '16m', progress: '10%' },
                  ].map((vid, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[200px]">
                          {vid.title}
                        </strong>
                        <span className="text-[10px] font-mono text-slate-400">{vid.duration}</span>
                      </div>
                      <span className="text-[10.5px] text-slate-500 block">{vid.channel}</span>
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full" style={{ width: vid.progress }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab: Playlists */}
              {studySubTab === 'playlists' && (
                <div className="space-y-2 text-xs">
                  {[
                    { title: 'Engineering Mathematics (RTU 3rd Sem)', creator: 'Vishal Kumar', count: '38 videos', done: '24 completed' },
                    { title: 'Managerial Economics & Financial Accounting (MEFA)', creator: 'Dr. Anand Vyas', count: '15 videos', done: '9 completed' },
                  ].map((pl, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                          {pl.title}
                        </strong>
                        <span className="text-[10.5px] text-slate-500">{pl.creator} · {pl.count}</span>
                      </div>
                      <span className="text-[11px] font-mono text-violet-600 dark:text-violet-400 font-bold">
                        {pl.done}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab: Resources */}
              {studySubTab === 'resources' && (
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'Operating Systems Silberschatz 10th Ed PDF', category: 'Textbook Reference', link: 'os-textbook.org' },
                    { name: 'Discrete Mathematics Question Bank 2021-2025', category: 'Mid-term Archive', link: 'campus-repo.edu' },
                    { name: 'DBMS Normalization Cheat Sheet & BCNF Rules', category: 'Revision Notes', link: 'dbms-cheatsheet.io' },
                  ].map((res, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                          {res.name}
                        </strong>
                        <span className="text-[10.5px] text-slate-500">{res.category}</span>
                      </div>
                      <span className="text-slate-400 text-xs font-mono">{res.link} ↗</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab: Documents */}
              {studySubTab === 'documents' && (
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'CS204_Unit_1_Process_Management.pdf', size: '4.2 MB', updated: '2 days ago' },
                    { name: 'Software_Engineering_Agile_SRS.pdf', size: '2.1 MB', updated: 'Last week' },
                    { name: 'Math_3_Fourier_Transform_Formulae.pdf', size: '1.4 MB', updated: 'Yesterday' },
                  ].map((doc, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FolderArchive className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <div>
                          <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                            {doc.name}
                          </strong>
                          <span className="text-[10px] text-slate-400">{doc.size} · Uploaded {doc.updated}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                        Encrypted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Academic Consistency &amp; Focus Analytics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    365-day consistency logs and diurnal study rhythms
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold">
                  Score: 84 / 100
                </span>
              </div>

              {/* Consistency Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Focus</span>
                  <strong className="text-xl font-mono font-bold text-slate-900 dark:text-zinc-100">142 hrs</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Current Streak</span>
                  <strong className="text-xl font-mono font-bold text-orange-500">7 Days</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Longest Run</span>
                  <strong className="text-xl font-mono font-bold text-violet-600 dark:text-violet-400">21 Days</strong>
                </div>
              </div>

              {/* Diurnal Rhythm */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                  Diurnal Study Distribution
                </span>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Morning (06:00 - 12:00)</span>
                      <span className="font-mono font-bold">35%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[35%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Afternoon (12:00 - 18:00)</span>
                      <span className="font-mono font-bold">25%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[25%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Night Owl (18:00 - 02:00)</span>
                      <span className="font-mono font-bold">40%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-600 h-full rounded-full w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
