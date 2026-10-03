import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[var(--surface-raised)] rounded-lg" />
          <div className="h-4 w-44 bg-[var(--surface-raised)]/60 rounded-md" />
        </div>
        <div className="h-8 w-48 bg-[var(--surface-raised)] rounded-xl" />
      </div>

      {/* 4 Metric Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-[var(--surface-raised)] rounded" />
                <div className="h-7 w-16 bg-[var(--surface-raised)] rounded" />
              </div>
              <div className="w-8 h-8 bg-[var(--surface-raised)] rounded-xl" />
            </div>
            <div className="h-3 w-20 bg-[var(--surface-raised)]/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-36 bg-[var(--surface-raised)] rounded" />
            <div className="h-4 w-20 bg-[var(--surface-raised)] rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-subtle)]" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
          <div className="h-5 w-28 bg-[var(--surface-raised)] rounded" />
          <div className="h-20 bg-[var(--surface-raised)] rounded-xl" />
          <div className="h-10 w-full bg-[var(--surface-raised)] rounded-xl" />
        </div>
      </div>

      {/* Consistency Card Skeleton */}
      <div className="h-44 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6" />

      {/* Continue Learning Skeleton */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-5 w-36 bg-[var(--surface-raised)] rounded" />
            <div className="h-3 w-48 bg-[var(--surface-raised)]/60 rounded" />
          </div>
          <div className="h-4 w-20 bg-[var(--surface-raised)] rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--border-subtle)] overflow-hidden space-y-3 bg-[var(--surface-raised)]">
              <div className="aspect-video bg-[var(--surface-elevated)]" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-full bg-[var(--surface-elevated)] rounded" />
                <div className="h-3 w-2/3 bg-[var(--surface-elevated)]/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
