'use client'

import React from 'react'

export interface DonutGaugeProps {
  value: number // Percentage 0 - 100
  target?: number // Target percentage (e.g. 75)
  size?: number // Diameter in px (default 64)
  strokeWidth?: number // Stroke width in px (default 6)
  variant?: 'auto' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo'
  showLabel?: boolean
  labelClassName?: string
  className?: string
  sublabel?: string
}

export function DonutGauge({
  value,
  target = 75,
  size = 64,
  strokeWidth = 6,
  variant = 'auto',
  showLabel = true,
  labelClassName = '',
  className = '',
  sublabel,
}: DonutGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, isNaN(value) ? 0 : value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference

  // Resolve semantic color
  let strokeColor = 'stroke-indigo-600 dark:stroke-indigo-400'
  let trackColor = 'stroke-indigo-100 dark:stroke-indigo-950/60'
  let textColor = 'text-indigo-600 dark:text-indigo-400'

  if (variant === 'auto') {
    if (clampedValue >= target) {
      strokeColor = 'stroke-emerald-500 dark:stroke-emerald-400'
      trackColor = 'stroke-emerald-100 dark:stroke-emerald-950/50'
      textColor = 'text-emerald-600 dark:text-emerald-400'
    } else if (clampedValue >= target - 10) {
      strokeColor = 'stroke-amber-500 dark:stroke-amber-400'
      trackColor = 'stroke-amber-100 dark:stroke-amber-950/50'
      textColor = 'text-amber-600 dark:text-amber-400'
    } else {
      strokeColor = 'stroke-rose-500 dark:stroke-rose-400'
      trackColor = 'stroke-rose-100 dark:stroke-rose-950/50'
      textColor = 'text-rose-600 dark:text-rose-400'
    }
  } else if (variant === 'emerald') {
    strokeColor = 'stroke-emerald-500 dark:stroke-emerald-400'
    trackColor = 'stroke-emerald-100 dark:stroke-emerald-950/50'
    textColor = 'text-emerald-600 dark:text-emerald-400'
  } else if (variant === 'amber') {
    strokeColor = 'stroke-amber-500 dark:stroke-amber-400'
    trackColor = 'stroke-amber-100 dark:stroke-amber-950/50'
    textColor = 'text-amber-600 dark:text-amber-400'
  } else if (variant === 'rose') {
    strokeColor = 'stroke-rose-500 dark:stroke-rose-400'
    trackColor = 'stroke-rose-100 dark:stroke-rose-950/50'
    textColor = 'text-rose-600 dark:text-rose-400'
  } else if (variant === 'purple' || variant === 'indigo') {
    strokeColor = 'stroke-purple-600 dark:stroke-purple-400'
    trackColor = 'stroke-purple-100 dark:stroke-purple-950/50'
    textColor = 'text-purple-600 dark:text-purple-400'
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transform"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`${trackColor} transition-colors duration-300`}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${strokeColor} transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)]`}
        />
      </svg>

      {/* Center Percentage & optional sublabel */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span
            className={`font-black tracking-tight leading-none ${labelClassName || textColor}`}
            style={{ fontSize: Math.max(10, Math.floor(size * 0.26)) }}
          >
            {Math.round(clampedValue)}%
          </span>
          {sublabel && (
            <span
              className="text-[9px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-0.5"
              style={{ fontSize: Math.max(8, Math.floor(size * 0.14)) }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DonutGauge
