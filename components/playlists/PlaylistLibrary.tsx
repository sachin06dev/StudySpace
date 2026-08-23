'use client'

import { useState } from 'react'
import PlaylistCard from '@/components/playlists/PlaylistCard'
import StatsPill from '@/components/shared/StatsPill'
import EmptyState from '@/components/shared/EmptyState'
import { removePlaylist } from '@/lib/actions/playlists'
import type { SavedPlaylistWithDetails } from '@/lib/data/playlists'

interface PlaylistLibraryProps {
  initialPlaylists: SavedPlaylistWithDetails[]
}

export default function PlaylistLibrary({ initialPlaylists }: PlaylistLibraryProps) {
  const [prevPlaylists, setPrevPlaylists] = useState(initialPlaylists)
  const [playlists, setPlaylists] = useState<SavedPlaylistWithDetails[]>(initialPlaylists)
  const [error, setError] = useState<string | null>(null)

  if (prevPlaylists !== initialPlaylists) {
    setPrevPlaylists(initialPlaylists)
    setPlaylists(initialPlaylists)
  }

  // Optimistic Delete Handler
  const handleDeletePlaylist = async (savedPlaylistId: string) => {
    setError(null)
    const prevPlaylists = playlists

    // 1. Optimistic immediate removal
    setPlaylists((current) => current.filter((p) => p.id !== savedPlaylistId))

    // 2. Server mutation in background
    try {
      const res = await removePlaylist(savedPlaylistId)
      if (!res.success) {
        setPlaylists(prevPlaylists)
        setError(res.error || 'Failed to remove playlist.')
      }
    } catch {
      setPlaylists(prevPlaylists)
      setError('Network error while removing playlist.')
    }
  }

  const totalPlaylists = playlists.length
  const totalVideos = playlists.reduce((acc, p) => acc + p.video_count, 0)

  return (
    <div className="space-y-6">
      {/* Dynamic Stats Pill */}
      {totalPlaylists > 0 && (
        <div className="flex justify-end -mt-2">
          <StatsPill
            items={[
              {
                value: totalPlaylists,
                label: totalPlaylists === 1 ? 'playlist' : 'playlists',
                highlight: true,
              },
              {
                value: totalVideos,
                label: totalVideos === 1 ? 'video total' : 'videos total',
              },
            ]}
          />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
          >
            Dismiss
          </button>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.map((savedPlaylist, index) => (
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
