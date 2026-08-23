'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { removePlaylist } from '@/lib/actions/playlists'
import type { SavedPlaylistWithDetails } from '@/lib/data/playlists'

interface PlaylistCardProps {
  savedPlaylist: SavedPlaylistWithDetails
  priority?: boolean
  onDelete?: (savedPlaylistId: string) => void
}

export default function PlaylistCard({
  savedPlaylist,
  priority = false,
  onDelete,
}: PlaylistCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { playlist, video_count } = savedPlaylist
  const playlistHref = `/playlists/${savedPlaylist.playlist_id || savedPlaylist.id}`

  const handleDelete = () => {
    setError(null)
    setIsConfirmingDelete(false)

    if (onDelete) {
      onDelete(savedPlaylist.id)
      return
    }

    startTransition(async () => {
      const res = await removePlaylist(savedPlaylist.id)
      if (!res.success) {
        setError(res.error || 'Failed to remove playlist.')
      }
    })
  }

  return (
    <div
      className={`group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden ${
        isPending ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      {/* Error Banner */}
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-800 text-[11px] text-red-600 dark:text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thumbnail Area with Link */}
      <Link
        href={playlistHref}
        className="relative aspect-video w-full bg-gray-900 overflow-hidden block"
      >
        {playlist.thumbnail_url ? (
          <Image
            src={playlist.thumbnail_url}
            alt={playlist.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-xs">
            No Thumbnail
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Playlist Badge Overlay */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm3-10v8.1c-.6-.4-1.3-.7-2-.9v-5.2h-16v12h9.1c.3.7.7 1.4 1.2 2h-12.3c-1.1 0-2-.9-2-2v-12c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2zm-14 3h10v2h-10v-2zm0 4h7v2h-7v-2zm0 4h4v2h-4v-2z" />
          </svg>
          <span>
            {video_count} {video_count === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {/* Hover Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <svg
              className="w-5 h-5 ml-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Badge & Saved Date */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Playlist</span>
            </span>

            {savedPlaylist.saved_at && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {new Date(savedPlaylist.saved_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={playlistHref}
            className="block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
            title={playlist.title}
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
              {playlist.title}
            </h3>
          </Link>

          {/* Channel Name */}
          {playlist.channel_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="truncate">{playlist.channel_name}</span>
            </p>
          )}

          {/* Description Snippet */}
          {playlist.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {playlist.description}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          {/* View Playlist Link */}
          <Link
            href={playlistHref}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
          >
            <span>View Videos</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          {/* Delete Button / Confirmation */}
          <div>
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-md border border-red-200 dark:border-red-800 animate-in fade-in-50">
                <span className="text-[10px] font-medium text-red-700 dark:text-red-300 px-1">Remove?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-[11px] bg-red-600 text-white font-semibold px-2.5 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer min-h-[30px]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isPending}
                  className="text-[11px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer min-h-[30px]"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isPending}
                aria-label="Remove playlist"
                title="Remove from library"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
