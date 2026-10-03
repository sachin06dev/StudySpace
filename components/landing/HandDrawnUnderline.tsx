'use client'

import React from 'react'

export default function HandDrawnUnderline({
  className = '',
  color = '#7c3aed',
}: {
  className?: string
  color?: string
}) {
  return (
    <span className={`relative inline-block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 250 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute -bottom-2.5 left-0 w-full h-3 overflow-visible pointer-events-none"
      >
        <path
          d="M 3 14 C 45 4, 110 5, 245 11 C 180 16, 70 17, 18 17"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 300,
            strokeDashoffset: 300,
            animation: 'drawUnderline 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards',
          }}
        />
      </svg>
    </span>
  )
}
