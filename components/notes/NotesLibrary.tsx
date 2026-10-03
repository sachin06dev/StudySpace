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

type FilterCategory = 'all' | 'video' | 'playlist' | 'recent'

export default function NotesLibrary({ initialNotes }: NotesLibraryProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [selectedVideoId, setSelectedVideoId] = useState<string>('all')
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Distinct subjects for filtering
  const distinctSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>()
    for (const n of notes) {
      if (n.matchedSubjects && n.matchedSubjects.length > 0) {
        for (const s of n.matchedSubjects) {
          const prev = map.get(s.id)
          map.set(s.id, {
            id: s.id,
            name: s.code ? `${s.name} (${s.code})` : s.name,
            count: (prev?.count || 0) + 1,
          })
        }
      }
    }
    return Array.from(map.values())
  }, [notes])

  // Distinct videos for filtering
  const distinctVideos = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>()
    for (const n of notes) {
      if (n.savedVideoId && n.video?.title) {
        map.set(n.savedVideoId, { id: n.savedVideoId, title: n.video.title })
      }
    }
    return Array.from(map.values())
  }, [notes])

  // Distinct playlists for filtering
  const distinctPlaylists = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>()
    for (const n of notes) {
      if (n.playlists && n.playlists.length > 0) {
        for (const pl of n.playlists) {
          const prev = map.get(pl.id)
          map.set(pl.id, {
            id: pl.id,
            title: pl.title,
            count: (prev?.count || 0) + 1,
          })
        }
      }
    }
    return Array.from(map.values())
  }, [notes])

  // 7 days ago timestamp threshold stored in state to keep renders pure
  const [sevenDaysAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Counts for tabs
  const counts = useMemo(() => {
    const standaloneCount = notes.filter((n) => !n.playlists || n.playlists.length === 0).length
    const playlistCount = notes.filter((n) => n.playlists && n.playlists.length > 0).length
    const recentCount = notes.filter((n) => new Date(n.created_at).getTime() >= sevenDaysAgo).length
    return {
      all: notes.length,
      video: standaloneCount,
      playlist: playlistCount,
      recent: recentCount,
    }
  }, [notes, sevenDaysAgo])

  const isFiltered =
    filterCategory !== 'all' ||
    selectedVideoId !== 'all' ||
    selectedPlaylistId !== 'all' ||
    selectedSubjectId !== 'all' ||
    searchQuery.trim().length > 0

  const handleClearFilters = () => {
    setFilterCategory('all')
    setSelectedVideoId('all')
    setSelectedPlaylistId('all')
    setSelectedSubjectId('all')
    setSearchQuery('')
  }

  const filteredNotes = useMemo(() => {
    let result = notes

    // 1. Filter by category
    if (filterCategory === 'video') {
      result = result.filter((n) => !n.playlists || n.playlists.length === 0)
    } else if (filterCategory === 'playlist') {
      result = result.filter((n) => n.playlists && n.playlists.length > 0)
    } else if (filterCategory === 'recent') {
      result = result.filter((n) => new Date(n.created_at).getTime() >= sevenDaysAgo)
    }

    // 2. Filter by specific subject
    if (selectedSubjectId !== 'all') {
      result = result.filter((n) => n.matchedSubjects?.some((s) => s.id === selectedSubjectId))
    }

    // 3. Filter by specific playlist
    if (selectedPlaylistId !== 'all') {
      result = result.filter((n) => n.playlists?.some((p) => p.id === selectedPlaylistId))
    }

    // 4. Filter by specific video
    if (selectedVideoId !== 'all') {
      result = result.filter((n) => n.savedVideoId === selectedVideoId)
    }

    // 5. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((n) => {
        const matchContent = n.content.toLowerCase().includes(q)
        const matchVideoTitle = n.video?.title.toLowerCase().includes(q) || false
        const matchChannel = n.video?.channel_name?.toLowerCase().includes(q) || false
        const matchPlaylist = n.playlists?.some((p) => p.title.toLowerCase().includes(q)) || false
        const matchSubject = n.matchedSubjects?.some((s) => s.name.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)) || false
        return matchContent || matchVideoTitle || matchChannel || matchPlaylist || matchSubject
      })
    }

    return result
  }, [notes, filterCategory, selectedSubjectId, selectedPlaylistId, selectedVideoId, searchQuery, sevenDaysAgo])

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
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, content: trimmed, updated_at: new Date().toISOString() } : n
      )
    )
    setEditingId(null)
    setEditContent('')
    setError(null)

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

    // Optimistic immediate removal
    setNotes((prev) => prev.filter((n) => n.id !== id))

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
          <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        }
        title="No timestamped notes yet"
        description="Take instant timestamped notes while watching video lectures to build your searchable knowledge vault."
        action={
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-4 py-2 rounded-xl shadow-xs transition-colors"
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
      {/* Category Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setFilterCategory('all')
                setSelectedPlaylistId('all')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Notes ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterCategory('video')
                setSelectedPlaylistId('all')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'video'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Standalone Videos ({counts.video})
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('playlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'playlist'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Course Playlists ({counts.playlist})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterCategory('recent')
                setSelectedPlaylistId('all')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'recent'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Recent 7 Days ({counts.recent})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or notes..."
              className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl pl-8 pr-7 py-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all"
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
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs p-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters: Subjects, Playlists & Videos Dropdowns + Clear Filter Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter Dropdown */}
            {distinctSubjects.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="subject-filter" className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  Subject:
                </label>
                <select
                  id="subject-filter"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="text-xs bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 focus:border-[var(--accent)] focus:outline-none max-w-xs truncate"
                >
                  <option value="all">All Subjects ({notes.length})</option>
                  {distinctSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Playlist Filter Dropdown (shown when playlist tab is active or whenever playlists exist) */}
            {distinctPlaylists.length > 0 && (filterCategory === 'playlist' || filterCategory === 'all') && (
              <div className="flex items-center gap-2">
                <label htmlFor="playlist-filter" className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  Course:
                </label>
                <select
                  id="playlist-filter"
                  value={selectedPlaylistId}
                  onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  className="text-xs bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 focus:border-[var(--accent)] focus:outline-none max-w-xs truncate"
                >
                  <option value="all">All Courses ({counts.playlist})</option>
                  {distinctPlaylists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Video Filter Dropdown */}
            {distinctVideos.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="video-filter" className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  Video:
                </label>
                <select
                  id="video-filter"
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="text-xs bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 focus:border-[var(--accent)] focus:outline-none max-w-xs truncate"
                >
                  <option value="all">All Videos ({notes.length})</option>
                  {distinctVideos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-white bg-[var(--accent-subtle)] hover:bg-[var(--accent)] border border-[var(--accent)]/30 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <span>Clear filters</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="text-xs text-[var(--text-muted)] ml-auto">
            Showing {filteredNotes.length} of {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex justify-between items-center">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[var(--danger)] hover:opacity-80 font-semibold cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            No notes matching your search or filters.
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Try adjusting your search terms or active filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isEditing = editingId === note.id
            const primaryPlaylist = note.playlists && note.playlists.length > 0 ? note.playlists[0] : null
            const seekHref = note.savedVideoId
              ? primaryPlaylist
                ? `/videos/${note.savedVideoId}?t=${note.timestamp_seconds}&fromPlaylist=${primaryPlaylist.id}`
                : `/videos/${note.savedVideoId}?t=${note.timestamp_seconds}`
              : '/videos'

            const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={note.id}
                className="group bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 shadow-xs transition-all flex flex-col justify-between overflow-hidden p-4"
              >
                <div>
                  {/* Playlist badge if part of a course */}
                  {primaryPlaylist && (
                    <div className="mb-2.5">
                      <Link
                        href={`/playlists/${primaryPlaylist.id}`}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors truncate max-w-full"
                        title={primaryPlaylist.title}
                      >
                        <svg className="w-3 h-3 text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="truncate">{primaryPlaylist.title}</span>
                      </Link>
                    </div>
                  )}

                  {/* Top Row: Video info & timestamp seek pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {note.video?.thumbnail_url ? (
                        <Image
                          src={note.video.thumbnail_url}
                          alt=""
                          width={48}
                          height={32}
                          className="w-12 h-8 rounded-lg object-cover bg-black/40 shrink-0 border border-[var(--border-subtle)]"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] text-[var(--text-muted)] shrink-0">
                          Video
                        </div>
                      )}

                      <div className="min-w-0">
                        <Link
                          href={seekHref}
                          className="block text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] truncate leading-tight transition-colors"
                          title={note.video?.title || 'Watch Video'}
                        >
                          {note.video?.title || 'Study Video'}
                        </Link>
                        {note.video?.channel_name && (
                          <span className="block text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                            {note.video.channel_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp seek button */}
                    <Link
                      href={seekHref}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] border border-[var(--accent)]/20 font-mono text-xs font-semibold shrink-0 transition-colors cursor-pointer group/seek"
                      title={`Jump to ${formatDuration(note.timestamp_seconds)} in video`}
                    >
                      <svg className="w-3 h-3 fill-current group-hover/seek:fill-white" viewBox="0 0 24 24">
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
                        className="w-full text-xs text-[var(--text-primary)] bg-[var(--surface-raised)] rounded-xl p-2.5 border border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        disabled={isPending}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={isPending}
                          className="px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(note.id)}
                          disabled={isPending || !editContent.trim()}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed bg-[var(--surface-raised)] p-3 rounded-xl border border-[var(--border-subtle)]">
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Footer: Date & Actions */}
                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Saved on {formattedDate}</span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(note)}
                      disabled={isPending}
                      aria-label="Edit note"
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-lg transition-colors cursor-pointer"
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
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] rounded-lg transition-colors cursor-pointer"
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
