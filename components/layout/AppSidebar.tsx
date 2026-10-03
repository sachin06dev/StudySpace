'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Settings,
  ChevronDown,
  CheckSquare,
  Timer,
  FileText,
  FolderLock,
  Video,
  ListVideo,
  Globe,
  Search,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import PomodoroMiniWidget from '@/components/pomodoro/PomodoroMiniWidget'
import ThemeToggle from '@/components/shared/ThemeToggle'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'
import { formatEmailLocalPart } from '@/lib/utils/userName'
import { useSidebarCollapse } from './SidebarCollapseContext'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  subItems?: {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  }[]
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Timetable',
    href: '/timetable',
    icon: Calendar,
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: CheckCircle2,
  },
  {
    name: 'Study',
    href: '/study',
    icon: BookOpen,
    subItems: [
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
      { name: 'Focus', href: '/pomodoro', icon: Timer },
      { name: 'Notes', href: '/notes', icon: FileText },
      { name: 'Documents', href: '/documents', icon: FolderLock },
      { name: 'Videos', href: '/videos', icon: Video },
      { name: 'Playlists', href: '/playlists', icon: ListVideo },
      { name: 'Resources', href: '/resources', icon: Globe },
    ],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface AppSidebarProps {
  userEmail?: string | null
  userName?: string | null
}

export default function AppSidebar({ userEmail, userName }: AppSidebarProps) {
  const pathname = usePathname()
  const { isSidebarCollapsed, toggleSidebar } = useSidebarCollapse()
  const [studyFlyoutOpen, setStudyFlyoutOpen] = useState(false)
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

  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnterStudy = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current)
      flyoutTimerRef.current = null
    }
    setStudyFlyoutOpen(true)
  }

  const handleMouseLeaveStudy = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current)
    flyoutTimerRef.current = setTimeout(() => {
      setStudyFlyoutOpen(false)
    }, 200)
  }

  // Collapsed Mode (Icon Rail)
  if (isSidebarCollapsed) {
    return (
      <aside
        className="w-[72px] shrink-0 border-r border-(--border-subtle) bg-(--surface) py-4 px-2 flex flex-col justify-between h-screen sticky top-0 z-30 transition-all duration-200 select-none"
        aria-label="Navigation Icon Rail"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Logo & Toggle */}
          <div className="flex flex-col items-center gap-2">
            <Link href="/dashboard" className="p-1 rounded-xl hover:bg-(--surface-raised) transition-colors">
              <StudySpaceLogo size="sm" showText={false} />
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand sidebar ([)"
              aria-label="Expand sidebar"
              className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-raised) transition-colors cursor-pointer"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Trigger Icon */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('studyspace:open-search'))
            }}
            title="Search anything (⌘K)"
            aria-label="Search"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-raised) border border-(--border-subtle) transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Navigation Items (Icons only with floating tooltips & flyouts) */}
          <nav className="flex flex-col items-center space-y-1.5 w-full">
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
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={handleMouseEnterStudy}
                    onMouseLeave={handleMouseLeaveStudy}
                  >
                    <button
                      type="button"
                      onClick={() => setStudyFlyoutOpen((prev) => !prev)}
                      title={`${item.name} (Click or hover for study tools)`}
                      aria-expanded={studyFlyoutOpen}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-(--accent-muted) text-(--accent) shadow-2xs font-semibold'
                          : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </button>

                    {/* Flyout for Study sub-items in rail mode */}
                    {studyFlyoutOpen && (
                      <div
                        className="absolute left-full top-0 pl-2.5 z-50 animate-in fade-in slide-in-from-left-2 duration-150"
                        onMouseEnter={handleMouseEnterStudy}
                        onMouseLeave={handleMouseLeaveStudy}
                      >
                        <div className="w-56 bg-(--surface) border border-(--border-subtle) rounded-2xl shadow-2xl p-2">
                          <div className="px-2.5 py-1 text-[10px] font-mono text-(--text-muted) uppercase tracking-wider font-semibold border-b border-(--border-subtle) mb-1">
                            Study Tools
                          </div>
                          {item.subItems.map((sub) => {
                            const SubIcon = sub.icon
                            const isSubActiveItem = pathname === sub.href || pathname.startsWith(sub.href)
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setStudyFlyoutOpen(false)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  isSubActiveItem
                                    ? 'bg-(--accent-muted) text-(--accent) font-semibold'
                                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                                }`}
                              >
                                <SubIcon className="w-4 h-4 shrink-0" />
                                <span>{sub.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-(--accent-muted) text-(--accent) shadow-2xs font-semibold'
                      : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center space-y-3 pt-3 border-t border-(--border-subtle)">
          <ThemeToggle />
          <div
            className="w-8 h-8 rounded-full bg-(--accent) text-white flex items-center justify-center text-xs font-bold shadow-2xs"
            title={resolvedName}
          >
            {userInitial}
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="p-2 text-(--text-muted) hover:text-(--danger) hover:bg-(--danger-muted) rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    )
  }

  // Expanded Mode (Full Sidebar)
  return (
    <aside className="w-64 shrink-0 border-r border-(--border-subtle) bg-(--surface) p-4 flex flex-col justify-between h-screen sticky top-0 z-20 transition-all duration-200 select-none">
      <div className="overflow-y-auto pr-1">
        {/* Brand Header with Collapse Toggle */}
        <div className="flex items-center justify-between px-2 mb-5">
          <Link href="/dashboard" className="flex items-center group">
            <StudySpaceLogo size="md" showText showSubtitle />
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Collapse sidebar ([)"
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-raised) transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Global Quick Search Trigger */}
        <div className="px-1 mb-4">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('studyspace:open-search'))
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs bg-(--surface-raised) text-(--text-muted) hover:text-(--text-primary) border border-(--border-subtle) hover:border-(--border-strong) rounded-(--radius-md) transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-(--text-muted) shrink-0" strokeWidth={2} />
              <span>Search anything...</span>
            </div>
            <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-(--surface) border border-(--border-subtle) text-(--text-muted)">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Primary Navigation Items */}
        <nav aria-label="Main Navigation" className="space-y-1">
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
                      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-(--radius-md) text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-(--accent-muted) text-(--accent) font-semibold shadow-2xs'
                          : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-(--accent)' : 'text-(--text-muted)'
                        }`}
                        strokeWidth={2}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Toggle study sub-items"
                      onClick={() => setStudyOpen(!studyOpen)}
                      className="p-2 text-(--text-muted) hover:text-(--text-primary) rounded-(--radius-sm) transition-colors cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)] ${
                          studyOpen ? 'rotate-180' : ''
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* Secondary Study Items */}
                  {studyOpen && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-(--border-subtle) ml-4">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon
                        const isSubItemActive = pathname === sub.href || pathname.startsWith(sub.href)
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-(--radius-sm) text-[11px] font-medium transition-colors ${
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
                className={`flex items-center gap-3 px-3 py-2 rounded-(--radius-md) text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-(--accent-muted) text-(--accent) font-semibold shadow-2xs'
                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-raised)'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-(--accent)' : 'text-(--text-muted)'
                  }`}
                  strokeWidth={2}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Anchor: Pomodoro Widget, User Profile Pill & Sign Out */}
      <div className="pt-3 border-t border-(--border-subtle) space-y-2.5">
        <PomodoroMiniWidget />

        {/* User Profile Anchor */}
        <div className="p-2 rounded-(--radius-md) bg-(--surface-raised) border border-(--border-subtle) flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-(--radius-full) bg-(--accent) text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
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
              className="p-1.5 rounded-(--radius-sm) text-(--text-muted) hover:text-(--danger) hover:bg-(--danger-muted) transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
