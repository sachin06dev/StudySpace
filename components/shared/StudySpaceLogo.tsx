import React from 'react'
import Image from 'next/image'

export interface StudySpaceLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  variant?: 'mark' | 'horizontal' | 'stacked' | 'auto'
  showText?: boolean
  showSubtitle?: boolean
  subtitle?: string
  className?: string
  iconClassName?: string
  textClassName?: string
  priority?: boolean
}

const SIZE_MAP = {
  xs: { markPx: 24, text: 'text-sm', sub: 'text-[9px]' },
  sm: { markPx: 28, text: 'text-sm', sub: 'text-[9px]' },
  md: { markPx: 32, text: 'text-base', sub: 'text-[10px]' },
  lg: { markPx: 40, text: 'text-lg', sub: 'text-xs' },
  xl: { markPx: 48, text: 'text-xl', sub: 'text-xs' },
  '2xl': { markPx: 64, text: 'text-2xl', sub: 'text-sm' },
  '3xl': { markPx: 80, text: 'text-3xl', sub: 'text-base' },
}

/**
 * Official StudySpace Symbol Mark
 */
export function StudySpaceIcon({
  className = 'w-8 h-8',
  size = 32,
  priority = false,
}: {
  className?: string
  size?: number
  priority?: boolean
}) {
  return (
    <Image
      src="/branding/studyspace-mark.png"
      alt="StudySpace Mark"
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`}
    />
  )
}

/**
 * Official StudySpace Brand Logo Component
 * Single source of truth for full logo, horizontal lockup, and icon mark.
 */
export default function StudySpaceLogo({
  size = 'md',
  variant = 'auto',
  showText = false,
  showSubtitle = false,
  subtitle = 'Student Workspace',
  className = '',
  iconClassName = '',
  textClassName = '',
  priority = false,
}: StudySpaceLogoProps) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md

  // If stacked variant requested
  if (variant === 'stacked') {
    const width = currentSize.markPx * 2.8
    const height = currentSize.markPx * 2.7
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <Image
          src="/branding/studyspace-logo.png"
          alt="StudySpace"
          width={width}
          height={height}
          priority={priority}
          className={`object-contain transition-transform ${iconClassName}`}
        />
        {showSubtitle && (
          <span
            className={`font-medium text-gray-400 dark:text-gray-500 mt-1 leading-tight ${currentSize.sub}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    )
  }

  const shouldShowText = showText || variant === 'horizontal'

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Symbol Mark */}
      <div
        className={`shrink-0 flex items-center justify-center transition-transform ${iconClassName}`}
        style={{ width: currentSize.markPx, height: currentSize.markPx }}
      >
        <Image
          src="/branding/studyspace-mark.png"
          alt="StudySpace"
          width={currentSize.markPx}
          height={currentSize.markPx}
          priority={priority}
          className="w-full h-full object-contain drop-shadow-xs"
        />
      </div>

      {/* Official Wordmark Text Lockup */}
      {shouldShowText && (
        <div className={`flex flex-col select-none ${textClassName}`}>
          <span
            className={`font-extrabold tracking-tight leading-none flex items-center ${currentSize.text}`}
          >
            <span className="text-[#0B132B] dark:text-gray-100">Study</span>
            <span className="text-[#6B46C1] dark:text-[#818cf8]">Space</span>
          </span>
          {showSubtitle && (
            <span
              className={`font-medium text-gray-400 dark:text-gray-500 mt-0.5 leading-tight ${currentSize.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
