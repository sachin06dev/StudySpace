import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-44 bg-gray-100 rounded-md" />
        </div>
        <div className="h-8 w-48 bg-gray-100 rounded-xl" />
      </div>

      {/* 3 Metric Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
              <div className="w-11 h-11 bg-gray-100 rounded-xl" />
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Tasks & Pomodoro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl border border-gray-100" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-gray-900 rounded-2xl p-5 space-y-4">
          <div className="h-5 w-28 bg-gray-700 rounded" />
          <div className="h-16 bg-gray-800 rounded-xl" />
          <div className="h-8 w-full bg-gray-800 rounded-xl" />
        </div>
      </div>

      {/* Continue Learning Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden space-y-3">
              <div className="aspect-video bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
