'use client'

import { useState, useTransition, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { createNoteAction } from '@/lib/actions/timestampNotes'
import { formatDuration } from '@/lib/youtube/client'
import type { VideoTimestampNote } from '@/lib/data/timestampNotes'

export interface AddNoteButtonRef {
  openForm: (explicitTimestamp?: number) => void
  closeForm: () => void
  isOpen: () => boolean
}

export interface AddNoteButtonProps {
  videoId: string
  getCurrentTime: () => number
  onNoteCreated: (note: VideoTimestampNote) => void
}

function AddNoteButtonComponent(
  {
    videoId,
    getCurrentTime,
    onNoteCreated,
  }: AddNoteButtonProps,
  ref: React.Ref<AddNoteButtonRef>
) {
  const [isOpen, setIsOpen] = useState(false)
  const [capturedSeconds, setCapturedSeconds] = useState(0)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleOpenForm = useCallback((explicitTimestamp?: number) => {
    const rawTime = typeof explicitTimestamp === 'number' ? explicitTimestamp : getCurrentTime()
    const safeTime = Math.max(0, Math.floor(rawTime || 0))
    setCapturedSeconds(safeTime)
    setContent('')
    setError(null)
    setIsOpen(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
  }, [getCurrentTime])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setContent('')
    setError(null)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      openForm: (explicitTimestamp?: number) => {
        handleOpenForm(explicitTimestamp)
      },
      closeForm: () => {
        handleCancel()
      },
      isOpen: () => isOpen,
    }),
    [handleOpenForm, handleCancel, isOpen]
  )

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed) {
      setError('Note content cannot be empty.')
      return
    }

    setError(null)

    startTransition(async () => {
      const res = await createNoteAction({
        videoId,
        timestampSeconds: capturedSeconds,
        content: trimmed,
      })

      if (res.success && res.data) {
        onNoteCreated(res.data)
        setIsOpen(false)
        setContent('')
      } else {
        setError(res.error || 'Failed to save note.')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault()
      e.stopPropagation()
      handleCancel()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleCancel()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleSubmit()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5 shadow-xs transition-all animate-fadeIn">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 dark:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-2xs">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatDuration(capturedSeconds)}</span>
          </span>
          <span className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">New Timestamp Note</span>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded cursor-pointer"
          title="Cancel Note (Ctrl+Z)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's happening at this moment? (Press Ctrl+Enter to save, Ctrl+Z to cancel)"
          rows={3}
          disabled={isPending}
          className="w-full text-xs text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 dark:placeholder-gray-500 resize-none shadow-2xs"
        />

        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/40 p-1.5 rounded border border-red-100 dark:border-red-900">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Ctrl+Enter to save • Ctrl+Z to cancel</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Note</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const AddNoteButton = forwardRef<AddNoteButtonRef, AddNoteButtonProps>(AddNoteButtonComponent)
export default AddNoteButton
