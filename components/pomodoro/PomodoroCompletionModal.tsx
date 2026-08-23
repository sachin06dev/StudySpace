'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTimer } from '@/lib/pomodoro/timerStore'
import {
  playCompletionChime,
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '@/lib/pomodoro/sound'

export default function PomodoroCompletionModal() {
  const {
    completionInfo,
    dismissCompletion,
    startNextSession,
    soundEnabled,
    setSoundEnabled,
    settings,
  } = useTimer()

  const modalRef = useRef<HTMLDivElement>(null)
  const primaryButtonRef = useRef<HTMLButtonElement>(null)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermissionStatus()
  )

  // Handle keyboard shortcuts (Escape = Dismiss, Enter = Start Next) & Focus Trap
  useEffect(() => {
    if (!completionInfo) return

    // Auto-focus primary action button on open
    const timeout = setTimeout(() => {
      primaryButtonRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        dismissCompletion()
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // If Enter is pressed without active focus on another button, trigger next
        const activeTag = document.activeElement?.tagName.toLowerCase()
        if (activeTag !== 'button') {
          e.preventDefault()
          e.stopPropagation()
          startNextSession()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [completionInfo, dismissCompletion, startNextSession])

  if (!completionInfo) return null

  const { completedType, nextType, durationMinutes, cycleCount, totalCycles } = completionInfo

  const isFocusCompleted = completedType === 'focus'
  const isLongBreakNext = nextType === 'long_break'

  // Dynamic content based on session transitions
  let title = 'Pomodoro Complete! 🎉'
  let description = 'Your focus session has ended. Take a short break before starting the next session.'
  let primaryActionLabel = `Start Short Break (${settings.short_break_duration}m)`
  let badgeLabel = `Focus • ${durationMinutes}m Completed`
  let badgeColor = 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800'
  let glowColor = 'from-indigo-500/20 via-violet-500/10 to-transparent'
  let iconBg = 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-950/50'

  if (isFocusCompleted) {
    if (isLongBreakNext) {
      title = 'Cycle Complete! 🏆'
      description = `Outstanding work! You completed ${totalCycles} focus sessions. Enjoy a well-deserved long break.`
      primaryActionLabel = `Start Long Break (${settings.long_break_duration}m)`
      badgeLabel = `Full Cycle Completed • ${durationMinutes}m`
      badgeColor = 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800'
      glowColor = 'from-violet-500/20 via-purple-500/10 to-transparent'
      iconBg = 'bg-violet-600 text-white shadow-violet-200 dark:shadow-violet-950/50'
    } else {
      title = 'Pomodoro Complete! 🎉'
      description = `Great job staying focused for ${durationMinutes} minutes! Take a short break to relax and recharge.`
      primaryActionLabel = `Start Break (${settings.short_break_duration}m)`
    }
  } else {
    // Break completed
    title = completedType === 'long_break' ? 'Long Break Finished! 🚀' : 'Break Finished! ⚡'
    description = 'Hope you feel refreshed and ready to dive back into your studies.'
    primaryActionLabel = `Start Focus (${settings.pomodoro_duration}m)`
    badgeLabel = `${completedType === 'long_break' ? 'Long Break' : 'Short Break'} • ${durationMinutes}m Done`
    badgeColor = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
    glowColor = 'from-emerald-500/20 via-teal-500/10 to-transparent'
    iconBg = 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-950/50'
  }

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission()
    setNotifPermission(res)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-completion-title"
      aria-describedby="pomodoro-completion-desc"
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-150 select-none"
      onClick={dismissCompletion}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-center outline-none animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-gradient-to-b ${glowColor} rounded-full blur-2xl pointer-events-none`}
        />

        {/* Top Control Bar (Close & Sound Toggle) */}
        <div className="flex items-center justify-between relative z-10">
          {/* Sound Mute / Unmute Quick Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled
              setSoundEnabled(next)
              if (next) playCompletionChime()
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={soundEnabled ? 'Chime sound enabled (Click to mute)' : 'Chime muted (Click to enable)'}
            aria-label="Toggle completion sound"
          >
            {soundEnabled ? (
              <>
                <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <span>Sound On</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-400 fill-current" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
                <span>Muted</span>
              </>
            )}
          </button>

          {/* Dismiss Close Icon */}
          <button
            type="button"
            onClick={dismissCompletion}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close notification"
            title="Dismiss (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Center Icon Badge */}
        <div className="flex flex-col items-center justify-center relative z-10 pt-1">
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-3xl ${iconBg} shadow-lg flex items-center justify-center mb-3 transform hover:scale-105 transition-transform duration-300`}
          >
            {isFocusCompleted ? (
              isLongBreakNext ? (
                <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                </svg>
              ) : (
                <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )
            ) : (
              <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
            )}
          </div>

          {/* Mode Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${badgeColor}`}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2 relative z-10">
          <h2
            id="pomodoro-completion-title"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            {title}
          </h2>
          <p
            id="pomodoro-completion-desc"
            className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Cycle indicator chips */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 relative z-10">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            Focus Cycle:
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalCycles }).map((_, idx) => (
              <div
                key={idx}
                title={`Session ${idx + 1} of ${totalCycles}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx < cycleCount
                    ? 'bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-700 dark:text-slate-200 font-bold ml-0.5">
            {cycleCount}/{totalCycles}
          </span>
        </div>

        {/* Optional Browser Notification Permission Banner (only shown if not decided yet) */}
        {notifPermission === 'default' && (
          <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs flex items-center justify-between gap-2 text-indigo-950 dark:text-indigo-200 text-left relative z-10">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🔔</span>
              <span className="text-[11px] truncate">Get alerts when switching tabs</span>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
            >
              Enable
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 relative z-10">
          <button
            type="button"
            onClick={dismissCompletion}
            className="w-full sm:w-1/3 order-2 sm:order-1 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
          >
            Dismiss
          </button>

          <button
            ref={primaryButtonRef}
            type="button"
            onClick={startNextSession}
            className={`w-full sm:w-2/3 order-1 sm:order-2 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all cursor-pointer transform active:scale-95 ${
              isFocusCompleted
                ? isLongBreakNext
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-300/40 dark:shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-300/40 dark:shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300/40 dark:shadow-none'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
