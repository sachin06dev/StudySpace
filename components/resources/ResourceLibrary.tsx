'use client'

import { useState, useMemo, useTransition } from 'react'
import Image from 'next/image'
import { updateResourceAction, deleteResourceAction } from '@/lib/actions/resources'
import { extractHostname, isValidUrl, type ResourceCategory } from '@/lib/resources/utils'
import type { WebsiteResource } from '@/lib/data/resources'
import { CATEGORY_OPTIONS } from './ResourceForm'

export const CATEGORY_STYLES: Record<
  ResourceCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  documentation: {
    bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
    label: 'Documentation',
  },
  course: {
    bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
    label: 'Course',
  },
  reference: {
    bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    label: 'Reference',
  },
  practice: {
    bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    label: 'Practice',
  },
  college: {
    bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    text: 'text-rose-500',
    border: 'border-rose-500/20',
    label: 'College',
  },
  other: {
    bg: 'bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    text: 'text-[var(--text-muted)]',
    border: 'border-[var(--border-subtle)]',
    label: 'Other',
  },
}

interface ResourceLibraryProps {
  resources: WebsiteResource[]
}

export default function ResourceLibrary({ resources }: ResourceLibraryProps) {
  const [prevResources, setPrevResources] = useState(resources)
  const [items, setItems] = useState<WebsiteResource[]>(resources)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [faviconErrors, setFaviconErrors] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  if (prevResources !== resources) {
    setPrevResources(resources)
    setItems(resources)
  }

  const handleDeleteResource = async (resourceId: string) => {
    setError(null)
    setConfirmDeleteId(null)
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

  const handleStartEdit = (resource: WebsiteResource) => {
    setEditingId(resource.id)
    setEditTitle(resource.title)
    setEditUrl(resource.url)
    setEditDescription(resource.description || '')
    setEditCategory(resource.category || '')
    setError(null)
  }

  const handleSaveEdit = (e: React.FormEvent, resourceId: string) => {
    e.preventDefault()
    setError(null)

    const trimmedTitle = editTitle.trim()
    const trimmedUrl = editUrl.trim()

    if (!trimmedTitle || !trimmedUrl) {
      setError('Title and URL cannot be empty.')
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid website URL.')
      return
    }

    const prevItems = items
    setItems((current) =>
      current.map((r) =>
        r.id === resourceId
          ? {
              ...r,
              title: trimmedTitle,
              url: trimmedUrl,
              description: editDescription.trim() || null,
              category: editCategory || null,
            }
          : r
      )
    )
    setEditingId(null)

    startTransition(async () => {
      const res = await updateResourceAction(resourceId, {
        title: trimmedTitle,
        url: trimmedUrl,
        description: editDescription.trim() || null,
        category: editCategory ? editCategory : null,
      })

      if (!res.success) {
        setItems(prevItems)
        setError(res.error || 'Failed to update resource.')
      }
    })
  }

  // Dynamic Category Keys & Counts
  const { categoryKeys, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = { all: items.length }
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

    const keys: { key: string; label: string }[] = [{ key: 'all', label: 'All Resources' }]

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
      <div className="bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border-subtle)] p-12 text-center transition-colors">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">No saved resources yet</h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
          Add online documentation, textbooks, GitHub repos, or cheat sheets above to organize your learning links.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-[var(--danger-muted)] border border-[var(--danger-border)] text-xs text-[var(--danger)] rounded-xl flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-semibold hover:opacity-80 cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Category Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categoryKeys.map(({ key, label }) => {
            const count =
              key === 'all'
                ? categoryCounts.all
                : key === 'uncategorized'
                ? categoryCounts.uncategorized || 0
                : categoryCounts[label] || 0

            const isSelected = selectedCategory === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)]'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[var(--surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search links or notes..."
            className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl pl-8 pr-7 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all"
          />
          <svg
            className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs p-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Clean List View (No bulky equal-sized cards) */}
      {filteredResources.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            No resources match your filter{searchQuery ? ` or search "${searchQuery}"` : ''}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSearchQuery('')
            }}
            className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-xs divide-y divide-[var(--border-subtle)]">
          {filteredResources.map((resource) => {
            const isEditing = editingId === resource.id
            const isConfirming = confirmDeleteId === resource.id
            const hostname = extractHostname(resource.url) || resource.url
            const hasFaviconError = faviconErrors[resource.id]
            const categoryConfig = resource.category
              ? CATEGORY_STYLES[resource.category.toLowerCase() as ResourceCategory] || {
                  bg: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/20',
                  text: 'text-[var(--accent)]',
                  border: 'border-[var(--accent)]/20',
                  label: resource.category,
                }
              : null

            const formattedDate = new Date(resource.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            if (isEditing) {
              return (
                <form
                  key={resource.id}
                  onSubmit={(e) => handleSaveEdit(e, resource.id)}
                  className="p-4 space-y-3 bg-[var(--surface-raised)] transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs text-[var(--text-primary)] bg-[var(--surface)] rounded-xl px-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        required
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full text-xs text-[var(--text-primary)] bg-[var(--surface)] rounded-xl px-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full text-xs text-[var(--text-primary)] bg-[var(--surface)] rounded-xl px-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
                      >
                        <option value="">No Category</option>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">
                        Description / Notes
                      </label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Optional note..."
                        className="w-full text-xs text-[var(--text-primary)] bg-[var(--surface)] rounded-xl px-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface)] border border-[var(--border-subtle)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )
            }

            return (
              <div
                key={resource.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-[var(--surface-hover)] transition-colors"
              >
                {/* Left side: Favicon, Title, Domain, Description */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Favicon */}
                  <div className="w-8 h-8 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 overflow-hidden mt-0.5 sm:mt-0">
                    {resource.favicon_url && !hasFaviconError ? (
                      <Image
                        src={resource.favicon_url}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                        className="w-4 h-4 object-contain"
                        onError={() =>
                          setFaviconErrors((prev) => ({ ...prev, [resource.id]: true }))
                        }
                      />
                    ) : (
                      <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Title, Domain, Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{resource.title}</span>
                        <svg
                          className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      {categoryConfig && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryConfig.bg}`}
                        >
                          {categoryConfig.label}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5 truncate">
                      {hostname}
                    </p>

                    {resource.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                        {resource.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Date & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)]">Saved {formattedDate}</span>

                  <div className="flex items-center gap-1">
                    {isConfirming ? (
                      <div className="flex items-center gap-1 animate-in fade-in-50">
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(resource.id)}
                          disabled={isPending}
                          className="px-2 py-1 rounded-lg bg-[var(--danger)] text-white text-[11px] font-medium cursor-pointer hover:opacity-90"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-[var(--surface-raised)] text-[var(--text-secondary)] text-[11px] font-medium border border-[var(--border-subtle)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open website"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(resource)}
                          title="Edit resource"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(resource.id)}
                          aria-label="Delete resource"
                          title="Delete resource"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
