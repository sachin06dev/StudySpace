'use client'

import { useState, useTransition } from 'react'
import { getDownloadUrlAction, deleteDocumentAction } from '@/lib/actions/documents'
import {
  formatFileSize,
  getFileTypeInfo,
  getDocumentCategoryConfig,
} from '@/lib/documents/utils'
import type { StudyDocument } from '@/lib/data/documents'

interface DocumentCardProps {
  document: StudyDocument
  onDelete?: (documentId: string) => void
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInfo = getFileTypeInfo(document.file_name, document.mime_type)
  const categoryConfig = getDocumentCategoryConfig(document.category)

  const handleOpenDownload = async () => {
    setError(null)
    setIsDownloading(true)
    try {
      const res = await getDownloadUrlAction(document.id)
      if (!res.success || !res.data) {
        setError(res.error || 'Failed to generate download link.')
        return
      }
      // Open signed URL in a new tab
      window.open(res.data, '_blank', 'noopener,noreferrer')
    } catch (err: unknown) {
      console.error('Error opening document:', err)
      const msg = err instanceof Error ? err.message : 'Failed to open document.'
      setError(msg)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = () => {
    setError(null)
    setIsConfirmingDelete(false)
    if (onDelete) {
      onDelete(document.id)
      return
    }
    startTransition(async () => {
      const res = await deleteDocumentAction(document.id)
      if (!res.success) {
        setError(res.error || 'Failed to delete document.')
      }
    })
  }

  // Format date with explicit 'en-US' locale to prevent hydration mismatch
  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className={`group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden ${
        isPending ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Top Row: File Type Badge, Category Pill */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* File Icon & Extension Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[11px] shrink-0 ${fileInfo.bgColor} ${fileInfo.color} ${fileInfo.borderColor}`}
              >
                {fileInfo.label}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate" title={document.file_name}>
                {document.file_name}
              </span>
            </div>

            {/* Category Badge */}
            {categoryConfig && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border shrink-0 ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}
              >
                {categoryConfig.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1.5 cursor-pointer"
            onClick={handleOpenDownload}
            title={document.title}
          >
            {document.title}
          </h3>

          {/* Description */}
          {document.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 leading-relaxed">
              {document.description}
            </p>
          )}
        </div>

        {/* Bottom Footer: File Size, Upload Date, and Action Buttons */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600 dark:text-gray-300">{formatFileSize(document.file_size_bytes)}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1.5 animate-in fade-in-50">
                <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-2.5 py-1 rounded-md bg-red-600 text-white font-medium text-[11px] hover:bg-red-700 cursor-pointer min-h-[30px]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isPending}
                  className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-[11px] hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer min-h-[30px]"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                {/* View Document Button */}
                <button
                  type="button"
                  onClick={handleOpenDownload}
                  disabled={isDownloading || isPending}
                  title="View document in new tab"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50 min-h-[36px]"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Opening...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span>View</span>
                    </>
                  )}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  disabled={isPending || isDownloading}
                  aria-label="Delete document"
                  title="Delete document"
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
