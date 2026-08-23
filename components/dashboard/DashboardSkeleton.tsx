import React from 'react'

export default function DashboardCardsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard cards...">
      {/* 1. Today's Metrics (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-7 w-7 rounded-xl bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-md" />
          </div>
        ))}
      </div>

      {/* 2. Consistency Card Skeleton */}
      <div className="h-44 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-xs" />

      {/* 3. Main Action Grid: Tasks + Pomodoro Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-xs" />
        <div className="lg:col-span-1 h-72 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-xs" />
      </div>

      {/* 3. Continue Learning Skeleton */}
      <div className="h-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-xs" />
    </div>
  )
}
