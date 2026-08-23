'use client'

import { useState, useTransition } from 'react'
import { createResourceAction } from '@/lib/actions/resources'
import { isValidUrl } from '@/lib/resources/utils'

export const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'documentation', label: 'Documentation' },
  { value: 'course', label: 'Course' },
  { value: 'reference', label: 'Reference' },
  { value: 'practice', label: 'Practice' },
  { value: 'college', label: 'College' },
  { value: 'other', label: 'Other' },
]

export const DEFAULT_CATEGORY_OPTIONS = CATEGORY_OPTIONS.map((c) => c.value)


export default function ResourceForm() {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('')
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    if (!trimmedTitle) {
      setError('Please enter a resource title.')
      return
    }

    if (!trimmedUrl) {
      setError('Please enter a website URL.')
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid website URL (e.g., https://developer.mozilla.org or react.dev).')
      return
    }

    const finalCategory = isAddingCustomCategory
      ? customCategoryInput.trim()
      : category.trim()

    startTransition(async () => {
      const res = await createResourceAction({
        title: trimmedTitle,
        url: trimmedUrl,
        description: description.trim() || null,
        category: finalCategory || null,
      })

      if (!res.success) {
        setError(res.error || 'Failed to save resource. Please try again.')
      } else {
        setTitle('')
        setUrl('')
        setDescription('')
        setCategory('')
        setCustomCategoryInput('')
        setIsAddingCustomCategory(false)
        setIsOpen(false)
        setSuccessMessage(`"${res.data?.title || 'Resource'}" has been added to your library!`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 4000)
      }
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden mb-8 transition-all">
      <form onSubmit={handleSubmit} className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add Website Resource</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Save documentation, online courses, cheat sheets, or articles for quick reference.
              </p>
            </div>
          </div>

          {!isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="self-start sm:self-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              + Add Resource
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="resource-title" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="resource-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder="e.g., MDN Web Docs - JavaScript Guide"
                disabled={isPending}
                className="w-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3.5 py-2 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="resource-url" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                id="resource-url"
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder="https://developer.mozilla.org/..."
                disabled={isPending}
                className="w-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3.5 py-2 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {(isOpen || title.length > 0 || url.length > 0) && (
            <div className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label htmlFor="resource-description" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="resource-description"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes, key topics, or what this resource is useful for..."
                    disabled={isPending}
                    className="w-full text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all resize-y disabled:opacity-60"
                  />
                </div>

                <div>
                  <label htmlFor="resource-category" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                  </label>
                  {isAddingCustomCategory ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Custom category..."
                        disabled={isPending}
                        className="w-full text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomCategory(false)
                          setCustomCategoryInput('')
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-2 cursor-pointer"
                        title="Cancel custom category"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      id="resource-category"
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsAddingCustomCategory(true)
                          setCategory('')
                        } else {
                          setCategory(e.target.value)
                        }
                      }}
                      disabled={isPending}
                      className="w-full text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all disabled:opacity-60"
                    >
                      <option value="">No Category</option>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom Category...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('')
                    setUrl('')
                    setDescription('')
                    setCategory('')
                    setCustomCategoryInput('')
                    setIsAddingCustomCategory(false)
                    setError(null)
                    setIsOpen(false)
                  }}
                  disabled={isPending}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !title.trim() || !url.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Save Resource</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
