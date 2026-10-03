import React from 'react'

export default function DashboardCardsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard cards...">
      {/* 1. Hero Split Skeleton: Next Class (60%) + Mountain Banner (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 h-56 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6 shadow-xs" />
        <div className="lg:col-span-5 h-56 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6 shadow-xs hidden lg:block" />
      </div>

      {/* 2. Metric Strip: 4 Inline Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] p-4 shadow-xs"
          />
        ))}
      </div>

      {/* 3. Main Split: Today's Schedule (65%) + Study Activity (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6 shadow-xs" />
        <div className="lg:col-span-4 h-80 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6 shadow-xs" />
      </div>

      {/* 4. Consistency Card Skeleton */}
      <div className="h-44 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6 shadow-xs" />

      {/* 5. Continue Learning Skeleton */}
      <div className="h-56 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] p-6 shadow-xs" />
    </div>
  )
}
