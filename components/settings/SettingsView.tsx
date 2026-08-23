'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { logout } from '@/lib/actions/auth'
import { updateUserSettingsAction } from '@/lib/actions/pomodoro'
import { updateUserTimezoneAction } from '@/lib/actions/profile'
import type { UserSettings } from '@/lib/data/pomodoro'
import ThemeToggle from '@/components/shared/ThemeToggle'

interface SettingsViewProps {
  user: {
    id: string
    email: string | null
    createdAt?: string | null
  }
  initialSettings: UserSettings
  timezone?: string
}

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India Standard Time - IST, UTC+05:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (Gulf Standard Time - GST, UTC+04:00)' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (Bangladesh Standard Time - BST, UTC+06:00)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (Pakistan Standard Time - PKT, UTC+05:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (Singapore Time - SGT, UTC+08:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan Standard Time - JST, UTC+09:00)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (China Standard Time - CST, UTC+08:00)' },
  { value: 'America/New_York', label: 'America/New_York (US Eastern Time - EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (US Central Time - CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (US Mountain Time - MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (US Pacific Time - PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (Canada Eastern Time)' },
  { value: 'Europe/London', label: 'Europe/London (UK - GMT/BST, UTC+00/01:00)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (Central European Time - CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Germany - CET/CEST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (Australian Eastern Time - AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (New Zealand - NZST/NZDT)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
]

