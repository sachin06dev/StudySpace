'use client'

import { useState } from 'react'
import { useTimer } from '@/lib/pomodoro/timerStore'
import PomodoroSettings from './PomodoroSettings'
import type { SessionType } from '@/lib/data/pomodoro'

export default function PomodoroTimer() {
  const {
    sessionType,
    plannedSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    cycleCount,
    settings,
    startSession,
    pause,
    resume,
    reset,
    skip,
    setMode,
    adjustDuration,
    updateSettings,
    formatTimeDisplay,
  } = useTimer()

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  const timerStatus = isRunning ? 'running' : isPaused ? 'paused' : 'idle'

  // Calculate SVG progress ring percentage
  const progressPercent =
    plannedSeconds > 0 ? ((plannedSeconds - remainingSeconds) / plannedSeconds) * 100 : 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  // Color schemes based on current mode
  const modeThemes: Record<
    SessionType,
    {
      name: string
      bgGradient: string
      activePill: string
      ringColor: string
      textColor: string
      btnPrimary: string
      accentBg: string
    }
  > = {
    focus: {
      name: 'Focus Session',
      bgGradient: 'from-indigo-50/50 dark:from-indigo-950/40 via-white dark:via-gray-900 to-blue-50/30 dark:to-gray-900',
      activePill: 'bg-indigo-600 text-white shadow-xs',
      ringColor: 'stroke-indigo-600 dark:stroke-indigo-500',
      textColor: 'text-indigo-950 dark:text-indigo-100',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none',
      accentBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
    },
    short_break: {
      name: 'Short Break',
      bgGradient: 'from-emerald-50/50 dark:from-emerald-950/40 via-white dark:via-gray-900 to-teal-50/30 dark:to-gray-900',
      activePill: 'bg-emerald-600 text-white shadow-xs',
      ringColor: 'stroke-emerald-600 dark:stroke-emerald-500',
      textColor: 'text-emerald-950 dark:text-emerald-100',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-none',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
    long_break: {
      name: 'Long Break',
      bgGradient: 'from-violet-50/50 dark:from-violet-950/40 via-white dark:via-gray-900 to-purple-50/30 dark:to-gray-900',
      activePill: 'bg-violet-600 text-white shadow-xs',
      ringColor: 'stroke-violet-600 dark:stroke-violet-500',
      textColor: 'text-violet-950 dark:text-violet-100',
      btnPrimary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 dark:shadow-none',
      accentBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300',
    },
  }

  const currentTheme = modeThemes[sessionType]

  return (
    <div
      className={`bg-gradient-to-b ${currentTheme.bgGradient} rounded-3xl border border-gray-200/80 dark:border-gray-800 p-4 sm:p-6 lg:p-8 shadow-xs mb-8 transition-colors duration-300`}
    >
      {/* Top Bar: Mode Selectors & Settings Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-200/60 dark:bg-gray-800/80 p-1 sm:p-1.5 rounded-2xl backdrop-blur-xs max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setMode('focus')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              sessionType === 'focus'
                ? modeThemes.focus.activePill
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Focus
          </button>
          <button
            type="button"
            onClick={() => setMode('short_break')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              sessionType === 'short_break'
                ? modeThemes.short_break.activePill
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Short Break
          </button>
          <button
            type="button"
            onClick={() => setMode('long_break')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              sessionType === 'long_break'
                ? modeThemes.long_break.activePill
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Cycle indicator & Settings button */}
        <div className="flex items-center gap-3">
          {/* Focus Cycle Dots */}
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">
              Cycle:
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: settings.long_break_interval }).map((_, idx) => (
                <div
                  key={idx}
                  title={`Session ${idx + 1} of ${settings.long_break_interval}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx < cycleCount
                      ? 'bg-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900'
                      : idx === cycleCount && sessionType === 'focus'
                      ? 'bg-indigo-400 animate-pulse'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">
              {cycleCount}/{settings.long_break_interval}
            </span>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200/80 dark:border-gray-700/80 shadow-2xs transition-all cursor-pointer"
            title="Timer Settings"
            aria-label="Open Timer Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex flex-col items-center justify-center my-4 sm:my-6">
        <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Circular Progress SVG */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Background track circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-gray-200/80 dark:stroke-gray-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className={`${currentTheme.ringColor} transition-all duration-300 ease-linear`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Content: Time & Status */}
          <div className="absolute flex flex-col items-center justify-center text-center select-none">
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-1 ${currentTheme.accentBg}`}
            >
              {currentTheme.name}
            </span>
            <div
              className={`text-4xl sm:text-6xl font-extrabold tracking-tight font-mono ${currentTheme.textColor}`}
            >
              {formatTimeDisplay(remainingSeconds)}
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2 capitalize">
              {timerStatus === 'running'
                ? '• In Progress'
                : timerStatus === 'paused'
                ? '⏸ Paused'
                : 'Ready to Start'}
            </span>
          </div>
        </div>

        {/* Quick Duration Adjusters */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-4 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => adjustDuration(-5)}
            disabled={remainingSeconds <= 300}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:text-gray-500 bg-white/70 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Subtract 5 minutes"
          >
            -5m
          </button>
          <button
            type="button"
            onClick={() => adjustDuration(-1)}
            disabled={remainingSeconds <= 60}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:text-gray-500 bg-white/70 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Subtract 1 minute"
          >
            -1m
          </button>
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-1">Adjust</span>
          <button
            type="button"
            onClick={() => adjustDuration(1)}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white/70 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Add 1 minute"
          >
            +1m
          </button>
          <button
            type="button"
            onClick={() => adjustDuration(5)}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white/70 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Reset Button */}
        <button
          type="button"
          onClick={reset}
          disabled={timerStatus === 'idle'}
          className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200/80 dark:border-gray-700 disabled:opacity-40 disabled:hover:bg-white/80 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
          title="Reset / Cancel Session"
          aria-label="Reset Timer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Primary Action Button (Start / Pause / Resume) */}
        {timerStatus === 'running' ? (
          <button
            type="button"
            onClick={pause}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-200 dark:shadow-none transition-all cursor-pointer transform active:scale-95"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            Pause
          </button>
        ) : timerStatus === 'paused' ? (
          <button
            type="button"
            onClick={resume}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl ${currentTheme.btnPrimary} font-bold text-sm transition-all cursor-pointer transform active:scale-95`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </button>
        ) : (
          <button
            type="button"
            onClick={startSession}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl ${currentTheme.btnPrimary} font-bold text-sm transition-all cursor-pointer transform active:scale-95`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Focus
          </button>
        )}

        {/* Skip Button */}
        <button
          type="button"
          onClick={skip}
          className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200/80 dark:border-gray-700 shadow-xs transition-all cursor-pointer"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <PomodoroSettings
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSettingsUpdated={(newSettings) => updateSettings(newSettings)}
        />
      )}
    </div>
  )
}
