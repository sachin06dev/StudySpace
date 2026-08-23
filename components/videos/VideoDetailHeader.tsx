'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { markVideoCompleted } from '@/lib/actions/videos'
import type { SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'

interface VideoDetailHeaderProps {
  savedVideo: SavedVideoWithDetails
  currentStatus: VideoStatus
  currentSeconds: number
  fromPlaylist?: string
  onStatusToggle?: (newStatus: VideoStatus) => void
}

export default function VideoDetailHeader({
  savedVideo,
  currentStatus,
  currentSeconds,
  fromPlaylist,
  onStatusToggle,
}: VideoDetailHeaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [prevStatus, setPrevStatus] = useState(currentStatus)
  const [status, setStatus] = useState<VideoStatus>(currentStatus)
  const [error, setError] = useState<string | null>(null)

  if (prevStatus !== currentStatus) {
    setPrevStatus(currentStatus)
    setStatus(currentStatus)
  }

  const isCompleted = status === 'completed'
  const duration = savedVideo.video.duration_seconds || 0
  const progressPercent =
    duration > 0
      ? Math.min(100, Math.round((currentSeconds / duration) * 100))
      : 0

  const handleToggleCompleted = () => {
    setError(null)
    const nextCompleted = !isCompleted
    const nextStatus: VideoStatus = nextCompleted ? 'completed' : 'in_progress'
    setStatus(nextStatus)
    if (onStatusToggle) {
      onStatusToggle(nextStatus)
    }

    startTransition(async () => {
      const res = await markVideoCompleted(savedVideo.id, nextCompleted)
      if (!res.success) {
        // Rollback
        setStatus(isCompleted ? 'completed' : 'in_progress')
        setError(res.error || 'Failed to update status.')
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-xs text-red-600 rounded-lg flex justify-between items-center">
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

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Back Link */}
        <Link
          href={fromPlaylist ? `/playlists/${fromPlaylist}` : '/videos'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors min-h-[36px] py-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{fromPlaylist ? 'Back to Playlist' : 'Back to Videos'}</span>
        </Link>

        {/* Right side: Status Badge & Mark as Watched button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Completed</span>
            </span>
          ) : status === 'in_progress' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>In Progress {progressPercent > 0 ? `· ${progressPercent}%` : ''}</span>
            </span>
          ) : status === 'not_started' ? (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
              Not Started
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              Saved
            </span>
          )}

          {/* Mark as Watched / Toggle Button */}
          <button
            type="button"
            onClick={handleToggleCompleted}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{isCompleted ? 'Mark as unwatched' : 'Mark as watched'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
