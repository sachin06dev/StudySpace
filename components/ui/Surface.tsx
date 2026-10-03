'use client'

import React from 'react'

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: 'canvas' | 'surface' | 'raised'
  bordered?: boolean
  radius?: 'sm' | 'md' | 'lg' | 'full' | 'none'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Surface({
  tier = 'surface',
  bordered = true,
  radius = 'lg',
  padding = 'md',
  children,
  className = '',
  ...props
}: SurfaceProps) {
  const tierClasses = {
    canvas: 'bg-(--canvas) text-(--text-primary)',
    surface: 'bg-(--surface) text-(--text-primary)',
    raised: 'bg-(--surface-raised) text-(--text-primary)',
  }[tier]

  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-(--radius-sm)',
    md: 'rounded-(--radius-md)',
    lg: 'rounded-(--radius-lg)',
    full: 'rounded-(--radius-full)',
  }[radius]

  const paddingClasses = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  }[padding]

  // Enforce no-border on raised elements embedded within bordered containers
  const borderClasses = bordered
    ? 'border border-(--border-subtle)'
    : 'border-0'

  return (
    <div
      className={`${tierClasses} ${radiusClasses} ${paddingClasses} ${borderClasses} transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