export default function SettingsView({
  user,
  initialSettings,
  timezone: initialTimezone = 'UTC',
}: SettingsViewProps) {
  const [isPending, startTransition] = useTransition()
  const [pomodoroDuration, setPomodoroDuration] = useState(initialSettings.pomodoro_duration)
  const [shortBreakDuration, setShortBreakDuration] = useState(initialSettings.short_break_duration)
  const [longBreakDuration, setLongBreakDuration] = useState(initialSettings.long_break_duration)
  const [longBreakInterval, setLongBreakInterval] = useState(initialSettings.long_break_interval)

  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone)
  const [currentTimezone, setCurrentTimezone] = useState(initialTimezone)
  const [deviceTimezone] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || null
      } catch {
        return null
      }
    }
    return null
  })
  const [liveLocalTime, setLiveLocalTime] = useState<string>('')

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [tzSuccessMessage, setTzSuccessMessage] = useState<string | null>(null)
  const [tzError, setTzError] = useState<string | null>(null)

  // Update live clock for the selected timezone
  useEffect(() => {
    const updateClock = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: selectedTimezone,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date())
        setLiveLocalTime(timeStr)
      } catch {
        setLiveLocalTime('')
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [selectedTimezone])

  const handleSaveTimerSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (pomodoroDuration < 1 || pomodoroDuration > 180) {
      setError('Focus duration must be between 1 and 180 minutes.')
      return
    }
    if (shortBreakDuration < 1 || shortBreakDuration > 60) {
      setError('Short break duration must be between 1 and 60 minutes.')
      return
    }
    if (longBreakDuration < 1 || longBreakDuration > 120) {
      setError('Long break duration must be between 1 and 120 minutes.')
      return
    }
    if (longBreakInterval < 1 || longBreakInterval > 20) {
      setError('Long break interval must be between 1 and 20 sessions.')
      return
    }

    startTransition(async () => {
      const res = await updateUserSettingsAction({
        pomodoro_duration: pomodoroDuration,
        short_break_duration: shortBreakDuration,
        long_break_duration: longBreakDuration,
        long_break_interval: longBreakInterval,
      })

      if (!res.success) {
        setError(res.error || 'Failed to update settings. Please try again.')
      } else {
        setSuccessMessage('Pomodoro default settings have been saved!')
        setTimeout(() => setSuccessMessage(null), 4000)
      }
    })
  }

  const handleSaveTimezone = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTzError(null)
    setTzSuccessMessage(null)

    startTransition(async () => {
      const res = await updateUserTimezoneAction(selectedTimezone)
      if (!res.success) {
        setTzError(res.error || 'Failed to update timezone preference.')
      } else {
        setCurrentTimezone(selectedTimezone)
        setTzSuccessMessage(`Timezone successfully updated to ${selectedTimezone}!`)
        setTimeout(() => setTzSuccessMessage(null), 4000)
      }
    })
  }

  const handleAutoDetect = () => {
    if (deviceTimezone) {
      setSelectedTimezone(deviceTimezone)
    }
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active member'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Appearance / Theme Preference Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Appearance & Theme</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose between Light, Dark, or System preference</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Interface Theme
          </label>
          <div className="max-w-xs">
            <ThemeToggle variant="segmented" />
          </div>
        </div>
      </div>

      {/* 2. Timezone & Regional Settings Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Timezone & Regional Time</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your study streaks, daily analytics, greeting, and dashboard dates will be calculated based on your local timezone.
            </p>
          </div>
        </div>

        {tzError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex justify-between items-center">
            <span>{tzError}</span>
            <button
              type="button"
              onClick={() => setTzError(null)}
              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {tzSuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{tzSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveTimezone} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-timezone" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Active Timezone
              </label>
              <select
                id="settings-timezone"
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                disabled={isPending}
                className="w-full text-xs font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl p-2.5 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              >
                {!COMMON_TIMEZONES.some((t) => t.value === selectedTimezone) && (
                  <option value={selectedTimezone}>{selectedTimezone} (Custom / Detected)</option>
                )}
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Local Time
              </label>
              <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 font-mono text-sm font-semibold">
                <span>{liveLocalTime || '--:--:--'}</span>
                <span className="text-[11px] font-sans font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  {selectedTimezone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {deviceTimezone && deviceTimezone !== selectedTimezone ? (
              <button
                type="button"
                onClick={handleAutoDetect}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Switch to device timezone ({deviceTimezone})</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Matches your detected device location
              </span>
            )}

            <button
              type="submit"
              disabled={isPending || selectedTimezone === currentTimezone}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer self-end sm:self-auto"
            >
              {isPending ? 'Saving...' : 'Save Timezone'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Account Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Account Profile</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your StudySpace authenticated account details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 font-medium truncate">
              {user.email || 'No email associated'}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Account Status
            </label>
            <div className="flex items-center gap-1.5 p-2.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Active Timezone
            </label>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 font-medium">
              {currentTimezone}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Member Since
            </label>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 font-medium">
              {memberSince}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pomodoro Timer Defaults Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Pomodoro Timer Defaults</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize the default duration for each session type and long break frequency.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex justify-between items-center">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveTimerSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="settings-focus-duration" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Focus Duration (min)
              </label>
              <input
                id="settings-focus-duration"
                type="number"
                min={1}
                max={180}
                value={pomodoroDuration}
                onChange={(e) => setPomodoroDuration(Number(e.target.value))}
                disabled={isPending}
                className="w-full text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl p-2.5 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="settings-short-break" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Short Break (min)
              </label>
              <input
                id="settings-short-break"
                type="number"
                min={1}
                max={60}
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                disabled={isPending}
                className="w-full text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl p-2.5 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="settings-long-break" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Long Break (min)
              </label>
              <input
                id="settings-long-break"
                type="number"
                min={1}
                max={120}
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                disabled={isPending}
                className="w-full text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl p-2.5 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-long-break-interval" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Long Break Interval (Every N focus sessions)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="settings-long-break-interval"
                type="number"
                min={1}
                max={20}
                value={longBreakInterval}
                onChange={(e) => setLongBreakInterval(Number(e.target.value))}
                disabled={isPending}
                className="w-24 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl p-2.5 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Number of completed focus intervals before triggering a long break
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isPending ? 'Saving...' : 'Save Timer Defaults'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Security & Data Protection Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Security & Data Privacy</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">How your study data and uploaded files are protected</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong className="font-semibold text-emerald-950 dark:text-emerald-200">Row Level Security (RLS) Enforced:</strong>{' '}
              All user tables (tasks, pomodoro sessions, saved videos, notes, documents, and resources) enforce strict database-level isolation. Only you can read, insert, update, or delete your records.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/60">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong className="font-semibold text-blue-950 dark:text-blue-200">Private Cloud Storage:</strong>{' '}
              Uploaded study documents are stored in a private, encrypted bucket (`study-documents`). Download links are time-limited signed URLs generated on demand.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Account Actions Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Session & Sign Out</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your active workspace session</p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-950/40 hover:bg-red-600 dark:hover:bg-red-600 border border-red-200 dark:border-red-800 transition-colors shadow-2xs cursor-pointer"
            >
              Sign out of StudySpace
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
