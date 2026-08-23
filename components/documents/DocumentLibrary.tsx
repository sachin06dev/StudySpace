'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import DocumentCard from './DocumentCard'
import { deleteDocumentAction } from '@/lib/actions/documents'
import type { StudyDocument } from '@/lib/data/documents'
import { DOCUMENT_CATEGORIES } from '@/lib/documents/utils'

interface DocumentLibraryProps {
  documents: StudyDocument[]
}

interface StatusFeedback {
  id: string
  type: 'success' | 'error'
  message: string
}

export default function DocumentLibrary({ documents }: DocumentLibraryProps) {
  const [prevDocuments, setPrevDocuments] = useState(documents)
  const [items, setItems] = useState<StudyDocument[]>(documents)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [feedback, setFeedback] = useState<StatusFeedback | null>(null)

  const deletingIdsRef = useRef<Set<string>>(new Set())

  // Sync state with server-provided documents when prop changes
  if (prevDocuments !== documents) {
    setPrevDocuments(documents)
    setItems(documents)
  }

  // Auto-dismiss feedback toast after 3.5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Optimistic Delete Handler
  const handleDeleteDocument = async (documentId: string) => {
    // Avoid duplicate delete requests
    if (deletingIdsRef.current.has(documentId)) {
      return
    }
    deletingIdsRef.current.add(documentId)

    // Capture document and original index for rollback if backend fails
    const docToDelete = items.find((d) => d.id === documentId)
    const docIndex = items.findIndex((d) => d.id === documentId)

    // 1. Immediately remove document from visible UI
    setItems((current) => current.filter((d) => d.id !== documentId))

    // 2. Show lightweight success feedback
    setFeedback({
      id: documentId,
      type: 'success',
      message: 'Document deleted',
    })

    // 3. Send delete request to backend in the background
    try {
      const res = await deleteDocumentAction(documentId)
      deletingIdsRef.current.delete(documentId)

      if (!res.success) {
        // Rollback: restore document to state at original index
        if (docToDelete) {
          setItems((current) => {
            if (current.some((d) => d.id === documentId)) return current
            const next = [...current]
            const insertIdx = docIndex >= 0 && docIndex <= next.length ? docIndex : 0
            next.splice(insertIdx, 0, docToDelete)
            return next
          })
        }
        setFeedback({
          id: `err-${documentId}`,
          type: 'error',
          message: res.error || 'Failed to delete document. Restored to library.',
        })
      }
    } catch {
      deletingIdsRef.current.delete(documentId)
      // Rollback on network failure
      if (docToDelete) {
        setItems((current) => {
          if (current.some((d) => d.id === documentId)) return current
          const next = [...current]
          const insertIdx = docIndex >= 0 && docIndex <= next.length ? docIndex : 0
          next.splice(insertIdx, 0, docToDelete)
          return next
        })
      }
      setFeedback({
        id: `err-${documentId}`,
        type: 'error',
        message: 'Network error while deleting document. Restored to library.',
      })
    }
  }

  // Compute category counts and keys dynamically from current items
  const { categoryKeys, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length,
    }

    const categoriesFound = new Set<string>()

    items.forEach((doc) => {
      if (doc.category && typeof doc.category === 'string' && doc.category.trim()) {
        const cat = doc.category.trim()
        categoriesFound.add(cat)
        counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1
      } else {
        counts['uncategorized'] = (counts['uncategorized'] || 0) + 1
      }
    })

    const keys: { key: string; label: string }[] = [{ key: 'all', label: 'All' }]

    Array.from(categoriesFound)
      .sort((a, b) => a.localeCompare(b))
      .forEach((cat) => {
        const preset = DOCUMENT_CATEGORIES.find(
          (p) => p.value.toLowerCase() === cat.toLowerCase() || p.label.toLowerCase() === cat.toLowerCase()
        )
        keys.push({
          key: cat.toLowerCase(),
          label: preset ? preset.label : cat,
        })
      })

    if (counts['uncategorized'] && counts['uncategorized'] > 0) {
      keys.push({ key: 'uncategorized', label: 'Uncategorized' })
    }

    return { categoryKeys: keys, categoryCounts: counts }
  }, [items])

  // Filtered documents from current items
  const filteredDocuments = useMemo(() => {
    return items.filter((doc) => {
      // Category check
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'uncategorized') {
          if (doc.category) return false
        } else {
          const docCat = (doc.category || '').toLowerCase()
          const preset = DOCUMENT_CATEGORIES.find(
            (p) => p.label.toLowerCase() === docCat || p.value.toLowerCase() === docCat
          )
          const targetKey = preset ? preset.value.toLowerCase() : docCat
          if (targetKey !== selectedCategory.toLowerCase() && docCat !== selectedCategory.toLowerCase()) {
            return false
          }
        }
      }

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = doc.title.toLowerCase().includes(query)
        const matchFileName = doc.file_name.toLowerCase().includes(query)
        const matchDesc = doc.description?.toLowerCase().includes(query) || false
        if (!matchTitle && !matchFileName && !matchDesc) {
          return false
        }
      }

      return true
    })
  }, [items, selectedCategory, searchQuery])

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {/* Feedback status if an item was just deleted or rolled back */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between transition-all animate-in fade-in-50 ${
              feedback.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{feedback.type === 'error' ? '⚠️' : '✓'}</span>
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-semibold hover:opacity-75 cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-12 text-center transition-colors">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">No study documents yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Upload lecture slides, reading materials, practice exams, or notes above to keep your study files organized in one place.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Dynamic Feedback Toast / Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between transition-all animate-in fade-in-50 ${
            feedback.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'error' ? '⚠️' : '✓'}</span>
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:opacity-75 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Category Filter Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categoryKeys.map(({ key, label }) => {
            const count =
              key === 'all'
                ? categoryCounts.all
                : key === 'uncategorized'
                ? categoryCounts.uncategorized || 0
                : categoryCounts[key] || 0

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
                    isSelected
                      ? 'bg-indigo-700/80 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick Search */}
        {items.length > 2 && (
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
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

      {/* Document Cards Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No documents match your current filter{searchQuery ? ` or search "${searchQuery}"` : ''}.
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
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      )}
    </div>
  )
}

