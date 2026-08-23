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
      className={`group relative bg-white dark:bg-gray-900 rounded-xl border transition-all flex flex-col overflow-hidden ${
        isCompleted
          ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/20 hover:border-emerald-300'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs hover:shadow-md'
      } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {/* Error Banner */}
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-950/50 border-b border-red-100 dark:border-red-900 text-[11px] text-red-600 dark:text-red-400 flex justify-between items-center">
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
        href={videoHref}
        className="relative aspect-video w-full bg-gray-900 overflow-hidden block"
      >
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration Badge */}
        {(video.duration_seconds || 0) > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-medium tracking-wide">
            {durationText}
          </div>
        )}

        {/* Progress Bar under thumbnail */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-900/60">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-red-600'
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
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Completed</span>
              </span>
            ) : savedVideo.status === 'in_progress' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>In Progress {progressPercent > 0 ? `· ${progressPercent}%` : ''}</span>
              </span>
            ) : savedVideo.status === 'not_started' ? (
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                Not Started
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                Saved
              </span>
            )}

            {savedVideo.saved_at && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
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
            className="block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
            title={video.title}
          >
            <h3
              className={`text-sm font-semibold line-clamp-2 leading-snug ${
                isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {video.title}
            </h3>
          </Link>

          {/* Channel Name */}
          {video.channel_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{video.channel_name}</span>
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {/* Watch Link */}
          <Link
            href={videoHref}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
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
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Delete Button / Confirmation */}
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 p-1 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-[10px] font-medium text-red-700 dark:text-red-300 px-1">Remove?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-[11px] bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer min-h-[30px]"
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
                aria-label="Remove video"
                title="Remove from library"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
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
