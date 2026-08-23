'use client'

import React, { useState, useEffect, useRef } from 'react'

type SessionType = 'focus' | 'short_break' | 'long_break'

const DEFAULT_DURATIONS: Record<SessionType, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

export default function PomodoroPreview() {
  const [mode, setMode] = useState<SessionType>('focus')
  const [plannedSeconds, setPlannedSeconds] = useState<number>(DEFAULT_DURATIONS.focus)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(DEFAULT_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [cycleCount, setCycleCount] = useState<number>(2)
  const [completedSessions, setCompletedSessions] = useState<number>(4)
  const [showCompletionToast, setShowCompletionToast] = useState<boolean>(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer Tick Logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            setIsPaused(false)
            setShowCompletionToast(true)
            if (mode === 'focus') {
              setCompletedSessions((c) => c + 1)
              setCycleCount((c) => (c % 4) + 1)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode])

  const switchMode = (newMode: SessionType) => {
    setIsRunning(false)
    setIsPaused(false)
    setMode(newMode)
    const secs = DEFAULT_DURATIONS[newMode]
    setPlannedSeconds(secs)
    setRemainingSeconds(secs)
    setShowCompletionToast(false)
  }

  const startTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
    setShowCompletionToast(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
    setIsPaused(true)
  }

  const resumeTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setRemainingSeconds(plannedSeconds)
    setShowCompletionToast(false)
  }

  const skipTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    if (mode === 'focus') {
      switchMode('short_break')
    } else {
      switchMode('focus')
    }
  }

  const adjustDuration = (deltaMinutes: number) => {
    const deltaSecs = deltaMinutes * 60
    const newRemaining = Math.max(60, remainingSeconds + deltaSecs)
    const newPlanned = Math.max(60, plannedSeconds + deltaSecs)
    setPlannedSeconds(newPlanned)
    setRemainingSeconds(newRemaining)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Circular progress calculation
  const progressPercent =
    plannedSeconds > 0 ? ((plannedSeconds - remainingSeconds) / plannedSeconds) * 100 : 0
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  const modeThemes: Record<
    SessionType,
    {
      name: string
      activePill: string
      ringColor: string
      textColor: string
      btnPrimary: string
      accentBg: string
    }
  > = {
    focus: {
      name: 'Focus Session',
      activePill: 'bg-indigo-600 text-white shadow-xs',
      ringColor: 'stroke-indigo-600 dark:stroke-indigo-500',
      textColor: 'text-indigo-950 dark:text-indigo-100',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      accentBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
    },
    short_break: {
      name: 'Short Break',
      activePill: 'bg-emerald-600 text-white shadow-xs',
      ringColor: 'stroke-emerald-600 dark:stroke-emerald-500',
      textColor: 'text-emerald-950 dark:text-emerald-100',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
    long_break: {
      name: 'Long Break',
      activePill: 'bg-violet-600 text-white shadow-xs',
      ringColor: 'stroke-violet-600 dark:stroke-violet-500',
      textColor: 'text-violet-950 dark:text-violet-100',
      btnPrimary: 'bg-violet-600 hover:bg-violet-700 text-white',
      accentBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300',
    },
  }

  const currentTheme = modeThemes[mode]

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Top Mode Selectors & Cycle Tracker */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => switchMode('focus')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              mode === 'focus'
                ? modeThemes.focus.activePill
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Focus
          </button>
          <button
            type="button"
            onClick={() => switchMode('short_break')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              mode === 'short_break'
                ? modeThemes.short_break.activePill
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Short Break
          </button>
          <button
            type="button"
            onClick={() => switchMode('long_break')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              mode === 'long_break'
                ? modeThemes.long_break.activePill
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Cycle indicator & Done counter */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-2xs shrink-0">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Cycle:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step < cycleCount
                    ? 'bg-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900'
                    : step === cycleCount && isRunning
                    ? 'bg-indigo-500 animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] sm:text-[10px] text-gray-400 ml-0.5">
            ({completedSessions} today)
          </span>
        </div>
      </div>

      {/* Completion Toast Notification */}
      {showCompletionToast && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-emerald-800 dark:text-emerald-300 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="text-base">🎉</span>
            <span className="font-semibold text-xs">
              {mode === 'focus'
                ? 'Focus session complete! Time for a short break.'
                : 'Break finished! Ready to focus again?'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCompletionToast(false)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="flex flex-col items-center justify-center py-1 sm:py-2">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
            <circle
              cx="110"
              cy="110"
              r={radius}
              className="stroke-gray-100 dark:stroke-gray-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              className={`${currentTheme.ringColor} transition-all duration-300 ease-linear`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${currentTheme.accentBg}`}
            >
              {currentTheme.name}
            </span>
            <div className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-mono ${currentTheme.textColor}`}>
              {formatTime(remainingSeconds)}
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 mt-1">
              {isRunning ? '• In Progress' : isPaused ? '⏸ Paused' : 'Ready to Start'}
            </span>
          </div>
        </div>

        {/* Quick Adjust Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => adjustDuration(-5)}
            disabled={remainingSeconds <= 300}
            className="text-[10px] sm:text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-lg shadow-2xs cursor-pointer"
          >
            -5m
          </button>
          <button
            type="button"
            onClick={() => adjustDuration(-1)}
            disabled={remainingSeconds <= 60}
            className="text-[10px] sm:text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-lg shadow-2xs cursor-pointer"
          >
            -1m
          </button>
          <span className="text-[9px] sm:text-[10px] text-gray-400 px-1 font-medium">Adjust</span>
          <button
            type="button"
            onClick={() => adjustDuration(1)}
            className="text-[10px] sm:text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-lg shadow-2xs cursor-pointer"
          >
            +1m
          </button>
          <button
            type="button"
            onClick={() => adjustDuration(5)}
            className="text-[10px] sm:text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-lg shadow-2xs cursor-pointer"
          >
            +5m
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-1">
        {/* Reset Button */}
        <button
          type="button"
          onClick={resetTimer}
          disabled={!isRunning && !isPaused && remainingSeconds === plannedSeconds}
          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 shadow-2xs transition-all cursor-pointer"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Primary Action Button (Start / Pause / Resume) */}
        {isRunning ? (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span>Pause</span>
          </button>
        ) : isPaused ? (
          <button
            type="button"
            onClick={resumeTimer}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl ${currentTheme.btnPrimary} font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Resume</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startTimer}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl ${currentTheme.btnPrimary} font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Start Session</span>
          </button>
        )}

        {/* Skip Button */}
        <button
          type="button"
          onClick={skipTimer}
          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-2xs transition-all cursor-pointer"
          title="Skip to next session"
          aria-label="Skip session"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
