'use client'

import { useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings2,
  Volume2,
  VolumeX,
  Flame,
  Coffee,
  Sparkles,
} from 'lucide-react'
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
    soundEnabled,
    setSoundEnabled,
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

  // Semantic styles for each session type
  const modeThemes: Record<
    SessionType,
    {
      name: string
      icon: React.ComponentType<{ className?: string }>
      badge: string
      ringColor: string
      activeButton: string
    }
  > = {
    focus: {
      name: 'Focus Interval',
      icon: Flame,
      badge: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--border-subtle)]',
      ringColor: 'stroke-[var(--accent)]',
      activeButton: 'bg-[var(--accent)] text-white shadow-xs',
    },
    short_break: {
      name: 'Short Rest',
      icon: Coffee,
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      ringColor: 'stroke-emerald-500',
      activeButton: 'bg-emerald-600 text-white shadow-xs',
    },
    long_break: {
      name: 'Extended Rest',
      icon: Sparkles,
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      ringColor: 'stroke-indigo-500',
      activeButton: 'bg-indigo-600 text-white shadow-xs',
    },
  }

  const currentTheme = modeThemes[sessionType]
  const ModeIcon = currentTheme.icon

  return (
    <div
      id="pomodoro-instrument"
      className="bg-[var(--surface)] rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10 shadow-xs mb-8 transition-all relative overflow-hidden"
    >
      {/* 1. Header Instrument Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Mode Segmented Switcher */}
        <div className="flex items-center gap-1 bg-[var(--surface-muted)] p-1 rounded-2xl border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setMode('focus')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              sessionType === 'focus'
                ? modeThemes.focus.activeButton
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Focus (25m)
          </button>
          <button
            type="button"
            onClick={() => setMode('short_break')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              sessionType === 'short_break'
                ? modeThemes.short_break.activeButton
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            onClick={() => setMode('long_break')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              sessionType === 'long_break'
                ? modeThemes.long_break.activeButton
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Right Header Utilities: Sound, Cycles, Settings */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
            title={soundEnabled ? 'Chime sound enabled' : 'Sound muted'}
            aria-label={soundEnabled ? 'Mute chime sound' : 'Enable chime sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Focus Cycle Dots */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--foreground-muted)]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Cycle
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: settings.long_break_interval }).map((_, idx) => (
                <div
                  key={idx}
                  title={`Session ${idx + 1} of ${settings.long_break_interval}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx < cycleCount
                      ? 'bg-[var(--accent)] ring-1 ring-[var(--accent)]/40'
                      : idx === cycleCount && sessionType === 'focus'
                      ? 'bg-[var(--accent)] opacity-60 animate-pulse'
                      : 'bg-[var(--surface-overlay)] border border-[var(--border-subtle)]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] opacity-70">
              {cycleCount}/{settings.long_break_interval}
            </span>
          </div>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
            title="Timer Settings"
            aria-label="Open Timer Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Dominant Central Timer Instrument */}
      <div className="flex flex-col items-center justify-center my-6 sm:my-8">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Circular Progress SVG */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Background track circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-[var(--surface-muted)]"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className={`${currentTheme.ringColor} transition-all duration-300 ease-linear`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Content: Mode, Time Display & State Indicator */}
          <div className="absolute flex flex-col items-center justify-center text-center select-none">
            <span
              className={`text-[11px] font-semibold tracking-wider px-3 py-0.5 rounded-full mb-2 border flex items-center gap-1.5 ${currentTheme.badge}`}
            >
              <ModeIcon className="w-3 h-3" />
              <span>{currentTheme.name}</span>
            </span>

            {/* Time: Monospace, Large & Crisp */}
            <div className="text-5xl sm:text-7xl font-extrabold tracking-tighter font-mono text-[var(--foreground)] tabular-nums">
              {formatTimeDisplay(remainingSeconds)}
            </div>

            {/* Visual State Feedback */}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
              {timerStatus === 'running' ? (
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Focus in progress</span>
                </span>
              ) : timerStatus === 'paused' ? (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Session paused</span>
                </span>
              ) : (
                <span className="text-[var(--foreground-muted)]">
                  Ready to begin ({Math.round(plannedSeconds / 60)} min)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Micro Adjusters (-5m, -1m, +1m, +5m) */}
        <div className="flex items-center gap-1.5 mt-4">
          <button
            type="button"
            onClick={() => adjustDuration(-5)}
            disabled={remainingSeconds <= 300}
            className="text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30 bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Subtract 5 minutes"
          >
            -5m
          </button>
          <button
            type="button"
            onClick={() => adjustDuration(-1)}
            disabled={remainingSeconds <= 60}
            className="text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30 bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Subtract 1 minute"
          >
            -1m
          </button>
          <span className="text-[10px] text-[var(--foreground-muted)] px-1 uppercase tracking-wider font-semibold">
            Adjust
          </span>
          <button
            type="button"
            onClick={() => adjustDuration(1)}
            className="text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Add 1 minute"
          >
            +1m
          </button>
          <button
            type="button"
            onClick={() => adjustDuration(5)}
            className="text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>
      </div>

      {/* 3. Primary Control Action Row */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Reset Button */}
        <button
          type="button"
          onClick={reset}
          disabled={timerStatus === 'idle'}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--surface-muted)] hover:bg-[var(--surface-overlay)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Reset Session"
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Action Button (Start / Pause / Resume) */}
        {timerStatus === 'running' ? (
          <button
            type="button"
            onClick={pause}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs transition-all cursor-pointer transform active:scale-95 min-w-[150px]"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>
        ) : timerStatus === 'paused' ? (
          <button
            type="button"
            onClick={resume}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-sm shadow-xs transition-all cursor-pointer transform active:scale-95 min-w-[150px]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startSession}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-sm shadow-xs transition-all cursor-pointer transform active:scale-95 min-w-[150px]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start {sessionType === 'focus' ? 'Focus' : 'Break'}</span>
          </button>
        )}

        {/* Skip Button */}
        <button
          type="button"
          onClick={skip}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--surface-muted)] hover:bg-[var(--surface-overlay)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] transition-all cursor-pointer"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <SkipForward className="w-4 h-4" />
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
