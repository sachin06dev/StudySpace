import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  note?: string
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  note,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`bg-(--surface) rounded-(--radius-lg) border border-dashed border-(--border-subtle) p-8 sm:p-12 text-center transition-colors ${className}`}
    >
      {/* Brand geometry or custom icon container */}
      <div className="w-12 h-12 rounded-(--radius-lg) bg-(--accent-muted) border border-(--accent-muted) flex items-center justify-center text-(--accent) mx-auto mb-4">
        {icon || (
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 12h6" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-(--text-primary) mb-1">{title}</h3>
      <p className="text-sm text-(--text-secondary) max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div className="flex justify-center">{action}</div>}

      {note && (
        <div className="inline-flex items-center gap-2 text-xs font-medium text-(--text-muted) bg-(--surface-raised) px-3 py-1.5 rounded-(--radius-sm) border border-(--border-subtle) mt-4">
          <span>{note}</span>
        </div>
      )}
    </div>
  )
}
