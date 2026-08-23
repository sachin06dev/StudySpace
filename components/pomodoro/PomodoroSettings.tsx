'use client'

import { useState, useEffect, useTransition } from 'react'
import { updateUserSettingsAction } from '@/lib/actions/pomodoro'
import type { UserSettings } from '@/lib/data/pomodoro'
import { useTimer } from '@/lib/pomodoro/timerStore'
import {
  playCompletionChime,
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '@/lib/pomodoro/sound'

interface PomodoroSettingsProps {
  settings: UserSettings
  onClose: () => void
  onSettingsUpdated?: (updated: UserSettings) => void
}

export default function PomodoroSettings({
  settings,
  onClose,
  onSettingsUpdated,
}: PomodoroSettingsProps) {
  const { soundEnabled, setSoundEnabled } = useTimer()
  const [isPending, startTransition] = useTransition()
  const [pomodoroDuration, setPomodoroDuration] = useState(settings.pomodoro_duration)
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.short_break_duration)
  const [longBreakDuration, setLongBreakDuration] = useState(settings.long_break_duration)
  const [longBreakInterval, setLongBreakInterval] = useState(settings.long_break_interval)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermissionStatus()
  )

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleRequestNotif = async () => {
    const res = await requestNotificationPermission()
    setNotifPermission(res)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (pomodoroDuration < 1 || pomodoroDuration > 180) {
      setErrorMessage('Focus duration must be between 1 and 180 minutes.')
      return
    }
    if (shortBreakDuration < 1 || shortBreakDuration > 60) {
      setErrorMessage('Short break duration must be between 1 and 60 minutes.')
      return
    }
    if (longBreakDuration < 1 || longBreakDuration > 120) {
      setErrorMessage('Long break duration must be between 1 and 120 minutes.')
      return
    }
    if (longBreakInterval < 1 || longBreakInterval > 20) {
      setErrorMessage('Long break interval must be between 1 and 20 sessions.')
      return
    }

    startTransition(async () => {
      const res = await updateUserSettingsAction({
        pomodoro_duration: pomodoroDuration,
        short_break_duration: shortBreakDuration,
        long_break_duration: longBreakDuration,
        long_break_interval: longBreakInterval,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Failed to update settings. Please try again.')
      } else {
        setSuccessMessage('Settings saved successfully!')
        if (onSettingsUpdated) {
          onSettingsUpdated(res.data)
        }
        setTimeout(() => {
          onClose()
        }, 600)
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-settings-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50 duration-150"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 id="pomodoro-settings-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Timer Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex justify-between items-center">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
              {successMessage}
            </div>
          )}

          {/* Durations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Durations (Minutes)
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="pomodoro-duration"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Focus
                </label>
                <input
                  id="pomodoro-duration"
                  type="number"
                  min={1}
                  max={180}
                  value={pomodoroDuration}
                  onChange={(e) => setPomodoroDuration(Number(e.target.value))}
                  disabled={isPending}
                  className="w-full text-center text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="short-break-duration"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Short Break
                </label>
                <input
                  id="short-break-duration"
                  type="number"
                  min={1}
                  max={60}
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                  disabled={isPending}
                  className="w-full text-center text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="long-break-duration"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Long Break
                </label>
                <input
                  id="long-break-duration"
                  type="number"
                  min={1}
                  max={120}
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                  disabled={isPending}
                  className="w-full text-center text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Intervals */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Intervals
            </h4>
            <div>
              <label
                htmlFor="long-break-interval"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Long Break Interval (Every N focus sessions)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="long-break-interval"
                  type="number"
                  min={1}
                  max={20}
                  value={longBreakInterval}
                  onChange={(e) => setLongBreakInterval(Number(e.target.value))}
                  disabled={isPending}
                  className="w-24 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Focus sessions before triggering a long break
                </span>
              </div>
            </div>
          </div>

          {/* Notifications & Audio */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Audio & Desktop Alerts
            </h4>

            {/* Chime Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>Completion Chime</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Play gentle melodic sound when timer reaches 00:00
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playCompletionChime()}
                  className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                  title="Test sound chime"
                >
                  Test
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Desktop Notification Setting */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Desktop Notifications
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {notifPermission === 'granted'
                    ? 'Browser alerts are enabled for background tabs'
                    : notifPermission === 'denied'
                    ? 'Notifications are blocked in your browser settings'
                    : notifPermission === 'unsupported'
                    ? 'Browser notifications are not supported on this device'
                    : 'Get notified even when StudySpace is in another tab'}
                </p>
              </div>

              <div>
                {notifPermission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Active
                  </span>
                ) : notifPermission === 'denied' ? (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Blocked
                  </span>
                ) : notifPermission === 'unsupported' ? (
                  <span className="text-xs text-gray-400">N/A</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestNotif}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
