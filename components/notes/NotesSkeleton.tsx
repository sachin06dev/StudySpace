import React from 'react'

export default function NotesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading notes...">
      {/* Search and Filters Skeleton */}
      <div className="h-11 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 shadow-xs" />

      {/* Notes Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-14 bg-indigo-100 dark:bg-indigo-900/60 rounded-md" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-850 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
