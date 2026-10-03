'use client'

import React from 'react'
import Button from './Button'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`p-6 sm:p-8 rounded-(--radius-lg) bg-(--surface) border border-(--border-subtle) text-center max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-(--radius-full) bg-(--danger-muted) text-(--danger) flex items-center justify-center mx-auto mb-3">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-base font-bold text-(--text-primary) mb-1">{title}</h3>
      <p className="text-sm text-(--text-secondary) leading-relaxed mb-5">{message}</p>

      {onRetry && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
