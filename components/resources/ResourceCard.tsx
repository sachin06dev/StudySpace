'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { updateResourceAction, deleteResourceAction } from '@/lib/actions/resources'
import {
  extractHostname,
  isValidUrl,
  type ResourceCategory,
} from '@/lib/resources/utils'
import type { WebsiteResource } from '@/lib/data/resources'
import { CATEGORY_OPTIONS } from './ResourceForm'

export const CATEGORY_STYLES: Record<
  ResourceCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  documentation: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Documentation',
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
  practice: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Practice',
  },
  college: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'College',
  },
  other: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    label: 'Other',
  },
}

interface ResourceCardProps {
  resource: WebsiteResource
  onDelete?: (resourceId: string) => void
}

export default function ResourceCard({ resource, onDelete }: ResourceCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [faviconError, setFaviconError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [editTitle, setEditTitle] = useState(resource.title)
  const [editUrl, setEditUrl] = useState(resource.url)
  const [editDescription, setEditDescription] = useState(resource.description || '')
  const [editCategory, setEditCategory] = useState<string>(resource.category || '')

  const hostname = extractHostname(resource.url) || resource.url
  const categoryConfig = resource.category
    ? CATEGORY_STYLES[resource.category.toLowerCase() as ResourceCategory] || {
        bg: 'bg-indigo-50 dark:bg-indigo-950/60',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        label: resource.category,
      }
    : null

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedTitle = editTitle.trim()
    const trimmedUrl = editUrl.trim()

    if (!trimmedTitle) {
      setError('Resource title cannot be empty.')
      return
    }

    if (!trimmedUrl) {
      setError('Resource URL cannot be empty.')
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid website URL.')
      return
    }

    startTransition(async () => {
      const res = await updateResourceAction(resource.id, {
        title: trimmedTitle,
        url: trimmedUrl,
        description: editDescription.trim() || null,
        category: editCategory ? editCategory : null,
      })

      if (!res.success) {
        setError(res.error || 'Failed to update resource.')
      } else {
        setIsEditing(false)
        setFaviconError(false) // reset error in case favicon updated
      }
    })
  }

  const handleCancelEdit = () => {
    setEditTitle(resource.title)
    setEditUrl(resource.url)
    setEditDescription(resource.description || '')
    setEditCategory(resource.category || '')
    setError(null)
    setIsEditing(false)
  }

  const handleDelete = () => {
    setError(null)
    setIsConfirmingDelete(false)

    if (onDelete) {
      onDelete(resource.id)
      return
    }

    startTransition(async () => {
      const res = await deleteResourceAction(resource.id)
      if (!res.success) {
        setError(res.error || 'Failed to delete resource.')
      }
    })
  }

  // Format date with explicit locale 'en-US' to avoid SSR/client hydration mismatch
  const formattedDate = new Date(resource.created_at).toLocaleDateString('en-US', {
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
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex justify-between items-center">
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

      {/* Editing Mode */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="">No Category</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {editCategory &&
                    !CATEGORY_OPTIONS.some(
                      (opt) => opt.value.toLowerCase() === editCategory.toLowerCase()
                    ) && <option value={editCategory}>{editCategory}</option>}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Optional note..."
                  className="w-full text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !editTitle.trim() || !editUrl.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Normal View */
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            {/* Top Row: Favicon, Domain, Category Badge */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                {/* Favicon or Fallback Icon */}
                <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {resource.favicon_url && !faviconError ? (
                    <Image
                      src={resource.favicon_url}
                      alt=""
                      width={16}
                      height={16}
                      unoptimized
                      className="w-4 h-4 object-contain"
                      onError={() => setFaviconError(true)}
                    />
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  )}
                </div>

                {/* Domain */}
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate" title={hostname}>
                  {hostname}
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

            {/* Title with Link */}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1.5">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-start gap-1"
              >
                <span>{resource.title}</span>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </h3>

            {/* Description */}
            {resource.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 leading-relaxed">
                {resource.description}
              </p>
            )}
          </div>

          {/* Bottom Footer: Date & Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Saved {formattedDate}</span>

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
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open website in new tab"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    title="Edit resource"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    title="Delete resource"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
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
      )}
    </div>
  )
}
