'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  Flame,
  Sun,
  Moon,
} from 'lucide-react'
import ScreenshotLightbox from './ScreenshotLightbox'

export default function FocusStorySection() {
  const { resolvedTheme } = useTheme()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [storyTheme, setStoryTheme] = useState<'light' | 'dark' | null>(null)

  // Pomodoro interactive center clock state
  const [intervalType, setIntervalType] = useState<'classic' | 'deep' | 'long'>('classic')
  const totalSeconds = intervalType === 'classic' ? 25 * 60 : intervalType === 'deep' ? 50 * 60 : 90 * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)

  const currentTheme = storyTheme || (resolvedTheme === 'dark' ? 'dark' : 'light')

  const toggleTheme = () => {
    setStoryTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  // Handle interval type changes
  const handleSelectInterval = (type: 'classic' | 'deep' | 'long') => {
    setIntervalType(type)
    setIsRunning(false)
    const newSecs = type === 'classic' ? 25 * 60 : type === 'deep' ? 50 * 60 : 90 * 60
    setSecondsLeft(newSecs)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : totalSeconds))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRunning, totalSeconds])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progressPct = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  // SVG circular timer calculations
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPct / 100) * circumference

  const currentImageSrc =
    currentTheme === 'dark' ? '/screenshots/dark/pomodoro.png' : '/screenshots/light/pomodoro.png'

  return (
    <section id="focus-story" className="py-20 md:py-28 bg-slate-50 dark:bg-zinc-950/70 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/70 border border-violet-200/60 dark:border-violet-800/60 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Feature Story • Focus</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Turn study time into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 dark:from-violet-400 dark:via-purple-300 dark:to-pink-400">
              focused time.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Most online timers reset the moment you click away or open a note. StudySpace keeps a persistent Pomodoro ticking across all pages while logging compounding hours into your analytics.
          </p>
        </div>

        {/* Centerpiece Layout: Giant Circular Pomodoro Simulation + Real UI Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto mb-12">
          {/* Left Column: Interactive Circular Timer Instrument */}
          <div className="lg:col-span-5 p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 text-center">
            {/* Interval Preset Switcher */}
            <div className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl">
              {[
                { id: 'classic', label: 'Classic 25/5' },
                { id: 'deep', label: 'Deep 50/10' },
                { id: 'long', label: 'Ultra 90/20' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleSelectInterval(btn.id as 'classic' | 'deep' | 'long')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    intervalType === btn.id
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Circular Timer Visualizer */}
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                {/* Track circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress animated circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className="stroke-violet-600 dark:stroke-violet-500 transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Time display centered inside */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
                  {formattedTime}
                </span>
                <span className="text-xs uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold font-mono">
                  {isRunning ? 'FOCUS SESSION' : 'READY TO START'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25 active:scale-95'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isRunning ? 'Pause Interval' : 'Start Focus Session'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false)
                  setSecondsLeft(totalSeconds)
                }}
                className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Micro details */}
            <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Streak Impact</span>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>+1 Day Streak</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Persistence</span>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  Survives tabs
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Pomodoro UI Window */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-300/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden transition-all text-left">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-100/90 dark:bg-zinc-950/90 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  StudySpace Native Pomodoro Suite
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                >
                  {currentTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="text-[10px] uppercase font-mono">{currentTheme}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Inspect Full HD</span>
                </button>
              </div>
            </div>

            <div
              className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] bg-slate-100 dark:bg-zinc-950 overflow-hidden cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                key={currentTheme}
                src={currentImageSrc}
                alt="StudySpace Pomodoro Deep Work Timer Screenshot"
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
                sizes="(max-width: 1024px) 100vw, 768px"
                unoptimized
              />
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Click to inspect 100% resolution</span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                Why Students Love the StudySpace Pomodoro:
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>Never pauses when switching tabs or taking notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>Automatic session logging into 365-day habit heatmap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScreenshotLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={currentImageSrc}
        title="Pomodoro Deep Work Suite"
        theme={currentTheme}
        onToggleTheme={toggleTheme}
      />
    </section>
  )
}
