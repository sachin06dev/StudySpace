import React from 'react'

export default function VideosSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading videos library...">
      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2.5">
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-8 w-28 bg-gray-100 dark:bg-gray-850 rounded-xl" />
        <div className="h-8 w-28 bg-gray-100 dark:bg-gray-850 rounded-xl" />
      </div>

      {/* Grid of Video Card Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs"
          >
            <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
