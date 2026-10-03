'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'motion/react'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded-(--radius-sm) gap-1.5',
    md: 'h-10 px-4 text-sm rounded-(--radius-md) gap-2',
    lg: 'h-12 px-6 text-base rounded-(--radius-md) gap-2.5',
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
      'bg-(--danger) hover:opacity-90 text-white shadow-xs',
  }[variant]

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </motion.button>
  )
}

export { Button }

