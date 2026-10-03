'use client'

import { useState, useMemo } from 'react'
import PlaylistCard from '@/components/playlists/PlaylistCard'
import EmptyState from '@/components/shared/EmptyState'
import { removePlaylist } from '@/lib/actions/playlists'
import type { SavedPlaylistWithDetails } from '@/lib/data/playlists'

interface PlaylistLibraryProps {
  initialPlaylists: SavedPlaylistWithDetails[]
}

export default function PlaylistLibrary({ initialPlaylists }: PlaylistLibraryProps) {
  const [prevPlaylists, setPrevPlaylists] = useState(initialPlaylists)
  const [playlists, setPlaylists] = useState<SavedPlaylistWithDetails[]>(initialPlaylists)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (prevPlaylists !== initialPlaylists) {
    setPrevPlaylists(initialPlaylists)
    setPlaylists(initialPlaylists)
  }

  // Optimistic Delete Handler
  const handleDeletePlaylist = async (savedPlaylistId: string) => {
    setError(null)
    const currentList = playlists

    // 1. Optimistic immediate removal
    setPlaylists((current) => current.filter((p) => p.id !== savedPlaylistId))

    // 2. Server mutation in background
    try {
      const res = await removePlaylist(savedPlaylistId)
      if (!res.success) {
        setPlaylists(currentList)
        setError(res.error || 'Failed to remove playlist.')
      }
    } catch {
      setPlaylists(currentList)
      setError('Network error while removing playlist.')
    }
  }

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists
    const q = searchQuery.toLowerCase().trim()
    return playlists.filter((p) => {
      const title = p.playlist.title.toLowerCase()
      const channel = p.playlist.channel_name?.toLowerCase() || ''
      return title.includes(q) || channel.includes(q)
    })
  }, [playlists, searchQuery])

  const totalPlaylists = playlists.length
  const totalVideos = playlists.reduce((acc, p) => acc + p.video_count, 0)

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

      {/* Control / Search Bar */}
      {totalPlaylists > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playlists or instructors..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[var(--text-muted)]">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
              {filteredPlaylists.length} {filteredPlaylists.length === 1 ? 'playlist' : 'playlists'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] font-medium text-[var(--text-muted)]">
              {totalVideos} videos
            </span>
          </div>
        </div>
      )}

      {/* Playlists Grid / Empty State */}
      {playlists.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          title="No playlists saved yet"
          description="Paste a YouTube playlist link above to import all videos into your structured study workspace."
          note="Supports standard playlist URLs and video URLs with &list=..."
        />
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          <p className="text-sm font-medium text-[var(--text-primary)]">No playlists matching &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search term or clear the filter.</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaylists.map((savedPlaylist, index) => (
            <PlaylistCard
              key={savedPlaylist.id}
              savedPlaylist={savedPlaylist}
              priority={index === 0}
              onDelete={handleDeletePlaylist}
            />
          ))}
        </div>
      )}
    </div>
  )
}
