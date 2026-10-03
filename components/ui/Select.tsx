'use client'

import React, { forwardRef } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-(--text-secondary) select-none"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-10 pl-3 pr-8 py-2 text-sm bg-(--surface-raised) text-(--text-primary) border rounded-(--radius-md) appearance-none cursor-pointer transition-colors duration-150 focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted) disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-(--danger) focus:border-(--danger) focus:ring-(--danger-muted)'
                : 'border-(--border-subtle) hover:border-(--border-strong)'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-(--surface) text-(--text-primary)"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--text-muted)">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && <p className="text-xs text-(--danger) font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-(--text-muted)">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
