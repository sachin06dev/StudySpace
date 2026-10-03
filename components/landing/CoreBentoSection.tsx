'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  ScanLine,
  FolderLock,
  Layers,
} from 'lucide-react'

export default function CoreBentoSection() {
  // Interactive Attendance State for Simulator
  const [attended, setAttended] = useState(24)
  const [totalClasses, setTotalClasses] = useState(28)
  const percentage = Math.round((attended / totalClasses) * 1000) / 10
  const isSafe = percentage >= 75
  // Calculate how many can be missed or how many needed
  const safeToMiss = Math.max(0, Math.floor((attended - 0.75 * totalClasses) / 0.75))
  const neededToReach = Math.max(0, Math.ceil((0.75 * totalClasses - attended) / 0.25))

  // Interactive Video Scrub State
  const [activeTimestamp, setActiveTimestamp] = useState(135) // 02:15 in seconds
  const [isPlayingVideo, setIsPlayingVideo] = useState(true)

  // Interactive Pomodoro State
  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'short' | 'long'>('focus')
  const [pomodoroRunning, setPomodoroRunning] = useState(false)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60)

  const handlePomodoroTab = (mode: 'focus' | 'short' | 'long') => {
    setPomodoroMode(mode)
    setPomodoroRunning(false)
    if (mode === 'focus') setPomodoroSeconds(25 * 60)
    if (mode === 'short') setPomodoroSeconds(5 * 60)
    if (mode === 'long') setPomodoroSeconds(15 * 60)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Layers className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Core Superpowers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Built for how university actually works.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Every feature connects directly to your semester schedule so you never have to enter data twice.
          </p>
        </div>

        {/* 6-Element Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Bento Item 1: Smart Attendance Simulator (7 cols) */}
          <div className="md:col-span-12 lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800/80 transition-all shadow-xs group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  Interactive Simulator
                </span>
                <span className="text-xs text-slate-400 font-mono">1-Tap Live Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Attendance with automatic safety buffers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Try clicking below. StudySpace calculates your exact percentage and informs you how many classes you can afford to miss or need to attend to stay safely above 75%.
              </p>
            </div>

            {/* Live Interactive Attendance Card */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Operating Systems (CS204)
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Room 304 · Professor David
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-black font-mono tracking-tight ${
                      isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
                    }`}
                  >
                    {percentage}%
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {attended} of {totalClasses} classes
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isSafe ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
                {/* 75% Target Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                  style={{ left: '75%' }}
                  title="75% Minimum Target"
                />
              </div>

              {/* Action Buttons: Tap to test */}
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAttended((prev) => prev + 1)
                    setTotalClasses((prev) => prev + 1)
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tap Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTotalClasses((prev) => prev + 1)
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tap Absent</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (totalClasses > 1) {
                      if (attended > 1) setAttended((prev) => prev - 1)
                      setTotalClasses((prev) => prev - 1)
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                >
                  <span>Reset Tap</span>
                </button>
              </div>

              {/* Dynamic Status Pill */}
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  isSafe
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                <span className="font-semibold">
                  {isSafe ? 'Safe Attendance Margin' : 'Action Required'}
                </span>
                <span className="font-mono text-[11px]">
                  {isSafe
                    ? `Can safely miss ${safeToMiss} class${safeToMiss === 1 ? '' : 'es'}`
                    : `Attend next ${neededToReach} class${neededToReach === 1 ? '' : 'es'} consecutively`}
                </span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Video Scrubber & Timestamped Notes (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800/80 transition-all shadow-xs group">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Video Notes
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Timestamp-anchored notes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Click any note timestamp to jump directly back to that lecture explanation. Never lose the moment you learned a formula.
              </p>
            </div>

            {/* Video Player & Note Timeline Mockup */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-sm">
              <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-radial from-violet-900/40 via-transparent to-black/80 pointer-events-none" />
                <div className="text-center z-10 space-y-1">
                  <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block">
                    CS50: Lecture 4 (Memory)
                  </span>
                  <div className="font-mono text-white text-lg font-black tracking-wider">
                    {formatTime(activeTimestamp)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className="absolute bottom-2.5 left-2.5 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                >
                  {isPlayingVideo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Clickable Timestamp Notes */}
              <div className="space-y-1.5 pt-1">
                {[
                  { time: 135, label: '02:15', text: 'Heap vs stack memory allocation diagram' },
                  { time: 270, label: '04:30', text: 'Pointer arithmetic: dereferencing arrays' },
                  { time: 492, label: '08:12', text: 'Malloc buffer bounds check rule' },
                ].map((note) => {
                  const isSelected = activeTimestamp === note.time
                  return (
                    <button
                      key={note.time}
                      type="button"
                      onClick={() => setActiveTimestamp(note.time)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-800 text-violet-900 dark:text-violet-200 font-semibold'
                          : 'bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-200/70 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300 font-bold shrink-0">
                        {note.label}
                      </span>
                      <span className="truncate text-[11px]">{note.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bento Item 3: Timetable Image Scanner (4 cols) */}
          <div className="md:col-span-6 lg:col-span-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 p-6 sm:p-7 flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800/80 transition-all shadow-xs group">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Photo to Schedule
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                AI Timetable Scanner
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Snap a photo of your printed college routine. StudySpace extracts courses, hours, and lecture halls in seconds.
              </p>
            </div>

            {/* Visual Routine Scanner Card */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <ScanLine className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Routine photo analyzed</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border-l-3 border-violet-600 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">Monday 09:00 AM</span>
                  <span className="text-violet-700 dark:text-violet-300 font-bold">Algorithms · Rm 302</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border-l-3 border-emerald-600 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">Monday 11:30 AM</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Database Lab · Lab 4</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Weekly schedule ready to confirm</span>
              </div>
            </div>
          </div>

          {/* Bento Item 4: Pomodoro Focus Suite (4 cols) */}
          <div className="md:col-span-6 lg:col-span-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 p-6 sm:p-7 flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800/80 transition-all shadow-xs group">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Focus Work
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                Integrated Pomodoro
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Persistent timer surviving navigation. Completed focus blocks log automatically to your weekly study heatmap.
              </p>
            </div>

            {/* Interactive Pomodoro Card */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-sm text-center">
              {/* Sprint Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handlePomodoroTab('focus')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    pomodoroMode === 'focus' ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  25m Focus
                </button>
                <button
                  type="button"
                  onClick={() => handlePomodoroTab('short')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    pomodoroMode === 'short' ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  5m Break
                </button>
                <button
                  type="button"
                  onClick={() => handlePomodoroTab('long')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    pomodoroMode === 'long' ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  15m Long
                </button>
              </div>

              {/* Timer Display */}
              <div className="py-2">
                <div className="font-mono text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                  {formatTime(pomodoroSeconds)}
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Session 3 of 4 today
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                {pomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{pomodoroRunning ? 'Pause Session' : 'Start Focus Sprint'}</span>
              </button>
            </div>
          </div>

          {/* Bento Item 5: Academic Document Vault (4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 p-6 sm:p-7 flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800/80 transition-all shadow-xs group">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Private Vault
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                Academic Document Vault
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Store course syllabus PDFs, lecture slides, and past exam question papers categorized by subject.
              </p>
            </div>

            {/* Vault File List Card */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 pb-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Subject Vault</span>
                </span>
                <span className="text-[10px] text-slate-400">Encrypted</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between">
                  <span className="truncate text-slate-800 dark:text-zinc-200 font-medium">CS204_Syllabus_2026.pdf</span>
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono shrink-0 ml-2">Syllabus</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between">
                  <span className="truncate text-slate-800 dark:text-zinc-200 font-medium">Midterm_Paper_2025.pdf</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono shrink-0 ml-2">Exam</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between">
                  <span className="truncate text-slate-800 dark:text-zinc-200 font-medium">Prof_Lecture_Slides_W7.pdf</span>
                  <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono shrink-0 ml-2">Slides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
