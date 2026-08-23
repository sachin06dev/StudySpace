'use client'

import { useState, useMemo } from 'react'
import ResourceCard from './ResourceCard'
import { deleteResourceAction } from '@/lib/actions/resources'
import type { WebsiteResource } from '@/lib/data/resources'

interface ResourceLibraryProps {
  resources: WebsiteResource[]
}

export default function ResourceLibrary({ resources }: ResourceLibraryProps) {
  const [prevResources, setPrevResources] = useState(resources)
  const [items, setItems] = useState<WebsiteResource[]>(resources)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (prevResources !== resources) {
    setPrevResources(resources)
    setItems(resources)
  }

  // Optimistic Delete Handler
  const handleDeleteResource = async (resourceId: string) => {
    setError(null)
    const prevItems = items

    // 1. Optimistic removal
    setItems((current) => current.filter((r) => r.id !== resourceId))

    // 2. Server mutation in background
    try {
      const res = await deleteResourceAction(resourceId)
      if (!res.success) {
        setItems(prevItems)
        setError(res.error || 'Failed to delete resource.')
      }
    } catch {
      setItems(prevItems)
      setError('Network error while deleting resource.')
    }
  }

  // Compute all unique category counts dynamically from real data
  const { categoryKeys, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length,
    }

    const categoriesFound = new Set<string>()

    items.forEach((r) => {
      if (r.category && typeof r.category === 'string' && r.category.trim()) {
        const cat = r.category.trim()
        categoriesFound.add(cat)
        counts[cat] = (counts[cat] || 0) + 1
      } else {
        counts['uncategorized'] = (counts['uncategorized'] || 0) + 1
      }
    })

    const keys: { key: string; label: string }[] = [{ key: 'all', label: 'All' }]

    Array.from(categoriesFound)
      .sort((a, b) => a.localeCompare(b))
      .forEach((cat) => {
        keys.push({ key: cat.toLowerCase(), label: cat })
      })

    if (counts['uncategorized'] && counts['uncategorized'] > 0) {
      keys.push({ key: 'uncategorized', label: 'Uncategorized' })
    }

    return { categoryKeys: keys, categoryCounts: counts }
  }, [items])

  // Filtered resources
  const filteredResources = useMemo(() => {
    return items.filter((resource) => {
      // Category check
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'uncategorized') {
          if (resource.category) return false
        } else {
          const resCat = (resource.category || '').toLowerCase()
          if (resCat !== selectedCategory.toLowerCase()) {
            return false
          }
        }
      }

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = resource.title.toLowerCase().includes(query)
        const matchDesc = resource.description?.toLowerCase().includes(query) || false
        const matchUrl = resource.url.toLowerCase().includes(query)
        if (!matchTitle && !matchDesc && !matchUrl) {
          return false
        }
      }

      return true
    })
  }, [items, selectedCategory, searchQuery])

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-12 text-center transition-colors">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">No resources saved yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Save documentation, online courses, cheat sheets, or articles above to build your study reference library.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Category Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categoryKeys.map(({ key, label }) => {
            const count = key === 'all' ? categoryCounts.all : (key === 'uncategorized' ? categoryCounts.uncategorized : categoryCounts[label] || 0)
            const isSelected = selectedCategory === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-indigo-700/80 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick Search */}
        {items.length > 3 && (
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800 rounded-lg pl-8 pr-7 py-1.5 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:outline-hidden"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No resources match your current filter{searchQuery ? ` or search "${searchQuery}"` : ''}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSearchQuery('')
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      )}
    </div>
  )
}
