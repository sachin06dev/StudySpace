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
      className={`group relative bg-[var(--surface)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent)] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden text-[var(--text-primary)] ${
        isPending ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      {/* Error Banner */}
      {error && (
        <div className="p-2.5 bg-[var(--danger-muted)] border-b border-[var(--danger-border)] text-xs text-[var(--danger)] flex justify-between items-center">
          <span className="font-medium">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[var(--danger)] hover:opacity-80 font-bold cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thumbnail Area with Link */}
      <Link
        href={playlistHref}
        className="relative aspect-video w-full bg-[var(--surface-raised)] overflow-hidden block"
      >
        {playlist.thumbnail_url ? (
          <Image
            src={playlist.thumbnail_url}
            alt={playlist.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)]"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--surface-raised)] text-[var(--text-muted)] text-xs">
            No Thumbnail
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Playlist Badge Overlay */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-xs">
          <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm3-10v8.1c-.6-.4-1.3-.7-2-.9v-5.2h-16v12h9.1c.3.7.7 1.4 1.2 2h-12.3c-1.1 0-2-.9-2-2v-12c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2zm-14 3h10v2h-10v-2zm0 4h7v2h-7v-2zm0 4h4v2h-4v-2z" />
          </svg>
          <span>
            {video_count} {video_count === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {/* Hover Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
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
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/30">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Course Series</span>
            </span>

            {savedPlaylist.saved_at && (
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
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
            className="block group-hover:text-[var(--accent)] transition-colors"
            title={playlist.title}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
              {playlist.title}
            </h3>
          </Link>

          {/* Channel Name */}
          {playlist.channel_name && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0"
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
            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
              {playlist.description}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          {/* View Playlist Link */}
          <Link
            href={playlistHref}
            className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors"
          >
            <span>View Series</span>
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
              <div className="flex items-center gap-1 bg-[var(--danger-muted)] p-1 rounded-lg border border-[var(--danger-border)] animate-in fade-in-50">
                <span className="text-[10px] font-medium text-[var(--danger)] px-1">Remove?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-[11px] bg-[var(--danger)] text-white font-semibold px-2.5 py-1 rounded hover:opacity-90 transition-colors cursor-pointer min-h-[30px]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isPending}
                  className="text-[11px] bg-[var(--surface)] text-[var(--text-primary)] font-medium px-2.5 py-1 rounded border border-[var(--border-subtle)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer min-h-[30px]"
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
                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] rounded-lg transition-colors cursor-pointer"
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
