'use client'

import React, { useState } from 'react'
import { PREVIEW_RESOURCES, type PreviewResource } from './previewDemoData'

export default function ResourcesPreview() {
  const [resources] = useState<PreviewResource[]>(PREVIEW_RESOURCES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'documentation', label: 'Documentation' },
    { id: 'practice', label: 'Practice' },
    { id: 'course', label: 'Courses' },
    { id: 'reference', label: 'Reference' },
    { id: 'college', label: 'College' },
  ]

  const categoryBadges: Record<
    string,
    { bg: string; text: string; border: string; label: string }
  > = {
    documentation: {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      label: 'Documentation',
    },
    practice: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'Practice',
    },
    course: {
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      label: 'Course',
    },
    reference: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Reference',
    },
    college: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      label: 'College',
    },
  }

  const filteredResources = resources.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' || r.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCopyLink = (id: string) => {
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            Saved Web Resources &amp; Bookmarks
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Curate developer docs, course links, cheatsheets, and practice portals.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-52 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search links or docs..."
            className="w-full bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-xs border border-gray-200/80 dark:border-gray-700/80 rounded-xl pl-7 pr-3 py-1.5 focus:outline-hidden focus:border-indigo-500"
          />
          <span className="absolute left-2.5 top-1.5 text-gray-400 text-[10px]">🔍</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[280px] overflow-y-auto pr-1">
        {filteredResources.map((res) => {
          const badge = categoryBadges[res.category]
          const isCopied = copiedId === res.id
          return (
            <div
              key={res.id}
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs transition-all flex flex-col justify-between min-w-0"
            >
              <div>
                {/* Top Row: Domain & Category Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-gray-100 dark:bg-gray-700 text-[9px] sm:text-[10px] flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      🌐
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 truncate">
                      {res.domain}
                    </span>
                  </div>

                  {badge && (
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[11px] sm:text-xs line-clamp-1 leading-snug mb-0.5">
                  {res.title}
                </h4>

                {/* Description */}
                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>

              {/* Bottom Footer: Date & Simulated Action */}
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400">
                <span className="truncate">Saved {res.savedDate}</span>

                <button
                  type="button"
                  onClick={() => handleCopyLink(res.id)}
                  className="px-2 py-0.5 sm:py-1 rounded-lg bg-gray-50 dark:bg-gray-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors cursor-pointer shrink-0 ml-2"
                >
                  {isCopied ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
