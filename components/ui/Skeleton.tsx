'use client'

import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded-(--radius-sm)',
    circular: 'rounded-(--radius-full)',
    rectangular: 'rounded-(--radius-md)',
  }[variant]

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  }

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-(--surface-raised) ${variantClasses} ${className}`}
      style={customStyle}
      {...props}
    />
  )
}
