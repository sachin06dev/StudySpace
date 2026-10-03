'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'motion/react'

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  'aria-label': string
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function IconButton({
  'aria-label': ariaLabel,
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-(--radius-sm) text-xs',
    md: 'min-w-[44px] min-h-[44px] w-10 h-10 rounded-(--radius-md) text-sm',
    lg: 'w-12 h-12 rounded-(--radius-md) text-base',
  }[size]

  const variantClasses = {
    primary:
      'bg-(--accent) hover:bg-(--accent-hover) text-white shadow-xs',
    secondary:
      'bg-(--surface-raised) hover:bg-(--border-subtle) text-(--text-primary)',
    outline:
      'border border-(--border-subtle) hover:border-(--border-strong) bg-transparent hover:bg-(--surface-raised) text-(--text-primary)',
    ghost:
      'bg-transparent hover:bg-(--surface-raised) text-(--text-secondary) hover:text-(--text-primary)',
    danger:
      'bg-(--danger-muted) hover:bg-(--danger) text-(--danger) hover:text-white',
  }[variant]

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  )
}
