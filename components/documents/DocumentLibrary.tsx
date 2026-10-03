'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { deleteDocumentAction, getDownloadUrlAction } from '@/lib/actions/documents'
import type { StudyDocument } from '@/lib/data/documents'
import {
  formatFileSize,
  getFileTypeInfo,
  getDocumentCategoryConfig,
  DOCUMENT_CATEGORIES,
} from '@/lib/documents/utils'

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)


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

  // Secure View / Download presigned URL handler
  const handleOpenDocument = async (doc: StudyDocument) => {
    setDownloadingId(doc.id)
    try {
      const res = await getDownloadUrlAction(doc.id)
      if (!res.success || !res.data) {
        setFeedback({
          id: doc.id,
          type: 'error',
          message: res.error || 'Failed to generate secure link.',
        })
        return
      }
      window.open(res.data, '_blank', 'noopener,noreferrer')
    } catch {
      setFeedback({
        id: doc.id,
        type: 'error',
        message: 'Network error while generating access link.',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  // Optimistic Delete Handler
  const handleDeleteDocument = async (documentId: string) => {
    if (deletingIdsRef.current.has(documentId)) return
    deletingIdsRef.current.add(documentId)

    const docToDelete = items.find((d) => d.id === documentId)
    const docIndex = items.findIndex((d) => d.id === documentId)

    // 1. Optimistic removal
    setItems((current) => current.filter((d) => d.id !== documentId))
    setConfirmingDeleteId(null)
    setFeedback({
      id: documentId,
      type: 'success',
      message: 'Document deleted from vault.',
    })

    // 2. Background mutation
    try {
      const res = await deleteDocumentAction(documentId)
      deletingIdsRef.current.delete(documentId)

      if (!res.success) {
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
          message: res.error || 'Failed to delete document. Restored to vault.',
        })
      }
    } catch {
      deletingIdsRef.current.delete(documentId)
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
        message: 'Network error while deleting document. Restored to vault.',
      })
    }
  }

  // Categories and counts
  const { categoryKeys, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = { all: items.length }
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

    const keys: { key: string; label: string }[] = [{ key: 'all', label: 'All Files' }]

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

  // Filtered documents
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

  // Top 3 recent documents
  const recentDocuments = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
  }, [items])

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between transition-all animate-in fade-in-50 ${
              feedback.type === 'error'
                ? 'bg-[var(--danger-muted)] border border-[var(--danger-border)] text-[var(--danger)]'
                : 'bg-[var(--success-muted)] border border-[var(--success-border)] text-[var(--success)]'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="font-semibold hover:opacity-80 cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border-subtle)] p-12 text-center transition-colors">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">No study documents yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Upload your first lecture notes, syllabus, slides, or problem sets above to build your private academic vault.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between transition-all animate-in fade-in-50 ${
            feedback.type === 'error'
              ? 'bg-[var(--danger-muted)] border border-[var(--danger-border)] text-[var(--danger)]'
              : 'bg-[var(--success-muted)] border border-[var(--success-border)] text-[var(--success)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'error' ? '⚠️' : '✓'}</span>
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-semibold hover:opacity-80 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Access: Recent Documents Shelf */}
      {recentDocuments.length > 0 && !searchQuery.trim() && selectedCategory === 'all' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Recently Uploaded
            </h2>
            <span className="text-[11px] text-[var(--text-muted)]">Quick Launch</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentDocuments.map((doc) => {
              const fileInfo = getFileTypeInfo(doc.file_name, doc.mime_type)
              const isOpening = downloadingId === doc.id

              return (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDocument(doc)}
                  className="group relative flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-hover)] transition-all cursor-pointer shadow-xs"
                >
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${fileInfo.bgColor} ${fileInfo.color} ${fileInfo.borderColor}`}
                  >
                    {isOpening ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      fileInfo.label
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate transition-colors">
                      {doc.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {formatFileSize(doc.file_size_bytes)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Open document"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--accent)] hover:scale-110 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Controls Bar: Category Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {/* Category Filter Pills */}
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)]'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files or titles..."
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

      {/* Academic Vault List / Table View */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            No documents match your filter{searchQuery ? ` or search "${searchQuery}"` : ''}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSearchQuery('')
            }}
            className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer mt-2"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-xs">
          {/* Table Header for Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <div className="col-span-5">Document Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Uploaded</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table / List Rows */}
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredDocuments.map((doc) => {
              const fileInfo = getFileTypeInfo(doc.file_name, doc.mime_type)
              const categoryConfig = getDocumentCategoryConfig(doc.category)
              const isOpening = downloadingId === doc.id
              const isConfirming = confirmingDeleteId === doc.id
              const formattedDate = new Date(doc.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <div
                  key={doc.id}
                  className="group flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 sm:px-5 py-3.5 hover:bg-[var(--surface-hover)] transition-colors items-start md:items-center"
                >
                  {/* Column 1: Document Name & File Type */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0 w-full">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-[11px] shrink-0 ${fileInfo.bgColor} ${fileInfo.color} ${fileInfo.borderColor}`}
                    >
                      {isOpening ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        fileInfo.label
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDocument(doc)}
                        className="block text-left text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate cursor-pointer w-full"
                        title={doc.title}
                      >
                        {doc.title}
                      </button>
                      <p className="text-[11px] text-[var(--text-muted)] truncate" title={doc.file_name}>
                        {doc.file_name}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Category */}
                  <div className="col-span-2 flex items-center">
                    {categoryConfig ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}
                      >
                        {categoryConfig.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">—</span>
                    )}
                  </div>

                  {/* Column 3: Size */}
                  <div className="col-span-2 text-xs text-[var(--text-secondary)] font-mono">
                    {formatFileSize(doc.file_size_bytes)}
                  </div>

                  {/* Column 4: Date */}
                  <div className="col-span-2 text-xs text-[var(--text-muted)]">
                    {formattedDate}
                  </div>

                  {/* Column 5: Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1.5 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]">
                    {isConfirming ? (
                      <div className="flex items-center gap-1 animate-in fade-in-50">
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="px-2 py-1 rounded-lg bg-[var(--danger)] text-white text-[11px] font-medium cursor-pointer hover:opacity-90"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-[var(--surface-raised)] text-[var(--text-secondary)] text-[11px] font-medium border border-[var(--border-subtle)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenDocument(doc)}
                          disabled={isOpening}
                          title="Open document"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(doc.id)}
                          aria-label="Delete document"
                          title="Delete document"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
