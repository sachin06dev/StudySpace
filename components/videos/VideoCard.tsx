'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { removeVideo, markVideoCompleted } from '@/lib/actions/videos'
import { formatDuration } from '@/lib/youtube/client'
import type { SavedVideoWithDetails } from '@/lib/data/videos'

interface VideoCardProps {
  savedVideo: SavedVideoWithDetails
  priority?: boolean
  fromPlaylist?: string
  onDelete?: (savedVideoId: string) => void
  onToggleWatched?: (savedVideoId: string, nextCompleted: boolean) => void
}

export default function VideoCard({
  savedVideo,
  priority = false,
  fromPlaylist,
  onDelete,
  onToggleWatched,
}: VideoCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prevStatus, setPrevStatus] = useState(savedVideo.status)
  const [localCompleted, setLocalCompleted] = useState<boolean>(savedVideo.status === 'completed')

  if (prevStatus !== savedVideo.status) {
    setPrevStatus(savedVideo.status)
    setLocalCompleted(savedVideo.status === 'completed')
  }

  const { video } = savedVideo
  const durationText = formatDuration(video.duration_seconds || 0)
  const isCompleted = localCompleted

  const videoHref = fromPlaylist
    ? `/videos/${savedVideo.id}?fromPlaylist=${encodeURIComponent(fromPlaylist)}`
    : `/videos/${savedVideo.id}`

  // Calculate watch progress percentage
  const progressPercent =
    isCompleted
      ? 100
      : (video.duration_seconds || 0) > 0 && savedVideo.watch_progress_seconds > 0
      ? Math.min(100, Math.round((savedVideo.watch_progress_seconds / (video.duration_seconds || 1)) * 100))
      : 0

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)

    const nextCompleted = !isCompleted

    // If parent handles optimistic state
    if (onToggleWatched) {
      onToggleWatched(savedVideo.id, nextCompleted)
      return
    }

    // Standalone optimistic toggle
    setLocalCompleted(nextCompleted)
    startTransition(async () => {
      const res = await markVideoCompleted(savedVideo.id, nextCompleted)
      if (!res.success) {
        setLocalCompleted(!nextCompleted)
        setError(res.error || 'Failed to update watch status.')
      }
    })
  }

  const handleDelete = () => {
    setError(null)
    setIsConfirmingDelete(false)

    // If parent handles optimistic deletion
    if (onDelete) {
      onDelete(savedVideo.id)
      return
    }

    // Standalone delete
    startTransition(async () => {
      const res = await removeVideo(savedVideo.id)
      if (!res.success) {
        setError(res.error || 'Failed to remove video.')
      }
    })
  }

  return (
    <div
      className={`group relative rounded-xl border transition-all flex flex-col overflow-hidden bg-[var(--surface)] text-[var(--text-primary)] ${
        isCompleted
          ? 'border-[var(--success-border)] bg-[var(--surface)] hover:border-[var(--success)] shadow-xs'
          : 'border-[var(--border-subtle)] hover:border-[var(--accent)] hover:shadow-md'
      } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
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
        href={videoHref}
        className="relative aspect-video w-full bg-[var(--surface-raised)] overflow-hidden block"
      >
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
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

        {/* Calm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration Badge */}
        {(video.duration_seconds || 0) > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono tracking-tight shadow-xs">
            {durationText}
          </div>
        )}

        {/* Progress Bar under thumbnail */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 backdrop-blur-xs">
            <div
              className={`h-full transition-all duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth-out)] ${
                isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Status & Date */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[var(--success-muted)] text-[var(--success)] border-[var(--success-border)]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Completed</span>
              </span>
            ) : savedVideo.status === 'in_progress' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[var(--warning-muted)] text-[var(--warning)] border-[var(--warning-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
                <span>In Progress {progressPercent > 0 ? `· ${progressPercent}%` : ''}</span>
              </span>
            ) : savedVideo.status === 'not_started' ? (
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)]">
                Not Started
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent-hover)]/30">
                Saved
              </span>
            )}

            {savedVideo.saved_at && (
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {new Date(savedVideo.saved_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={videoHref}
            className="block group-hover:text-[var(--accent)] transition-colors"
            title={video.title}
          >
            <h3
              className={`text-sm font-semibold line-clamp-2 leading-snug ${
                isCompleted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {video.title}
            </h3>
          </Link>

          {/* Channel Name */}
          {video.channel_name && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{video.channel_name}</span>
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          {/* Watch / Resume Link */}
          <Link
            href={videoHref}
            className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors"
          >
            <span>{savedVideo.watch_progress_seconds > 0 && !isCompleted ? 'Resume' : 'Watch'}</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Action Buttons: Mark as Watched & Delete */}
          <div className="flex items-center gap-1">
            {/* Mark as Watched Button */}
            <button
              type="button"
              onClick={handleToggleWatched}
              disabled={isPending}
              title={isCompleted ? 'Mark as unwatched' : 'Mark as watched'}
              aria-label={isCompleted ? 'Mark as unwatched' : 'Mark as watched'}
              className={`min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isCompleted
                  ? 'text-[var(--success)] bg-[var(--success-muted)] hover:opacity-90 border border-[var(--success-border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Delete Button / Confirmation */}
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1.5 bg-[var(--danger-muted)] p-1 rounded-lg border border-[var(--danger-border)]">
                <span className="text-[10px] font-medium text-[var(--danger)] px-1">Remove?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-[11px] bg-[var(--danger)] hover:opacity-90 text-white font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer min-h-[30px]"
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
                aria-label="Remove video"
                title="Remove from library"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
