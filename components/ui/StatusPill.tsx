'use client'

import React from 'react'

export type StatusType =
  | 'safe'
  | 'warning'
  | 'critical'
  | 'cancelled'
  | 'info'
  | 'present'
  | 'absent'
  | 'upcoming'

export interface StatusPillProps {
  status: StatusType
  label?: string
  showDot?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export default function StatusPill({
  status,
  label,
  showDot = true,
  size = 'md',
  className = '',
}: StatusPillProps) {
  const displayLabel = label || (status.charAt(0).toUpperCase() + status.slice(1))
  const statusStyles = {
    safe: {
      bg: 'bg-(--success-muted)',
      text: 'text-(--success)',
      border: 'border-(--success-border)',
      dot: 'bg-(--success)',
    },
    present: {
      bg: 'bg-(--success-muted)',
      text: 'text-(--success)',
      border: 'border-(--success-border)',
      dot: 'bg-(--success)',
    },
    warning: {
      bg: 'bg-(--warning-muted)',
      text: 'text-(--warning)',
      border: 'border-(--warning-border)',
      dot: 'bg-(--warning)',
    },
    critical: {
      bg: 'bg-(--danger-muted)',
      text: 'text-(--danger)',
      border: 'border-(--danger-border)',
      dot: 'bg-(--danger)',
    },
    absent: {
      bg: 'bg-(--danger-muted)',
      text: 'text-(--danger)',
      border: 'border-(--danger-border)',
      dot: 'bg-(--danger)',
    },
    cancelled: {
      bg: 'bg-(--surface-raised)',
      text: 'text-(--text-muted)',
      border: 'border-(--border-subtle)',
      dot: 'bg-(--text-muted)',
    },
    info: {
      bg: 'bg-(--info-muted)',
      text: 'text-(--info)',
      border: 'border-(--info-border)',
      dot: 'bg-(--info)',
    },
    upcoming: {
      bg: 'bg-(--surface-raised)',
      text: 'text-(--foreground)',
      border: 'border-(--border-subtle)',
      dot: 'bg-study-500',
    },
  }[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
  }[size]

  return (
    <span
      className={`inline-flex items-center font-medium rounded-(--radius-full) border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} ${sizeClasses} select-none ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-(--radius-full) shrink-0 ${statusStyles.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  )
}

export { StatusPill }

