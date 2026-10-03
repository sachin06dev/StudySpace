import React from 'react'

export default function DocumentsSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden animate-pulse" aria-label="Loading documents...">
      {/* Table Header skeleton */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]">
        <div className="col-span-5 h-3 bg-[var(--surface)] rounded w-1/3" />
        <div className="col-span-2 h-3 bg-[var(--surface)] rounded w-1/2" />
        <div className="col-span-2 h-3 bg-[var(--surface)] rounded w-1/3" />
        <div className="col-span-2 h-3 bg-[var(--surface)] rounded w-1/3" />
        <div className="col-span-1 h-3 bg-[var(--surface)] rounded w-1/2 ml-auto" />
      </div>

      {/* Row skeletons */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-raised)] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-[var(--surface-raised)] rounded w-2/5" />
              <div className="h-2.5 bg-[var(--surface-raised)] rounded w-1/4" />
            </div>
            <div className="hidden md:block w-20 h-5 rounded-md bg-[var(--surface-raised)]" />
            <div className="hidden md:block w-16 h-3 bg-[var(--surface-raised)] rounded" />
            <div className="hidden md:block w-20 h-3 bg-[var(--surface-raised)] rounded" />
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-raised)] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
