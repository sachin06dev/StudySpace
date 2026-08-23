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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden mb-8 transition-colors">
      <form onSubmit={handleSubmit} className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
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
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add YouTube Playlist</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paste a YouTube playlist link to fetch metadata, catalog all its videos, and save it to your library.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs flex items-center justify-between transition-all ${
              isWarning
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isWarning ? (
                <svg
                  className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
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
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-semibold cursor-pointer"
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
              className="w-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden transition-all disabled:opacity-60"
            />
            {url && !isPending && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs cursor-pointer p-1"
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer shrink-0"
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
                <span>Fetching & Syncing...</span>
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
                <span>Save Playlist</span>
              </>
            )}
          </button>
        </div>

        {/* Informative loading note */}
        {isPending && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 flex items-center gap-1.5 animate-pulse">
            <svg
              className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
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
            <span>Fetching playlist details and syncing all videos... This may take a few seconds for large playlists.</span>
          </p>
        )}
      </form>
    </div>
  )
}
