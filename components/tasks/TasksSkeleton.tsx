import React from 'react'

export default function TasksSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-label="Loading tasks...">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-16 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3 w-3/4">
            <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
          <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      ))}
    </div>
  )
}
