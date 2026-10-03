'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'

interface MobileHeaderProps {
  onOpenNav: () => void
  isNavOpen: boolean
}

export default function MobileHeader({ onOpenNav, isNavOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-(--surface) border-b border-(--border-subtle) px-4 py-2.5 flex items-center justify-between transition-colors">
      {/* Brand logo & name */}
      <Link
        href="/dashboard"
        className="flex items-center min-h-[44px] focus-visible:outline-2 focus-visible:outline-(--accent) rounded-(--radius-md)"
      >
        <StudySpaceLogo size="md" showText />
      </Link>

      <div className="flex items-center gap-2">
        {/* Quick Search Trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('studyspace:open-search'))}
          aria-label="Open search"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-(--radius-md) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised) border border-(--border-subtle) transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 text-(--text-primary)" strokeWidth={2} />
        </button>

        {/* Hamburger menu button with standard accessible touch target (>= 44x44px) */}
        <button
          type="button"
          onClick={onOpenNav}
          aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isNavOpen}
          aria-controls="mobile-navigation-drawer"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-(--radius-md) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised) border border-(--border-subtle) transition-colors cursor-pointer"
        >
          {isNavOpen ? (
            <X className="w-5 h-5 text-(--text-primary)" strokeWidth={2} />
          ) : (
            <Menu className="w-5 h-5 text-(--text-primary)" strokeWidth={2} />
          )}
        </button>
      </div>
    </header>
  )
}
