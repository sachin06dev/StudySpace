import React from 'react'

export default function ResourcesSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden animate-pulse divide-y divide-[var(--border-subtle)]" aria-label="Loading resources...">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-xl bg-[var(--surface-raised)] shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-sm">
              <div className="h-3.5 bg-[var(--surface-raised)] rounded w-3/4" />
              <div className="h-2.5 bg-[var(--surface-raised)] rounded w-1/2" />
            </div>
          </div>
          <div className="w-16 h-3 bg-[var(--surface-raised)] rounded hidden sm:block" />
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-raised)] shrink-0" />
        </div>
      ))}
    </div>
  )
}
