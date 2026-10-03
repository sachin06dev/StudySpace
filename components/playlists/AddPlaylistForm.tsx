'use client'

import { useState, useTransition } from 'react'
import { savePlaylist } from '@/lib/actions/playlists'
import { parseYoutubePlaylistId } from '@/lib/youtube/parseUrl'

export default function AddPlaylistForm() {
  const [url, setUrl] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isWarning, setIsWarning] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsWarning(false)
    setSuccessMessage(null)

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      setError('Please enter a YouTube playlist URL.')
      return
    }

    // Client-side format validation
    const parsedId = parseYoutubePlaylistId(trimmedUrl)
    if (!parsedId) {
      setError(
        'Please enter a valid YouTube playlist link (e.g., https://www.youtube.com/playlist?list=... or a URL with &list=...).'
      )
      return
    }

    startTransition(async () => {
      const res = await savePlaylist(trimmedUrl)

      if (!res.success) {
        if (res.alreadySaved) {
          setIsWarning(true)
          setError(res.error || 'This playlist is already in your library.')
        } else {
          setIsWarning(false)
          setError(
            res.error || 'Failed to save playlist. Please check the URL and try again.'
          )
        }
      } else {
        setUrl('')
        setIsWarning(false)
        const videoCount = res.data?.video_count ?? 0
        setSuccessMessage(
          `"${res.data?.playlist.title || 'Playlist'}" has been added to your library with ${videoCount} ${
            videoCount === 1 ? 'video' : 'videos'
          }!`
        )
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      }
    })
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs overflow-hidden mb-8 transition-colors">
      <form onSubmit={handleSubmit} className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Add Course / Playlist</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Import a complete YouTube playlist to catalog all its lectures and curriculum in order.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center justify-between transition-all ${
              isWarning
                ? 'bg-[var(--warning-muted)] border border-[var(--warning-border)] text-[var(--warning)]'
                : 'bg-[var(--danger-muted)] border border-[var(--danger-border)] text-[var(--danger)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {isWarning ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-semibold ml-2 hover:opacity-75 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--success-muted)] border border-[var(--success-border)] text-[var(--success)] text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="font-semibold cursor-pointer hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input & Submit Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              disabled={isPending}
              className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl px-3.5 py-2.5 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all disabled:opacity-60"
            />
            {url && !isPending && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer p-1"
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Import Playlist</span>
              </>
            )}
          </button>
        </div>

        {/* Informative loading note */}
        {isPending && (
          <p className="text-[11px] text-[var(--text-muted)] mt-2.5 flex items-center gap-1.5 animate-pulse">
            <svg
              className="w-3.5 h-3.5 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Fetching playlist details and syncing all lessons... This may take a moment.</span>
          </p>
        )}
      </form>
    </div>
  )
}
