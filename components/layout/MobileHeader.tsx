'use client'

import React from 'react'
import Link from 'next/link'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'

interface MobileHeaderProps {
  onOpenNav: () => void
  isNavOpen: boolean
}

export default function MobileHeader({ onOpenNav, isNavOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-[#0c111e]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 px-4 py-2.5 flex items-center justify-between transition-colors">
      {/* Brand logo & name */}
      <Link
        href="/dashboard"
        className="flex items-center min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl"
      >
        <StudySpaceLogo size="md" showText />
      </Link>

      {/* Hamburger menu button with standard accessible touch target (>= 44x44px) */}
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isNavOpen}
        aria-controls="mobile-navigation-drawer"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 transition-colors cursor-pointer"
      >
        {isNavOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </header>
  )
}
