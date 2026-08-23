import React from 'react'
import Link from 'next/link'

interface StudyLibrarySummaryProps {
  counts: {
    videos: number
    playlists: number
    resources: number
    documents: number
    notes: number
  }
}

export default function StudyLibrarySummary({ counts }: StudyLibrarySummaryProps) {
  const libraryItems = [
    {
      label: 'Videos',
      count: counts.videos,
      href: '/videos',
      singular: 'video',
      plural: 'videos',
      icon: (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      label: 'Playlists',
      count: counts.playlists,
      href: '/playlists',
      singular: 'playlist',
      plural: 'playlists',
      icon: (
        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm3-10v8.1c-.6-.4-1.3-.7-2-.9v-5.2h-16v12h9.1c.3.7.7 1.4 1.2 2h-12.3c-1.1 0-2-.9-2-2v-12c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2zm-14 3h10v2h-10v-2zm0 4h7v2h-7v-2zm0 4h4v2h-4v-2z" />
        </svg>
      ),
    },
    {
      label: 'Resources',
      count: counts.resources,
      href: '/resources',
      singular: 'resource',
      plural: 'resources',
      icon: (
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      label: 'Documents',
      count: counts.documents,
      href: '/documents',
      singular: 'document',
      plural: 'documents',
      icon: (
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Notes',
      count: counts.notes,
      href: '/notes',
      singular: 'note',
      plural: 'notes',
      icon: (
        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ]

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Your Study Library</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of all collected materials across your workspace
          </p>
        </div>

        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
          {totalItems} total {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {libraryItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group p-2.5 sm:p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-center justify-between gap-2.5 shadow-2xs hover:shadow-xs min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="truncate">
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                  {item.label}
                </span>
                <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                  {item.count} {item.count === 1 ? item.singular : item.plural}
                </span>
              </div>
            </div>

            <span className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
