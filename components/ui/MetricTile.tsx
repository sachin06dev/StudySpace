'use client'

import React from 'react'

export interface MetricTileProps {
  label: string
  value: string | number
  unit?: string
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  icon?: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function MetricTile({
  label,
  value,
  unit,
  trend,
  icon,
  className = '',
  onClick,
}: MetricTileProps) {
  const content = (
    <div
      className={`p-4 rounded-(--radius-lg) bg-(--surface) border border-(--border-subtle) transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-(--border-strong) hover:bg-(--surface-raised)' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-(--radius-md) bg-(--surface-raised) text-(--text-secondary) flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tabular-nums text-(--text-primary)">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-(--text-muted)">{unit}</span>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold font-mono tabular-nums ${
              trend.isPositive === undefined
                ? 'text-(--text-muted)'
                : trend.isPositive
                ? 'text-(--success)'
                : 'text-(--danger)'
            }`}
          >
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-(--text-muted)">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )

  return content
}
