'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { formatDuration } from '@/lib/youtube/client'
import type { VideoTimestampNote } from '@/lib/data/timestampNotes'

interface TimestampNotesListProps {
  notes: VideoTimestampNote[]
  onSeek: (seconds: number) => void
  onUpdateNote: (id: string, content: string) => Promise<boolean>
  onDeleteNote: (id: string) => Promise<boolean>
  currentSeconds?: number
}

export default function TimestampNotesList({
  notes,
  onSeek,
  onUpdateNote,
  onDeleteNote,
  currentSeconds,
}: TimestampNotesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editingId && editTextareaRef.current) {
      editTextareaRef.current.focus()
      // Move cursor to end of text
      const len = editTextareaRef.current.value.length
      editTextareaRef.current.setSelectionRange(len, len)
    }
  }, [editingId])

  const handleStartEdit = (note: VideoTimestampNote) => {
    setEditingId(note.id)
    setEditContent(note.content)
    setEditError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
    setEditError(null)
  }

  const handleSaveEdit = async (id: string) => {
    const trimmed = editContent.trim()
    if (!trimmed) {
      setEditError('Note content cannot be empty.')
      return
    }

    setEditError(null)
    startTransition(async () => {
      const success = await onUpdateNote(id, trimmed)
      if (success) {
        setEditingId(null)
        setEditContent('')
      } else {
        setEditError('Failed to update note.')
      }
    })
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      await onDeleteNote(id)
      setDeletingId(null)
    })
  }

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    id: string
  ) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault()
      e.stopPropagation()
      handleCancelEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleCancelEdit()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleSaveEdit(id)
    }
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">No notes yet</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
          Add your first note while watching to pin key concepts and moments to exact timestamps.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
      {notes.map((note) => {
        const isEditing = editingId === note.id
        const isDeleting = deletingId === note.id
        const isCurrentlyNear =
          currentSeconds !== undefined &&
          Math.abs(currentSeconds - note.timestamp_seconds) <= 3

        return (
          <div
            key={note.id}
            className={`group relative rounded-xl border p-3 transition-all ${
              isCurrentlyNear
                ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-2xs'
            }`}
          >
            {isEditing ? (
              /* Inline Edit Mode */
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-semibold">
                    <svg
                      className="w-3 h-3 text-indigo-600 dark:text-indigo-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{formatDuration(note.timestamp_seconds)}</span>
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">Editing note</span>
                </div>

                <textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, note.id)}
                  rows={2}
                  disabled={isPending}
                  className="w-full text-xs text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />

                {editError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/40 p-1 rounded border border-red-100 dark:border-red-900">
                    {editError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Ctrl+Enter to save • Ctrl+Z to cancel</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={isPending || !editContent.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                    >
                      {isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  {/* Timestamp seek button */}
                  <button
                    type="button"
                    onClick={() => onSeek(note.timestamp_seconds)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 border border-indigo-200/70 dark:border-indigo-800 font-mono text-xs font-semibold transition-colors group/btn cursor-pointer"
                    title={`Jump to ${formatDuration(note.timestamp_seconds)}`}
                  >
                    <svg
                      className="w-3 h-3 text-indigo-500 group-hover/btn:text-indigo-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{formatDuration(note.timestamp_seconds)}</span>
                  </button>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(note)}
                      disabled={isDeleting}
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                      title="Edit note"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      disabled={isDeleting}
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      {isDeleting ? (
                        <span className="w-3.5 h-3.5 border border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                  {note.content}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
