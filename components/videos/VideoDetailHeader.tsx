'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { markVideoCompleted } from '@/lib/actions/videos'
import type { SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'

export interface VideoPlaylistNavInfo {
  playlistId: string
  playlistTitle?: string
  currentIndex: number
  totalVideos: number
  previousVideo?: { id: string; title: string } | null
  nextVideo?: { id: string; title: string } | null
}

interface VideoDetailHeaderProps {
  savedVideo: SavedVideoWithDetails
  currentStatus: VideoStatus
  currentSeconds: number
  fromPlaylist?: string
  playlistNav?: VideoPlaylistNavInfo | null
  onStatusToggle?: (newStatus: VideoStatus) => void
}

export default function VideoDetailHeader({
  savedVideo,
  currentStatus,
  currentSeconds,
  fromPlaylist,
  playlistNav,
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
        <div className="p-2.5 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger-border)] text-xs text-[var(--danger)] flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[var(--danger)] hover:opacity-80 font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Back Link */}
        <Link
          href={fromPlaylist ? `/playlists/${fromPlaylist}` : '/videos'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[36px] py-1 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{fromPlaylist ? 'Back to Playlist' : 'Back to Videos'}</span>
        </Link>

        {/* Middle/Right: Playlist Navigation (if from playlist) */}
        {playlistNav && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-mono font-medium hidden sm:inline-block">
              Lesson {playlistNav.currentIndex} of {playlistNav.totalVideos}
            </span>
            <div className="flex items-center gap-1.5">
              {playlistNav.previousVideo ? (
                <Link
                  href={`/videos/${playlistNav.previousVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all cursor-pointer"
                  title={`Previous Lesson: ${playlistNav.previousVideo.title} (Shift+P)`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous Lesson</span>
                  <span className="sm:hidden">Prev</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] opacity-40 cursor-not-allowed">
                  ‹ Prev
                </span>
              )}
              {playlistNav.nextVideo ? (
                <Link
                  href={`/videos/${playlistNav.nextVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer shadow-2xs"
                  title={`Next Lesson: ${playlistNav.nextVideo.title} (Shift+N)`}
                >
                  <span className="hidden sm:inline">Next Lesson</span>
                  <span className="sm:hidden">Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success-border)]">
                  Last Lesson 🎉
                </span>
              )}
            </div>
          </div>
        )}

        {/* Right side: Status Badge & Mark as Watched button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success-border)]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Completed</span>
            </span>
          ) : status === 'in_progress' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
              <span>In Progress {progressPercent > 0 ? `· ${progressPercent}%` : ''}</span>
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
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
                ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                : 'bg-[var(--accent)] text-white border-transparent hover:bg-[var(--accent-hover)] shadow-xs'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{isCompleted ? 'Mark as unwatched' : 'Mark as completed'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
