'use client'

import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-(--text-secondary) select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-(--text-muted)">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-10 px-3 py-2 text-sm bg-(--surface-raised) text-(--text-primary) placeholder:text-(--text-muted) border rounded-(--radius-md) transition-colors duration-150 focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted) disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-(--danger) focus:border-(--danger) focus:ring-(--danger-muted)'
                : 'border-(--border-subtle) hover:border-(--border-strong)'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-(--text-muted)">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-(--danger) font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-(--text-muted)">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
