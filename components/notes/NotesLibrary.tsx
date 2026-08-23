'use client'

import React, { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDuration } from '@/lib/youtube/client'
import { updateNoteAction, deleteNoteAction } from '@/lib/actions/timestampNotes'
import type { VideoTimestampNoteWithDetails } from '@/lib/data/timestampNotes'
import EmptyState from '@/components/shared/EmptyState'

interface NotesLibraryProps {
  initialNotes: VideoTimestampNoteWithDetails[]
}

export default function NotesLibrary({ initialNotes }: NotesLibraryProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter((n) => {
      const matchContent = n.content.toLowerCase().includes(q)
      const matchVideoTitle = n.video?.title.toLowerCase().includes(q) || false
      const matchChannel = n.video?.channel_name?.toLowerCase().includes(q) || false
      return matchContent || matchVideoTitle || matchChannel
    })
  }, [notes, searchQuery])

  const handleStartEdit = (note: VideoTimestampNoteWithDetails) => {
    setEditingId(note.id)
    setEditContent(note.content)
    setError(null)
  }

  const handleSaveEdit = (id: string) => {
    const trimmed = editContent.trim()
    if (!trimmed) {
      setError('Note content cannot be empty.')
      return
    }

    const prevNotes = notes
    // 1. Optimistic update
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, content: trimmed, updated_at: new Date().toISOString() } : n
      )
    )
    setEditingId(null)
    setEditContent('')
    setError(null)

    // 2. Server mutation in transition
    startTransition(async () => {
      try {
        const res = await updateNoteAction(id, trimmed)
        if (!res.success) {
          setNotes(prevNotes)
          setError(res.error || 'Failed to update note.')
        }
      } catch {
        setNotes(prevNotes)
        setError('Network error while updating note.')
      }
    })
  }

  const handleDelete = (id: string) => {
    setError(null)
    const prevNotes = notes

    // 1. Optimistic immediate removal
    setNotes((prev) => prev.filter((n) => n.id !== id))

    // 2. Server mutation in transition
    startTransition(async () => {
      try {
        const res = await deleteNoteAction(id)
        if (!res.success) {
          setNotes(prevNotes)
          setError(res.error || 'Failed to delete note.')
        }
      } catch {
        setNotes(prevNotes)
        setError('Network error while deleting note.')
      }
    })
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        }
        title="No study notes yet"
        description="Take timestamped notes while watching video lectures and tutorials to quickly review key concepts and jump to specific moments."
        action={
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            <span>Browse Study Videos</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Showing {filteredNotes.length} of {notes.length} notes
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or video titles..."
            className="w-full text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800 rounded-lg pl-8 pr-7 py-2 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
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
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex justify-between items-center">
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

      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No notes match your search query &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isEditing = editingId === note.id
            const watchHref = note.savedVideoId
              ? `/videos/${note.savedVideoId}`
              : '/videos'

            const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={note.id}
                className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden p-4"
              >
                <div>
                  {/* Top Row: Video info & timestamp seek pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {note.video?.thumbnail_url ? (
                        <Image
                          src={note.video.thumbnail_url}
                          alt=""
                          width={48}
                          height={32}
                          className="w-12 h-8 rounded-md object-cover bg-gray-900 shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                          Video
                        </div>
                      )}

                      <div className="min-w-0">
                        <Link
                          href={watchHref}
                          className="block text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate leading-tight transition-colors"
                          title={note.video?.title || 'Watch Video'}
                        >
                          {note.video?.title || 'Study Video'}
                        </Link>
                        {note.video?.channel_name && (
                          <span className="block text-[11px] text-gray-400 dark:text-gray-500 truncate">
                            {note.video.channel_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp seek button */}
                    <Link
                      href={watchHref}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono text-xs font-semibold shrink-0 transition-colors"
                      title={`Open video at ${formatDuration(note.timestamp_seconds)}`}
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>{formatDuration(note.timestamp_seconds)}</span>
                    </Link>
                  </div>

                  {/* Note content / Inline editor */}
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-indigo-300 dark:border-indigo-600 focus:bg-white dark:focus:bg-gray-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        disabled={isPending}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={isPending}
                          className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(note.id)}
                          disabled={isPending || !editContent.trim()}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed bg-gray-50/50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Footer: Date & Actions */}
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Saved on {formattedDate}</span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(note)}
                      disabled={isPending}
                      aria-label="Edit note"
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit note"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      disabled={isPending}
                      aria-label="Delete note"
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
