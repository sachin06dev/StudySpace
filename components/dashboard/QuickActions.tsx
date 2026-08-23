import React from 'react'
import Link from 'next/link'

interface QuickActionItem {
  label: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}

const actions: QuickActionItem[] = [
  {
    label: 'Add Task',
    description: 'Create study goal',
    href: '/tasks',
    color: 'hover:border-indigo-300 group-hover:bg-indigo-50 text-indigo-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: 'Start Focus',
    description: '25-min Pomodoro',
    href: '/pomodoro',
    color: 'hover:border-emerald-300 group-hover:bg-emerald-50 text-emerald-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Add Video',
    description: 'Save YouTube link',
    href: '/videos',
    color: 'hover:border-red-300 group-hover:bg-red-50 text-red-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'Add Playlist',
    description: 'Import lecture series',
    href: '/playlists',
    color: 'hover:border-purple-300 group-hover:bg-purple-50 text-purple-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm3-10v8.1c-.6-.4-1.3-.7-2-.9v-5.2h-16v12h9.1c.3.7.7 1.4 1.2 2h-12.3c-1.1 0-2-.9-2-2v-12c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2zm-14 3h10v2h-10v-2zm0 4h7v2h-7v-2zm0 4h4v2h-4v-2z" />
      </svg>
    ),
  },
  {
    label: 'Add Resource',
    description: 'Bookmark documentation',
    href: '/resources',
    color: 'hover:border-amber-300 group-hover:bg-amber-50 text-amber-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    label: 'Upload Document',
    description: 'PDF, notes, slides',
    href: '/documents',
    color: 'hover:border-blue-300 group-hover:bg-blue-50 text-blue-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
]

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs transition-colors">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Quick Actions</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Fast shortcuts to study tools
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`group p-3 sm:p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col items-center text-center shadow-2xs hover:shadow-xs ${action.color}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white leading-tight">
              {action.label}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 hidden sm:block">
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
