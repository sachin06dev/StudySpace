'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, ChevronDown, LogOut, Search } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import PomodoroMiniWidget from '@/components/pomodoro/PomodoroMiniWidget'
import ThemeToggle from '@/components/shared/ThemeToggle'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'
import { PRIMARY_NAV_ITEMS } from './AppSidebar'

import { formatEmailLocalPart } from '@/lib/utils/userName'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string | null
  userName?: string | null
}

export default function MobileNavDrawer({
  isOpen,
  onClose,
  userEmail,
  userName,
}: MobileNavDrawerProps) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const prevPathnameRef = useRef(pathname)
  const [studyOpen, setStudyOpen] = useState(
    pathname.startsWith('/study') ||
      pathname.startsWith('/tasks') ||
      pathname.startsWith('/pomodoro') ||
      pathname.startsWith('/notes') ||
      pathname.startsWith('/documents') ||
      pathname.startsWith('/videos') ||
      pathname.startsWith('/playlists') ||
      pathname.startsWith('/resources')
  )

  const resolvedName = userName?.trim() || formatEmailLocalPart(userEmail)
  const userInitial = resolvedName.charAt(0).toUpperCase()

  // Sync ref when drawer is opened
  useEffect(() => {
    if (isOpen) {
      prevPathnameRef.current = pathname
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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50 duration-[var(--duration-slow)]"
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div
        ref={drawerRef}
        className="relative flex flex-col justify-between w-72 max-w-[85vw] bg-(--surface) h-full shadow-2xl p-5 z-10 animate-in slide-in-from-left duration-[var(--duration-slow)] [animation-timing-function:var(--ease-smooth-out)] border-r border-(--border-subtle)"
      >
        <div className="overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-(--border-subtle)">
            <Link href="/dashboard" onClick={onClose} className="flex items-center group">
              <StudySpaceLogo size="md" showText />
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-(--radius-md) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised) transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Quick Search Trigger */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => {
                onClose()
                window.dispatchEvent(new CustomEvent('studyspace:open-search'))
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs bg-(--surface-raised) text-(--text-muted) hover:text-(--text-primary) border border-(--border-subtle) hover:border-(--border-strong) rounded-(--radius-md) transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-(--text-muted) shrink-0" strokeWidth={2} />
              <span>Search anything...</span>
            </button>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile Navigation" className="space-y-1">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isExactActive = pathname === item.href
              const isSubActive =
                item.subItems?.some((sub) => pathname.startsWith(sub.href)) || false
              const isActive =
                isExactActive ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                isSubActive

              if (item.subItems) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        prefetch={true}
                        onClick={onClose}
                        className={`flex-1 flex items-center gap-3 px-3.5 py-3 rounded-(--radius-md) text-sm font-medium min-h-[44px] transition-colors duration-150 ${
                          isActive
                            ? 'bg-(--accent-muted) text-(--accent) font-semibold'
                            : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-(--accent)' : 'text-(--text-muted)'
                          }`}
                          strokeWidth={2}
                        />
                        <span>{item.name}</span>
                      </Link>
                      <button
                        type="button"
                        aria-label="Toggle study sub-items"
                        onClick={() => setStudyOpen(!studyOpen)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) rounded-(--radius-sm) transition-colors cursor-pointer"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)] ${
                            studyOpen ? 'rotate-180' : ''
                          }`}
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    {/* Collapsible secondary study links */}
                    {studyOpen && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-(--border-subtle) ml-4">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubItemActive =
                            pathname === sub.href || pathname.startsWith(sub.href)
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              prefetch={true}
                              onClick={onClose}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-(--radius-sm) text-xs font-medium min-h-[40px] transition-colors ${
                                isSubItemActive
                                  ? 'text-(--accent) font-semibold bg-(--accent-muted)'
                                  : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                              }`}
                            >
                              <SubIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isSubItemActive ? 'text-(--accent)' : 'text-(--text-muted)'
                                }`}
                                strokeWidth={2}
                              />
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-(--radius-md) text-sm font-medium min-h-[44px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-(--accent-muted) text-(--accent) font-semibold'
                      : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-(--accent)' : 'text-(--text-muted)'
                    }`}
                    strokeWidth={2}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer: Theme toggle, Pomodoro widget, User email, and Logout */}
        <div className="pt-4 border-t border-(--border-subtle) space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-(--text-secondary)">Theme</span>
            <ThemeToggle />
          </div>

          <PomodoroMiniWidget />

          {/* User profile tile */}
          <div className="p-2.5 rounded-(--radius-md) bg-(--surface-raised) border border-(--border-subtle) flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-(--radius-full) bg-(--accent) text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-(--text-primary) truncate capitalize" title={resolvedName}>
                  {resolvedName}
                </span>
                <span className="text-[10px] text-(--text-muted) uppercase tracking-wider">
                  Student
                </span>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="p-2 rounded-(--radius-sm) text-(--text-muted) hover:text-(--danger) hover:bg-(--danger-muted) transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
