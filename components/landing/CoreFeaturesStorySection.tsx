'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import {
  ShieldCheck,
  ScanLine,
  RotateCcw,
  Layers,
  FileText,
  FolderLock,
  CheckCircle2,
  BarChart3,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'
import InteractiveVideoTimeline from '@/components/landing/InteractiveVideoTimeline'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function CoreFeaturesStorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [timetableTab, setTimetableTab] = useState<'schedule' | 'scanner'>('schedule')

  // ==========================================
  // 1. Attendance Engine State
  // ==========================================
  const [attended, setAttended] = useState(24)
  const [totalClasses, setTotalClasses] = useState(28)
  const [cancelled, setCancelled] = useState(0)
  const [targetPct, setTargetPct] = useState(75)
  const attendanceNumberRef = useRef<HTMLDivElement>(null)

  const pct = Math.round((attended / totalClasses) * 1000) / 10
  const isSafe = pct >= targetPct
  const safeToMiss = isSafe ? Math.max(0, Math.floor((attended - (targetPct / 100) * totalClasses) / (targetPct / 100))) : 0
  const neededToRecover = !isSafe ? Math.max(1, Math.ceil(((targetPct / 100) * totalClasses - attended) / (1 - targetPct / 100))) : 0

  const triggerNumberPop = () => {
    if (attendanceNumberRef.current && !isReducedMotion()) {
      gsap.fromTo(
        attendanceNumberRef.current,
        { scale: 1.15, transformOrigin: 'left center' },
        { scale: 1, duration: 0.45, ease: 'back.out(3)' }
      )
    }
  }

  const markPresent = () => {
    setAttended((a) => a + 1)
    setTotalClasses((t) => t + 1)
    triggerNumberPop()
  }

  const markAbsent = () => {
    setTotalClasses((t) => t + 1)
    triggerNumberPop()
  }

  const markCancelled = () => {
    setCancelled((c) => c + 1)
    triggerNumberPop()
  }

  const resetAttendance = () => {
    setAttended(24)
    setTotalClasses(28)
    setCancelled(0)
    triggerNumberPop()
  }

  // ==========================================
  // 2. Pomodoro Circular Timer State
  // ==========================================
  const [pomoMode, setPomoMode] = useState<'focus' | 'short' | 'long'>('focus')
  const [pomoSecs, setPomoSecs] = useState(25 * 60)
  const [pomoRunning, setPomoRunning] = useState(false)
  const circleCircumference = 2 * Math.PI * 70 // r=70 -> ~439.8

  const handlePomoModeChange = (mode: 'focus' | 'short' | 'long') => {
    setPomoMode(mode)
    setPomoRunning(false)
    if (mode === 'focus') setPomoSecs(25 * 60)
    if (mode === 'short') setPomoSecs(5 * 60)
    if (mode === 'long') setPomoSecs(15 * 60)
  }

  const formatPomoTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const totalModeSecs = pomoMode === 'focus' ? 25 * 60 : pomoMode === 'short' ? 5 * 60 : 15 * 60
  const pomoProgress = 1 - pomoSecs / totalModeSecs
  const strokeDashoffset = circleCircumference * (1 - pomoProgress)

  // Pomodoro countdown timer tick
  useEffect(() => {
    if (!pomoRunning) return

    const interval = setInterval(() => {
      setPomoSecs((prev) => {
        if (prev <= 1) {
          setPomoRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [pomoRunning])

  // ==========================================
  // 3. Interactive Tasks State
  // ==========================================
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finish Tree & Graph assignment', done: true, tag: 'CS201' },
    { id: 2, text: 'Review DFS recursion notes', done: true, tag: 'CS201' },
    { id: 3, text: 'Read OS Chapter 2: Threads', done: false, tag: 'CS204' },
    { id: 4, text: 'Prepare Computer Networks Lab report', done: false, tag: 'CS208' },
  ])

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  // ==========================================
  // 4. GSAP Scanner Line Animation
  // ==========================================
  const scanLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scanLineRef.current || isReducedMotion()) return

    const line = scanLineRef.current
    const tween = gsap.to(line, {
      y: 190,
      duration: 2.2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      tween.kill()
    }
  }, [])

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-16 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200/80 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Layers className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Interactive Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Everything you need for your week.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Every feature connects directly to your semester subjects. Try out the live tools below.
          </p>
        </div>

        {/* Responsive Grid: 1-Column on Mobile, 12-Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ========================================================
              FEATURE 01: ATTENDANCE
              ======================================================== */}
          <div id="attendance" className="scroll-mt-24 lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-5 sm:p-8 flex flex-col justify-between shadow-xs hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono">
                  Attendance Calculator
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetPct(75)}
                    className={`px-2.5 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      targetPct === 75
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    Target 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetPct(85)}
                    className={`px-2.5 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      targetPct === 85
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    Target 85%
                  </button>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Know your attendance before it becomes a problem.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mb-5">
                See your percentage, target, and how many classes you can safely miss.
              </p>

              {/* Attendance Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-5 shadow-2xs">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      ref={attendanceNumberRef}
                      className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-zinc-100"
                    >
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({attended}/{totalClasses} held{cancelled > 0 ? `, ${cancelled} cancelled` : ''})
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                      isSafe
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {isSafe ? '✓ SAFE STATUS' : '⚠ DANGER ZONE'}
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div
                  className={`p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                    isSafe
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {isSafe
                      ? `Safe to miss ${safeToMiss} upcoming ${safeToMiss === 1 ? 'class' : 'classes'} without dropping below ${targetPct}%.`
                      : `Attend the next ${neededToRecover} consecutive ${neededToRecover === 1 ? 'class' : 'classes'} to reach ${targetPct}%.`}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
              <button
                type="button"
                onClick={markPresent}
                className="py-2.5 px-2 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                + Present
              </button>
              <button
                type="button"
                onClick={markAbsent}
                className="py-2.5 px-2 sm:px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                + Absent
              </button>
              <button
                type="button"
                onClick={markCancelled}
                className="py-2.5 px-2 sm:px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetAttendance}
                className="py-2.5 px-2 sm:px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              FEATURE 02: AI TIMETABLE
              ======================================================== */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-5 sm:p-8 flex flex-col justify-between shadow-xs hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono">
                  Timetable Scanner
                </span>
                <span className="text-xs text-slate-400 font-mono">AI Routine OCR</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Turn your routine into a week you can actually see.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mb-4">
                Set up your timetable once and keep every class in view.
              </p>

              {/* View Mode Toggle: Real Schedule vs Camera OCR */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs mb-3">
                <button
                  type="button"
                  onClick={() => setTimetableTab('schedule')}
                  className={`flex-1 py-1 px-2.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    timetableTab === 'schedule'
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Digitized Routine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimetableTab('scanner')}
                  className={`flex-1 py-1 px-2.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    timetableTab === 'scanner'
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>AI Camera OCR</span>
                </button>
              </div>

              {timetableTab === 'schedule' ? (
                /* High-Resolution Screenshot of Real Digitized Timetable */
                <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md">
                  <div className="hidden dark:block w-full h-full">
                    <Image
                      src="/images/timetable-dark.png"
                      alt="StudySpace Digitized Timetable Dark Mode"
                      width={800}
                      height={450}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="block dark:hidden w-full h-full">
                    <Image
                      src="/images/timetable-light.png"
                      alt="StudySpace Digitized Timetable Light Mode"
                      width={800}
                      height={450}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-mono text-emerald-400 border border-white/10 flex items-center gap-1">
                    <span>✓ Ready for Offline Use</span>
                  </div>
                </div>
              ) : (
                /* Scanning Simulator Window */
                <div className="relative h-56 rounded-2xl bg-slate-950 border border-violet-900/60 overflow-hidden p-3.5 flex flex-col justify-between shadow-inner">
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* Animated Scan Line */}
                  <div
                    ref={scanLineRef}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_#a855f7] z-20 pointer-events-none"
                    style={{ top: 10 }}
                  />

                  {/* Extracted Slots */}
                  <div className="space-y-2 relative z-10">
                    <div className="p-2 rounded-xl bg-violet-950/70 border border-violet-700/60 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-violet-200 block text-[11px]">Operating Systems (CS204)</strong>
                        <span className="text-[9.5px] text-zinc-400">09:00 - 10:15 AM · Room 304</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono">
                        ✓ EXTRACTED
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-violet-950/50 border border-violet-700/40 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-violet-200 block text-[11px]">Data Structures Lab</strong>
                        <span className="text-[9.5px] text-zinc-400">11:30 AM - 01:00 PM · Lab 2</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono">
                        ✓ EXTRACTED
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-zinc-300 block text-[11px]">Computer Networks</strong>
                        <span className="text-[9.5px] text-zinc-500">02:00 - 03:15 PM · Room 402</span>
                      </div>
                      <span className="text-[9px] text-violet-400 font-mono animate-pulse">DETECTING...</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/80 z-10">
                    <span className="flex items-center gap-1">
                      <ScanLine className="w-3 h-3 text-violet-400 animate-spin" />
                      <span>OCR Parser Running</span>
                    </span>
                    <span className="text-emerald-400">Confidence: 99.4%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Automatic day-by-day timetable</span>
              <span className="text-violet-600 dark:text-violet-400 font-semibold font-mono">Zero typing</span>
            </div>
          </div>

          {/* ========================================================
              FEATURE 03: VIDEO & TIMESTAMPED NOTES (WITH REAL DRAG)
              ======================================================== */}
          <div id="learning" className="scroll-mt-24 lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-5 sm:p-8 flex flex-col justify-between shadow-xs hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono">
                  Lecture Revision
                </span>
                <span className="text-xs text-slate-400 font-mono">Drag Scrubber</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Never lose the moment that mattered.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mb-5">
                Save a lecture, add a note to the exact moment, and jump back there when you need it.
              </p>

              {/* Robust Interactive Video Timeline with real pointer drag */}
              <InteractiveVideoTimeline />
            </div>
          </div>

          {/* ========================================================
              FEATURE 04: FOCUS & POMODORO
              ======================================================== */}
          <div id="focus" className="scroll-mt-24 lg:col-span-5 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-5 sm:p-8 flex flex-col justify-between shadow-xs hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono">
                  Study Timer
                </span>
                <span className="text-xs text-slate-400 font-mono">Auto Logged</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Make your study time count.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mb-4">
                Focus, take a break, and let StudySpace keep track of the time you actually spent studying.
              </p>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center shadow-2xs">
                {/* Tabs for Mode */}
                <div className="flex items-center gap-1.5 mb-4 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePomoModeChange('focus')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      pomoMode === 'focus' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Focus (25m)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePomoModeChange('short')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      pomoMode === 'short' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Short (5m)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePomoModeChange('long')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      pomoMode === 'long' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Long (15m)
                  </button>
                </div>

                {/* SVG Progress Ring */}
                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-slate-100 dark:stroke-zinc-800"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-violet-600 dark:stroke-violet-500 transition-all duration-300"
                      strokeWidth="8"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
                      {formatPomoTime(pomoSecs)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      {pomoSecs === 0
                        ? 'Completed'
                        : pomoRunning
                        ? 'In Session'
                        : pomoSecs < totalModeSecs
                        ? 'Paused'
                        : 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (pomoSecs === 0) {
                        setPomoSecs(totalModeSecs)
                        setPomoRunning(true)
                      } else {
                        setPomoRunning((prev) => !prev)
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    {pomoRunning
                      ? 'Pause'
                      : pomoSecs === 0
                      ? 'Restart'
                      : pomoSecs < totalModeSecs
                      ? 'Resume'
                      : pomoMode === 'focus'
                      ? 'Start Focus'
                      : 'Start Break'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePomoModeChange(pomoMode)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ========================================================
                  AUTO-LOGGED FOCUS & EFFORT ANALYTICS
                  ======================================================== */}
              <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3.5">
                {/* Header with Live Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Effort &amp; Focus Analytics
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Logged
                  </span>
                </div>

                {/* Quick KPI Stat Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-center">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">Total Time</span>
                    <strong className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                      124h 15m
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-center">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">Streak</span>
                    <strong className="text-xs sm:text-sm font-extrabold text-orange-500 font-mono flex items-center justify-center gap-0.5">
                      7 Days <Flame className="w-3 h-3 fill-orange-500" />
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-center">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">Blocks</span>
                    <strong className="text-xs sm:text-sm font-extrabold text-violet-600 dark:text-violet-400 font-mono flex items-center justify-center gap-0.5">
                      148 Done <TrendingUp className="w-3 h-3" />
                    </strong>
                  </div>
                </div>

                {/* Subject Time Distribution */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    <span>Subject Breakdown</span>
                    <span className="text-slate-400 font-mono text-[10px]">Hours Logged</span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex items-center justify-between text-[10.5px] text-slate-600 dark:text-zinc-400 mb-0.5">
                        <span className="truncate">Data Structures &amp; Algorithms</span>
                        <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-zinc-300">47h 15m (38%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full" style={{ width: '38%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10.5px] text-slate-600 dark:text-zinc-400 mb-0.5">
                        <span className="truncate">Operating Systems (CS204)</span>
                        <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-zinc-300">33h 30m (27%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '27%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10.5px] text-slate-600 dark:text-zinc-400 mb-0.5">
                        <span className="truncate">Computer Networks (CS208)</span>
                        <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-zinc-300">24h 50m (20%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consistency Heatmap Mini Strip */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                    <span>14-Day Consistency Activity</span>
                    <span className="text-violet-500 font-semibold">100% On-Track</span>
                  </div>
                  <div className="grid grid-cols-14 gap-1 p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/60 dark:border-zinc-800">
                    {[1, 2, 3, 2, 4, 3, 4, 2, 3, 4, 3, 4, 4, 3].map((lvl, idx) => {
                      const bgColors = [
                        'bg-slate-200 dark:bg-zinc-800',
                        'bg-violet-200 dark:bg-violet-950',
                        'bg-violet-400 dark:bg-violet-800',
                        'bg-violet-500 dark:bg-violet-600',
                        'bg-violet-700 dark:bg-violet-400',
                      ]
                      return (
                        <div
                          key={idx}
                          className={`h-4 rounded-[3px] ${bgColors[lvl]} transition-transform hover:scale-110`}
                          title={`Day ${idx + 1}: Level ${lvl} focus intensity`}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Dynamic Live Banner */}
                <div className="text-[10.5px] font-mono text-slate-500 dark:text-zinc-400 flex items-center justify-between pt-1">
                  <span className="truncate">
                    {pomoRunning ? (
                      <span className="text-violet-600 dark:text-violet-400 font-semibold animate-pulse flex items-center gap-1.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        Logging {pomoMode === 'focus' ? '25m Focus Block' : 'Break'} to Semester Analytics...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        Auto-synced to your StudySpace Vault
                      </span>
                    )}
                  </span>
                  <span className="text-emerald-500 font-semibold shrink-0">Synced</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Real-time habit synchronization</span>
              <span className="text-violet-600 dark:text-violet-400 font-semibold font-mono">Zero manual entry</span>
            </div>
          </div>

          {/* ========================================================
              FEATURE 05: TASKS (Single-column on mobile)
              ======================================================== */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-5 sm:p-8 flex flex-col justify-between shadow-xs hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono">
                  Weekly Tasks
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {tasks.filter((t) => t.done).length}/{tasks.length} Done
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Your week&apos;s tasks, without the clutter.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mb-5">
                Check off assignments directly connected to each course subject.
              </p>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                      task.done
                        ? 'bg-slate-100/80 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-400 line-through'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-violet-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                          task.done
                            ? 'bg-emerald-500 text-white'
                            : 'border-1.5 border-slate-300 dark:border-zinc-600'
                        }`}
                      >
                        {task.done && '✓'}
                      </span>
                      <span className="truncate font-medium">{task.text}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-mono text-[10px] shrink-0 font-semibold">
                      {task.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              FEATURE 06: DOCUMENT VAULT (Single-column on mobile)
              ======================================================== */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-5 sm:p-8 flex flex-col justify-between shadow-xs hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono">
                  Storage Vault
                </span>
                <span className="text-xs text-slate-400 font-mono">All in One Place</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Every course paper in one vault.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mb-4">
                Syllabus PDFs, lecture slides, and past exam papers organized by subject.
              </p>

              {/* High-Resolution Screenshot of Document Vault */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md mb-4 h-48 sm:h-56">
                <div className="hidden dark:block w-full h-full">
                  <Image
                    src="/images/documents-dark.png"
                    alt="StudySpace Document Vault Obsidian Theme"
                    width={800}
                    height={450}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="block dark:hidden w-full h-full">
                  <Image
                    src="/images/documents-light.png"
                    alt="StudySpace Document Vault Crisp Light Theme"
                    width={800}
                    height={450}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-[10.5px] font-mono text-zinc-200 border border-white/10 flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-violet-400" />
                  <span>Cloudflare R2 &amp; Supabase Vault</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200 block truncate">
                      Syllabus &amp; Exam Scheme
                    </strong>
                    <span className="text-[10px] text-slate-400">PDF · 2.4 MB · CS201</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center shrink-0">
                    <FolderLock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200 block truncate">
                      Past 5-Year Questions
                    </strong>
                    <span className="text-[10px] text-slate-400">PDF · 8.1 MB · OS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
