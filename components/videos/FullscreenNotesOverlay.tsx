'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createNoteAction } from '@/lib/actions/timestampNotes'
import { formatDuration } from '@/lib/youtube/client'
import type { VideoTimestampNote } from '@/lib/data/timestampNotes'

export interface FullscreenNotesOverlayProps {
  isOpen: boolean
  capturedSeconds: number
  videoId: string
  notes: VideoTimestampNote[]
  onClose: () => void
  onNoteCreated: (note: VideoTimestampNote) => void
  onSeek: (seconds: number) => void
}

export default function FullscreenNotesOverlay({
  isOpen,
  capturedSeconds,
  videoId,
  notes,
  onClose,
  onNoteCreated,
  onSeek,
}: FullscreenNotesOverlayProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showNotesList, setShowNotesList] = useState(false)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCancel = () => {
    setContent('')
    setError(null)
    onClose()
  }

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
        handleCancel()
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

  return (
    <div
      className="absolute top-4 right-4 z-40 w-80 sm:w-96 max-h-[85vh] flex flex-col bg-gray-900/90 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden animate-scaleUp pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-semibold shadow-xs">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDuration(capturedSeconds)}</span>
          </span>
          <span className="text-xs font-bold text-gray-200">Take Note</span>
        </div>

        <div className="flex items-center gap-1">
          {notes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowNotesList((prev) => !prev)}
              className="px-2 py-0.5 text-[11px] font-medium text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
            >
              {showNotesList ? 'Hide Notes' : `Notes (${notes.length})`}
            </button>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Cancel Note (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Note Composer Body */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your study note here..."
            rows={3}
            disabled={isPending}
            className="w-full text-xs text-white bg-black/50 border border-white/20 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 resize-none shadow-inner"
          />

          {error && (
            <p className="text-[11px] text-red-400 font-medium bg-red-950/60 p-2 rounded-lg border border-red-800">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] text-gray-400">Ctrl+Enter to save • Ctrl+Z to cancel</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all cursor-pointer"
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

        {/* Existing Notes Drawer in Fullscreen */}
        {showNotesList && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <h4 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
              Saved Notes ({notes.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => onSeek(note.timestamp_seconds)}
                    className="shrink-0 font-mono text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900/80 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {formatDuration(note.timestamp_seconds)}
                  </button>
                  <p className="text-gray-200 text-[11px] leading-snug break-words flex-1">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
