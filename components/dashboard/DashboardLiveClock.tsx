'use client'

import React, { useState, useEffect } from 'react'

interface DashboardLiveClockProps {
  timezone: string
  formattedDate: string
}

export default function DashboardLiveClock({
  timezone,
  formattedDate,
}: DashboardLiveClockProps) {
  const [timeString, setTimeString] = useState<string>('')
  const [dateString, setDateString] = useState<string>(formattedDate)

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date()
        const effectiveTz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        const formattedTime = new Intl.DateTimeFormat('en-US', {
          timeZone: effectiveTz,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(now)

        const formattedLiveDate = new Intl.DateTimeFormat('en-US', {
          timeZone: effectiveTz,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(now)

        setTimeString(formattedTime)
        setDateString(formattedLiveDate)
      } catch {
        setTimeString('')
      }
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [timezone])

  return (
    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto bg-gray-50/90 dark:bg-gray-800/80 px-3.5 py-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/70 text-xs text-gray-600 dark:text-gray-300 shadow-2xs">
      {/* Live Time (Hours and Minutes) */}
      <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 font-mono text-sm">
        <svg
          className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{timeString || '--:--'}</span>
      </div>

      <span className="text-gray-300 dark:text-gray-600">•</span>

      {/* Date */}
      <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
        <svg
          className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{dateString}</span>
      </div>
    </div>
  )
}

