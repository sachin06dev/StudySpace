'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import PomodoroMiniWidget from '@/components/pomodoro/PomodoroMiniWidget'
import ThemeToggle from '@/components/shared/ThemeToggle'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'
import { NAV_ITEMS } from './AppSidebar'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string | null
}

export default function MobileNavDrawer({
  isOpen,
  onClose,
  userEmail,
}: MobileNavDrawerProps) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const prevPathnameRef = useRef(pathname)

  // Sync ref when drawer is opened
  useEffect(() => {
    if (isOpen) {
      prevPathnameRef.current = pathname
      // Auto-focus close button for screen-reader & keyboard accessibility
      closeButtonRef.current?.focus()
    }
  }, [isOpen, pathname])

  // Close drawer ONLY if pathname changes while drawer is open
  useEffect(() => {
    if (isOpen && prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      onClose()
    }
  }, [pathname, isOpen, onClose])

  // Handle ESC key press & body scroll locking
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50 duration-200"
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div
        ref={drawerRef}
        className="relative flex flex-col justify-between w-72 max-w-[85vw] bg-white dark:bg-[#0c111e] h-full shadow-2xl p-5 z-10 animate-in slide-in-from-left duration-200 border-r border-gray-200 dark:border-gray-800"
      >
        <div className="overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
            <Link href="/dashboard" onClick={onClose} className="flex items-center group">
              <StudySpaceLogo size="md" showText />
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile Navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium min-h-[44px] border transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-100/80 dark:border-indigo-500/20 font-semibold'
                      : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer: Theme toggle, Pomodoro widget, User email, and Logout */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Theme</span>
            <ThemeToggle />
          </div>

          <PomodoroMiniWidget />

          {userEmail && (
            <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-xs font-medium" title={userEmail}>
                {userEmail}
              </span>
            </div>
          )}

          <form action={logout}>
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
