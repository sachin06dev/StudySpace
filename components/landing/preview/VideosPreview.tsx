'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PREVIEW_TIMESTAMP_NOTES, type PreviewTimestampNote } from './previewDemoData'

interface VideosPreviewProps {
  initialTimestampSecs?: number
}

const TOTAL_DURATION_SECS = 32 * 60 + 10 // 32:10 = 1930s

export default function VideosPreview({ initialTimestampSecs }: VideosPreviewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentSeconds, setCurrentSeconds] = useState<number>(initialTimestampSecs ?? 18 * 60 + 42) // 18:42
  const [prevInitialTimestamp, setPrevInitialTimestamp] = useState<number | undefined>(initialTimestampSecs)
  const [notes, setNotes] = useState<PreviewTimestampNote[]>(PREVIEW_TIMESTAMP_NOTES)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [hudFeedback, setHudFeedback] = useState<{ emoji: string; text: string } | null>(null)
  const [newNoteContent, setNewNoteContent] = useState<string>('')
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Adjust state if initialTimestampSecs prop changed
  if (initialTimestampSecs !== undefined && initialTimestampSecs !== prevInitialTimestamp) {
    setPrevInitialTimestamp(initialTimestampSecs)
    setCurrentSeconds(initialTimestampSecs)
  }

  // Simulated Playback Timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= TOTAL_DURATION_SECS) {
            setIsPlaying(false)
            return TOTAL_DURATION_SECS
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSeekTo = (timestampSecs: number, noteId?: string) => {
    setCurrentSeconds(timestampSecs)
    if (noteId) setSelectedNoteId(noteId)
    showFeedback('📍', `Jumped to ${formatDuration(timestampSecs)}`)
  }

  const showFeedback = (emoji: string, text: string) => {
    setHudFeedback({ emoji, text })
    setTimeout(() => {
      setHudFeedback(null)
    }, 2000)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return
    const newNote: PreviewTimestampNote = {
      id: `note-${Date.now()}`,
      timestampSecs: currentSeconds,
      timestampLabel: formatDuration(currentSeconds),
      content: newNoteContent.trim(),
      videoTitle: 'Data Structures & Algorithms — Lecture 14',
      channelName: 'CS Algorithms Hub',
      createdAt: 'Just now',
    }
    setNotes((prev) => [...prev, newNote].sort((a, b) => a.timestampSecs - b.timestampSecs))
    setNewNoteContent('')
    setIsAddingNote(false)
    showFeedback('📝', `Note added at ${formatDuration(currentSeconds)}`)
  }

  const progressPercent = Math.min(100, Math.round((currentSeconds / TOTAL_DURATION_SECS) * 100))

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Video Details Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="truncate">Data Structures &amp; Algorithms</span>
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono shrink-0">
              Lecture 14
            </span>
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            CS Algorithms Hub • Graph Traversals (DFS &amp; BFS Recursion)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold text-[9px] sm:text-[10px] border border-red-200 dark:border-red-800">
            Distraction Free
          </span>
        </div>
      </div>

      {/* Main Grid: Player on Left, Timestamp Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start">
        {/* Left Column: Simulated Player (7 cols on lg+) */}
        <div className="lg:col-span-7 space-y-2.5 min-w-0">
          <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border border-indigo-900/50 flex flex-col justify-between p-2.5 sm:p-3 overflow-hidden shadow-md">
            {/* Top Bar inside Player */}
            <div className="flex items-center justify-between z-10 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] sm:text-[9px] font-mono text-gray-200 border border-white/10">
                  HD 1080p
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] sm:text-[9px] font-mono text-gray-200 border border-white/10">
                  1.0x
                </span>
              </div>
              <span className="px-1.5 sm:px-2 py-0.5 rounded bg-red-600 text-[8px] sm:text-[9px] font-semibold text-white">
                Focused Mode
              </span>
            </div>

            {/* Center Play/Pause & Feedback Overlay */}
            <div className="relative flex flex-col items-center justify-center my-auto z-10">
              {hudFeedback ? (
                <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 animate-in fade-in-50 zoom-in-95">
                  <span>{hudFeedback.emoji}</span>
                  <span className="font-semibold text-[10px] sm:text-[11px]">{hudFeedback.text}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-indigo-600 backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-xl cursor-pointer"
                  title={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Bottom Player Controls */}
            <div className="space-y-1.5 z-10">
              {/* Interactive Progress Bar */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickPos = (e.clientX - rect.left) / rect.width
                  const targetSecs = Math.floor(clickPos * TOTAL_DURATION_SECS)
                  handleSeekTo(targetSecs)
                }}
                className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all relative group"
              >
                <div
                  className="h-full bg-indigo-500 group-hover:bg-indigo-400 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-gray-300 font-mono">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:text-white font-semibold cursor-pointer"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <span>
                    {formatDuration(currentSeconds)} / {formatDuration(TOTAL_DURATION_SECS)}
                  </span>
                </div>
                <span>{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Quick Player Action Bar */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSeekTo(Math.max(0, currentSeconds - 10))}
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-[9px] sm:text-[10px] font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                title="Rewind 10s"
              >
                -10s
              </button>
              <button
                type="button"
                onClick={() => handleSeekTo(Math.min(TOTAL_DURATION_SECS, currentSeconds + 10))}
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-[9px] sm:text-[10px] font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                title="Forward 10s"
              >
                +10s
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNote(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[9px] sm:text-[10px] shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <span>+ Note at {formatDuration(currentSeconds)}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Timestamped Notes Panel (5 cols on lg+) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-3 sm:p-3.5 space-y-2.5 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 gap-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-[10px] sm:text-xs truncate">
                  Timestamp Notes
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold shrink-0">
                  {notes.length}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
                Click to seek
              </span>
            </div>

            {/* Note Composer Modal / Inline Field */}
            {isAddingNote && (
              <form onSubmit={handleAddNote} className="my-2 p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-1.5 animate-in fade-in-50">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                    Note at {formatDuration(currentSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Type note concept..."
                  rows={2}
                  className="w-full p-1.5 text-[10px] sm:text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg border border-indigo-200 dark:border-indigo-700 focus:outline-hidden"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-2 py-0.5 text-[9px] text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md font-semibold text-[9px] disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List using Grid rows: auto minmax(0, 1fr) */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 mt-2">
              {notes.map((note) => {
                const isSelected = selectedNoteId === note.id
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleSeekTo(note.timestampSecs, note.id)}
                    className={`w-full p-2 rounded-xl text-left border transition-all cursor-pointer min-w-0 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400'
                        : 'bg-gray-50/70 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 mb-0.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold text-[8px] sm:text-[9px] shrink-0">
                        {note.timestampLabel}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-gray-400 truncate">
                        {note.createdAt}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 mt-0.5">
                      {note.content}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[9px] sm:text-[10px] text-gray-400 flex items-center justify-between">
            <span>Video Sync Active</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Synced</span>
          </div>
        </div>
      </div>
    </div>
  )
}
