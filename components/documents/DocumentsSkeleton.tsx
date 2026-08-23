import React from 'react'

export default function DocumentsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" aria-label="Loading documents...">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-36 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-1.5 w-full">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-850 rounded w-1/4" />
            <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
