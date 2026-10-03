'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  Loader2,
  BookOpen,
  Calendar,
  Video,
  ListVideo,
  FileText,
  FolderLock,
  Globe,
  CheckSquare,
  CornerDownLeft,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { searchGlobalAction } from '@/lib/actions/search'
import { APP_FEATURES, type GroupedSearchResults, type SearchResultItem } from '@/lib/search/features'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Features & Tools': Sparkles,
  Subjects: BookOpen,
  Timetable: Calendar,
  Videos: Video,
  Playlists: ListVideo,
  Notes: FileText,
  Documents: FolderLock,
  Resources: Globe,
  Tasks: CheckSquare,
}

export default function GlobalSearchModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [groupedResults, setGroupedResults] = useState<GroupedSearchResults[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Default quick jump shortcuts when search is blank
  const defaultShortcuts = React.useMemo(() => {
    return APP_FEATURES.slice(0, 8).map((f) => ({
      id: f.id,
      title: f.title,
      subtitle: f.subtitle,
      category: 'Features & Tools',
      href: f.href,
      badge: 'Feature',
      resultType: 'feature' as const,
    }))
  }, [])

  // Flattened items for linear keyboard navigation
  const flatItems = React.useMemo(() => {
    if (query.trim().length < 2) {
      return defaultShortcuts
    }
    const list: SearchResultItem[] = []
    groupedResults.forEach((g) => {
      list.push(...g.items)
    })
    return list
  }, [groupedResults, query, defaultShortcuts])

  const openSearch = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setGroupedResults([])
    setSelectedIndex(0)
    setErrorMessage(null)
  }, [])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setGroupedResults([])
    setSelectedIndex(0)
    setErrorMessage(null)
  }, [])

  // Listen for Cmd+K / Ctrl+K and custom trigger event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        closeSearch()
      }
    }

    const handleCustomOpen = () => {
      openSearch()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('studyspace:open-search', handleCustomOpen)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('studyspace:open-search', handleCustomOpen)
    }
  }, [isOpen, openSearch, closeSearch])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Debounced search trigger (200ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const response = await searchGlobalAction(trimmed)
        if (response.success) {
          setGroupedResults(response.results)
          setSelectedIndex(0)
        } else {
          setErrorMessage(response.error || 'Failed to fetch search results.')
        }
      } catch {
        setErrorMessage('Search error occurred.')
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setGroupedResults([])
      setIsLoading(false)
      setErrorMessage(null)
      setSelectedIndex(0)
    }
  }

  const handleClearQuery = () => {
    setQuery('')
    setGroupedResults([])
    setIsLoading(false)
    setErrorMessage(null)
    setSelectedIndex(0)
  }

  // Handle keyboard navigation: ArrowUp, ArrowDown, Enter
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flatItems.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selectedItem = flatItems[selectedIndex]
      if (selectedItem) {
        closeSearch()
        router.push(selectedItem.href)
      }
    }
  }

  const handleItemClick = (item: SearchResultItem) => {
    closeSearch()
    router.push(item.href)
  }

  if (!isOpen) return null

  let runningIndex = 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-[10vh] sm:pt-[12vh]"
    >
      {/* Backdrop */}
      <div
        onClick={closeSearch}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-[var(--duration-fast)]"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] z-10 animate-in zoom-in-[0.96] duration-[var(--duration-fast)] [animation-timing-function:var(--ease-smooth-out)] transition-colors">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0 mr-3" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Search features, classes, notes, videos, documents, tasks..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none min-w-0"
          />

          {isLoading && (
            <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin shrink-0 ml-2" />
          )}

          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-1"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 ml-3 pl-3 border-l border-[var(--border-subtle)]">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-2 sm:p-3 space-y-4 divide-y divide-[var(--border-subtle)]">
          {/* Query Too Short Prompt */}
          {query.trim().length === 1 && (
            <div className="py-6 text-center text-xs text-[var(--text-muted)]">
              Type at least 2 characters to search across features & workspace...
            </div>
          )}

          {/* Initial Clean State: Quick Jump to Workspace Tools */}
          {query.trim().length === 0 && (
            <div className="pt-2 pb-2">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Quick Jump · Workspace Features</span>
                </div>
                <span className="text-[10px] lowercase font-normal text-[var(--text-muted)]">
                  ↑↓ or click to open
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {defaultShortcuts.map((item, idx) => {
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`text-left flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-[var(--text-primary)] shadow-xs'
                          : 'bg-[var(--surface-raised)]/60 hover:bg-[var(--surface-raised)] border-transparent text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-[var(--accent)] translate-x-0.5' : 'text-[var(--text-muted)]'}`} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[var(--danger-muted)] text-[var(--danger)] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Empty Results State */}
          {!isLoading && query.trim().length >= 2 && flatItems.length === 0 && !errorMessage && (
            <div className="py-10 text-center space-y-1.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Try searching for a tool (e.g. &ldquo;Pomodoro&rdquo;), a subject, or lecture note keyword.
              </p>
            </div>
          )}

          {/* Grouped Category Results */}
          {query.trim().length >= 2 &&
            groupedResults.map((group) => {
              const Icon = CATEGORY_ICONS[group.category] || BookOpen
              const isFeatureGroup = group.category === 'Features & Tools'

              return (
                <div key={group.category} className="pt-2 first:pt-0">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{group.category}</span>
                    <span className="text-[10px] font-normal text-[var(--text-muted)]/70">
                      ({group.items.length})
                    </span>
                  </div>

                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const itemIdx = runningIndex++
                      const isSelected = itemIdx === selectedIndex
                      const isFeature = item.resultType === 'feature' || isFeatureGroup

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setSelectedIndex(itemIdx)}
                          className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                            isSelected
                              ? isFeature
                                ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]/40'
                                : 'bg-[var(--surface-raised)] text-[var(--text-primary)] ring-1 ring-[var(--border-subtle)]'
                              : 'hover:bg-[var(--surface-raised)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md shrink-0 ${
                                    isFeature
                                      ? 'bg-[var(--accent)] text-white'
                                      : 'bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>

                          {isSelected && (
                            <div className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]">
                              <span>Jump</span>
                              <CornerDownLeft className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>

        {/* Footer info strip */}
        <div className="px-4 py-2 bg-[var(--surface-raised)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 text-[10px] font-mono rounded bg-[var(--surface)] border border-[var(--border-subtle)]">↑</kbd>
              <kbd className="px-1 py-0.5 text-[10px] font-mono rounded bg-[var(--surface)] border border-[var(--border-subtle)]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 text-[10px] font-mono rounded bg-[var(--surface)] border border-[var(--border-subtle)]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]/80">
            StudySpace Workspace
          </span>
        </div>
      </div>
    </div>
  )
}
