'use client'

import React, { useState } from 'react'
import { ALL_PREVIEW_NOTES, type PreviewTimestampNote, type PreviewSection } from './previewDemoData'

interface NotesPreviewProps {
  onNavigate: (section: PreviewSection) => void
  onSelectTimestamp?: (timestampSecs: number) => void
}

export default function NotesPreview({ onNavigate, onSelectTimestamp }: NotesPreviewProps) {
  const [notes, setNotes] = useState<PreviewTimestampNote[]>(ALL_PREVIEW_NOTES)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<string>('')

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase()
    return (
      n.content.toLowerCase().includes(q) ||
      n.videoTitle.toLowerCase().includes(q) ||
      n.channelName.toLowerCase().includes(q)
    )
  })

  const startEdit = (note: PreviewTimestampNote) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content: editContent.trim() } : n))
    )
    setEditingId(null)
  }

  const handleJumpToVideo = (timestampSecs: number) => {
    onSelectTimestamp?.(timestampSecs)
    onNavigate('videos')
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            Timestamped Lecture Notes
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Study notes linked to exact seconds in YouTube video lectures.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-52 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or lecture..."
            className="w-full bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-xs border border-gray-200/80 dark:border-gray-700/80 rounded-xl pl-7 pr-3 py-1.5 focus:outline-hidden focus:border-indigo-500"
          />
          <span className="absolute left-2.5 top-1.5 text-gray-400 text-[10px]">🔍</span>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[280px] overflow-y-auto pr-1">
        {filteredNotes.map((note) => {
          const isEditing = editingId === note.id
          return (
            <div
              key={note.id}
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs transition-all flex flex-col justify-between min-w-0"
            >
              <div>
                {/* Top Row: Video info + Jump button */}
                <div className="flex items-start justify-between gap-1.5 mb-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[11px] sm:text-xs truncate leading-snug">
                      {note.videoTitle}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{note.channelName}</p>
                  </div>

                  {/* Timestamp Jump Pill */}
                  <button
                    type="button"
                    onClick={() => handleJumpToVideo(note.timestampSecs)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] sm:text-[10px] font-bold border border-indigo-200/80 dark:border-indigo-800/80 shrink-0 transition-colors cursor-pointer"
                    title={`Jump to video at ${note.timestampLabel}`}
                  >
                    <span>▶</span>
                    <span>{note.timestampLabel}</span>
                  </button>
                </div>

                {/* Note Content / Inline Edit */}
                {isEditing ? (
                  <div className="space-y-1.5 mt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg border border-indigo-300 dark:border-indigo-700 focus:outline-hidden"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-0.5 text-[9px] text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(note.id)}
                        className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md font-semibold text-[9px]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] sm:text-[11px] text-gray-700 dark:text-gray-300 bg-gray-50/60 dark:bg-gray-900/40 p-2 sm:p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed line-clamp-3">
                    {note.content}
                  </p>
                )}
              </div>

              {/* Bottom Footer: Date & Actions */}
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400">
                <span>{note.createdAt}</span>

                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(note)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleJumpToVideo(note.timestampSecs)}
                    className="text-gray-600 dark:text-gray-300 font-semibold hover:text-indigo-600 cursor-pointer"
                  >
                    Open →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
