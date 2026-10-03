'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { markVideoCompleted } from '@/lib/actions/videos'
import { formatDuration } from '@/lib/youtube/client'
import type { PlaylistWithItems } from '@/lib/data/playlists'
import type { VideoStatus } from '@/lib/data/videos'

export interface PlaylistNoteItem {
  id: string
  user_id: string
  video_id: string
  timestamp_seconds: number
  content: string
  created_at: string
  updated_at: string
  video: {
    id: string
    youtube_video_id: string
    title: string
    channel_name: string | null
    thumbnail_url: string | null
    duration_seconds: number | null
  } | null
  savedVideoId?: string | null
}

interface PlaylistDetailViewProps {
  playlistData: PlaylistWithItems
  playlistId: string
  playlistNotes?: PlaylistNoteItem[]
}

export default function PlaylistDetailView({
  playlistData,
  playlistId,
  playlistNotes = [],
}: PlaylistDetailViewProps) {
  const [prevData, setPrevData] = useState(playlistData)
  const [data, setData] = useState<PlaylistWithItems>(playlistData)
  const [activeTab, setActiveTab] = useState<'curriculum' | 'notes'>('curriculum')
  const [noteQuery, setNoteQuery] = useState('')
  const [selectedLesson, setSelectedLesson] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  if (prevData !== playlistData) {
    setPrevData(playlistData)
    setData(playlistData)
  }

  const { playlist, items, video_count, saved_at } = data

  const completedCount = items.filter(
    (item) => item.savedVideo.status === 'completed'
  ).length

  const percentComplete = video_count > 0 ? Math.round((completedCount / video_count) * 100) : 0

  // Find next video to watch (first non-completed video or first video)
  const nextItem = items.find((item) => item.savedVideo.status !== 'completed') || items[0]
  const resumeHref = nextItem
    ? `/videos/${nextItem.savedVideo.id}?fromPlaylist=${encodeURIComponent(playlistId)}`
    : null

  // Optimistic Toggle Watched inside Playlist
  const handleToggleWatched = async (savedVideoId: string, willBeCompleted: boolean) => {
    setError(null)
    const prev = data
    const targetStatus: VideoStatus = willBeCompleted ? 'completed' : 'in_progress'

    // 1. Optimistic update
    setData((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.savedVideo.id !== savedVideoId) return item
        return {
          ...item,
          savedVideo: {
            ...item.savedVideo,
            status: targetStatus,
            completed_at: willBeCompleted ? new Date().toISOString() : null,
          },
        }
      }),
    }))

    // 2. Server mutation in background
    try {
      const res = await markVideoCompleted(savedVideoId, willBeCompleted)
      if (!res.success) {
        setData(prev)
        setError(res.error || 'Failed to update watch status.')
      }
    } catch {
      setData(prev)
      setError('Network error while updating watch status.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger-border)] text-xs text-[var(--danger)] flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[var(--danger)] hover:opacity-80 font-semibold cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Playlist Hero Header */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
        {/* Playlist Thumbnail */}
        <div className="relative aspect-video w-full md:w-80 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-[var(--border-subtle)]">
          {playlist.thumbnail_url ? (
            <Image
              src={playlist.thumbnail_url}
              alt={playlist.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
              priority={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
              No Thumbnail
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="bg-black/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md font-semibold tracking-wide border border-white/10">
              {video_count} {video_count === 1 ? 'lesson' : 'lessons'}
            </span>
            {completedCount > 0 && (
              <span className="bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success-border)] px-2 py-0.5 rounded-md font-medium text-[11px]">
                {completedCount}/{video_count} done
              </span>
            )}
          </div>
        </div>

        {/* Playlist Metadata Info */}
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Course Playlist
              </span>

              {saved_at && (
                <span className="text-xs text-[var(--text-muted)]">
                  Saved {new Date(saved_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug">
              {playlist.title}
            </h1>

            {playlist.channel_name && (
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{playlist.channel_name}</span>
              </p>
            )}

            {playlist.description && (
              <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-2 leading-relaxed whitespace-pre-line">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Progress & Actions Section */}
          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 max-w-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Course progress</span>
                <span className="font-semibold text-[var(--text-primary)]">{percentComplete}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth-out)]"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {completedCount} of {video_count} lessons completed
              </div>
            </div>

            {resumeHref && (
              <Link
                href={resumeHref}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>
                  {completedCount === 0
                    ? 'Start Course'
                    : completedCount === video_count
                    ? 'Rewatch Course'
                    : 'Resume Next Lesson'}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Curriculum vs Course Notes */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'curriculum'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)]'
            }`}
          >
            <span>Videos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'curriculum' ? 'bg-white/20 text-white' : 'bg-[var(--surface-raised)] text-[var(--text-muted)]'
              }`}
            >
              {video_count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)]'
            }`}
          >
            <span>Course Notes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'notes' ? 'bg-white/20 text-white' : 'bg-[var(--surface-raised)] text-[var(--text-muted)]'
              }`}
            >
              {playlistNotes.length}
            </span>
          </button>
        </div>

        {activeTab === 'curriculum' && (
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline-block">
            {video_count} lessons in sequence
          </span>
        )}
      </div>

      {/* TAB 1: Curriculum List */}
      {activeTab === 'curriculum' && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center text-xs text-[var(--text-muted)]">
              This playlist contains no available videos.
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)]">
              {items.map((item, idx) => {
                const video = item.savedVideo.video
                const isCompleted = item.savedVideo.status === 'completed'
                const durationText = formatDuration(video.duration_seconds || 0)
                const watchProgress = item.savedVideo.watch_progress_seconds || 0
                const progressPercent =
                  isCompleted
                    ? 100
                    : (video.duration_seconds || 0) > 0 && watchProgress > 0
                    ? Math.min(100, Math.round((watchProgress / (video.duration_seconds || 1)) * 100))
                    : 0

                const videoHref = `/videos/${item.savedVideo.id}?fromPlaylist=${encodeURIComponent(playlistId)}`

                return (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors hover:bg-[var(--surface-hover)] ${
                      isCompleted ? 'opacity-85' : ''
                    }`}
                  >
                    {/* Sequence Position */}
                    <span className="w-6 text-center text-xs font-mono font-semibold text-[var(--text-muted)] shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Thumbnail with duration */}
                    <Link
                      href={videoHref}
                      className="relative w-24 sm:w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-black/40 border border-[var(--border-subtle)] group-hover:border-[var(--accent)]/50 transition-colors"
                    >
                      {video.thumbnail_url ? (
                        <Image
                          src={video.thumbnail_url}
                          alt={video.title}
                          fill
                          sizes="(max-width: 640px) 96px, 128px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)]">
                          Preview
                        </div>
                      )}
                      {/* Hover play icon */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-white/90 text-black flex items-center justify-center pl-0.5 shadow-sm">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {/* Duration badge */}
                      {durationText && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 py-0.2 rounded font-medium">
                          {durationText}
                        </span>
                      )}
                      {/* Tiny Progress bar on thumbnail */}
                      {progressPercent > 0 && !isCompleted && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                          <div
                            className="h-full bg-[var(--accent)]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}
                    </Link>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={videoHref}
                        className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug"
                      >
                        {video.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)]">
                        {item.id === nextItem?.id && completedCount < video_count && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30">
                            Up Next
                          </span>
                        )}
                        {video.channel_name && <span>{video.channel_name}</span>}
                        {progressPercent > 0 && !isCompleted && (
                          <span className="text-[var(--warning)] font-medium">
                            {progressPercent}% watched
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[var(--success)] font-medium inline-flex items-center gap-1">
                            <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Mark watched check button */}
                      <button
                        type="button"
                        onClick={() => handleToggleWatched(item.savedVideo.id, !isCompleted)}
                        title={isCompleted ? 'Mark as unwatched' : 'Mark as completed'}
                        className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-[var(--success-muted)] text-[var(--success)] border-[var(--success-border)] hover:bg-[var(--surface-raised)]'
                            : 'bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>

                      {/* Direct Watch Link */}
                      <Link
                        href={videoHref}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                      >
                        <span>Watch</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Playlist Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Controls: Search notes & filter by lesson */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={noteQuery}
                onChange={(e) => setNoteQuery(e.target.value)}
                placeholder="Search notes in this course..."
                className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl pl-8 pr-7 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-all"
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
              {noteQuery && (
                <button
                  type="button"
                  onClick={() => setNoteQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {items.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="lesson-note-filter" className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  Lesson:
                </label>
                <select
                  id="lesson-note-filter"
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="text-xs bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 focus:border-[var(--accent)] focus:outline-none max-w-xs truncate"
                >
                  <option value="all">All Lessons ({playlistNotes.length})</option>
                  {items.map((item, i) => (
                    <option key={item.video_id} value={item.video_id}>
                      {String(i + 1).padStart(2, '0')}. {item.video.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Notes Content List */}
          {(() => {
            const filtered = playlistNotes.filter((note) => {
              if (selectedLesson !== 'all' && note.video_id !== selectedLesson) {
                return false
              }
              if (noteQuery.trim()) {
                const q = noteQuery.toLowerCase().trim()
                const matchContent = note.content.toLowerCase().includes(q)
                const matchTitle = note.video?.title?.toLowerCase().includes(q) || false
                return matchContent || matchTitle
              }
              return true
            })

            if (filtered.length === 0) {
              return (
                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {noteQuery.trim()
                      ? `No notes match "${noteQuery}"`
                      : playlistNotes.length === 0
                      ? 'No notes taken in this course yet.'
                      : 'No notes for this selected lesson.'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {playlistNotes.length === 0
                      ? 'Press "n" while watching any lesson video to capture timestamped concepts and formulas.'
                      : 'Try resetting your filter to view all course notes.'}
                  </p>
                  {resumeHref && playlistNotes.length === 0 && (
                    <Link
                      href={resumeHref}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline mt-2 cursor-pointer"
                    >
                      <span>Start watching & taking notes</span>
                      <span>›</span>
                    </Link>
                  )}
                </div>
              )
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filtered.map((note) => {
                  const timeFormatted = formatDuration(note.timestamp_seconds)
                  const jumpHref = note.savedVideoId
                    ? `/videos/${note.savedVideoId}?t=${note.timestamp_seconds}&fromPlaylist=${encodeURIComponent(playlistId)}`
                    : `/playlists/${playlistId}`

                  return (
                    <div
                      key={note.id}
                      className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xs hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Header: Lesson Title + Timestamp Jump Link */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--text-secondary)] line-clamp-1">
                            {note.video?.title || 'Course Lesson'}
                          </span>
                          <Link
                            href={jumpHref}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--accent-muted)] text-[var(--accent)] text-[11px] font-mono font-bold hover:bg-[var(--accent)] hover:text-white transition-colors shrink-0"
                            title={`Jump to ${timeFormatted}`}
                          >
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>{timeFormatted}</span>
                          </Link>
                        </div>

                        {/* Note Text */}
                        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>

                      {/* Footer: Date & Jump Action */}
                      <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <Link
                          href={jumpHref}
                          className="font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Jump to lecture</span>
                          <span>›</span>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
