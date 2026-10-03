'use client'

import { useState, useTransition } from 'react'
import { saveVideo } from '@/lib/actions/videos'
import { parseYoutubeVideoId } from '@/lib/youtube/parseUrl'

export default function AddVideoForm() {
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
      setError('Please enter a YouTube video URL.')
      return
    }

    // Client-side format validation
    const parsedId = parseYoutubeVideoId(trimmedUrl)
    if (!parsedId) {
      setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...).')
      return
    }

    startTransition(async () => {
      const res = await saveVideo(trimmedUrl)

      if (!res.success) {
        if (res.alreadySaved) {
          setIsWarning(true)
          setError(res.error || 'This video is already in your library.')
        } else {
          setIsWarning(false)
          setError(res.error || 'Failed to save video. Please check the URL and try again.')
        }
      } else {
        setUrl('')
        setIsWarning(false)
        setSuccessMessage(`"${res.data?.video.title || 'Video'}" has been added to your library!`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 4000)
      }
    })
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6 shadow-xs overflow-hidden mb-6 transition-colors">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-2xs">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Add YouTube Video</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Paste any YouTube video or short URL to fetch metadata and save it to your study library.
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
              {isWarning ? (
                <svg className="w-4 h-4 text-[var(--warning)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--danger)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-semibold ml-2 hover:opacity-75 cursor-pointer px-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--success-muted)] border border-[var(--success-border)] text-[var(--success)] text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--success)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-[var(--success)] hover:opacity-80 font-semibold cursor-pointer px-1"
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
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isPending}
              className="w-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl px-3.5 py-2.5 border border-[var(--border-subtle)] focus:bg-[var(--surface)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-hidden transition-all disabled:opacity-60"
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
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Fetching Details...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Save Video</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
