'use client'

import React from 'react'

export interface LinearProgressProps {
  value: number
  max?: number
  color?: 'accent' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export function LinearProgress({
  value,
  max = 100,
  color = 'accent',
  size = 'md',
  className = '',
}: LinearProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses = {
    accent: 'bg-(--accent)',
    success: 'bg-(--success)',
    warning: 'bg-(--warning)',
    danger: 'bg-(--danger)',
  }[color]

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
  }[size]

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full bg-(--surface-raised) rounded-(--radius-full) overflow-hidden ${heightClasses} ${className}`}
    >
      <div
        className={`${heightClasses} ${colorClasses} rounded-(--radius-full) transition-all duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth-out)]`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export interface DonutGaugeProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: 'accent' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
  className?: string
}

export function DonutGauge({
  value,
  max = 100,
  size = 54,
  strokeWidth = 5,
  color = 'accent',
  showLabel = true,
  label,
  className = '',
}: DonutGaugeProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const strokeColors = {
    accent: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  }[color]

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-raised)"
          strokeWidth={strokeWidth}
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)]"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-xs font-bold font-mono tabular-nums leading-none text-(--text-primary)">
            {label !== undefined ? label : `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
    </div>
  )
}
