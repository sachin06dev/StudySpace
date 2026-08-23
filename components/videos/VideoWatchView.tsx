'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import VideoPlayer, { type VideoPlayerRef } from '@/components/videos/VideoPlayer'
import VideoDetailHeader from '@/components/videos/VideoDetailHeader'
import AddNoteButton, { type AddNoteButtonRef } from '@/components/videos/AddNoteButton'
import TimestampNotesList from '@/components/videos/TimestampNotesList'
import VideoShortcutsModal from '@/components/videos/VideoShortcutsModal'
import { updateNoteAction, deleteNoteAction } from '@/lib/actions/timestampNotes'
import { formatDuration } from '@/lib/youtube/client'
import type { SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'
import type { VideoTimestampNote } from '@/lib/data/timestampNotes'

interface VideoWatchViewProps {
  savedVideo: SavedVideoWithDetails
  initialNotes?: VideoTimestampNote[]
  fromPlaylist?: string
}

export default function VideoWatchView({
  savedVideo,
  initialNotes = [],
  fromPlaylist,
}: VideoWatchViewProps) {
  const durationSecs = savedVideo.video.duration_seconds || 0
  const isInitiallyCompleted = savedVideo.status === 'completed'
  const isInitiallyNearEnd =
    durationSecs > 0 &&
    (savedVideo.watch_progress_seconds || 0) >= durationSecs * 0.95

  const [currentStatus, setCurrentStatus] = useState<VideoStatus>(savedVideo.status)
  const [currentSeconds, setCurrentSeconds] = useState<number>(
    isInitiallyCompleted
      ? durationSecs
      : isInitiallyNearEnd
      ? 0
      : savedVideo.watch_progress_seconds || 0
  )

  const [notes, setNotes] = useState<VideoTimestampNote[]>(() => {
    return [...initialNotes].sort(
      (a, b) =>
        a.timestamp_seconds - b.timestamp_seconds ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  const playerRef = useRef<VideoPlayerRef>(null)
  const addNoteRef = useRef<AddNoteButtonRef>(null)
  const currentSecondsRef = useRef(currentSeconds)

  useEffect(() => {
    currentSecondsRef.current = currentSeconds
  }, [currentSeconds])

  // Global YouTube-standard Keyboard Shortcuts & Input Protection
  useEffect(() => {
    const isTextInputElement = (el: Element | null): boolean => {
      if (!el || !(el instanceof HTMLElement)) return false
      const tagName = el.tagName.toUpperCase()
      if (tagName === 'INPUT') {
        const inputType = (el as HTMLInputElement).type?.toLowerCase()
        return (
          inputType !== 'checkbox' &&
          inputType !== 'radio' &&
          inputType !== 'button' &&
          inputType !== 'submit' &&
          inputType !== 'reset'
        )
      }
      if (tagName === 'TEXTAREA' || tagName === 'SELECT') {
        return true
      }
      if (el.isContentEditable) {
        return true
      }
      if (
        el.getAttribute('contenteditable') === 'true' ||
        el.getAttribute('role') === 'textbox'
      ) {
        return true
      }
      return false
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const targetEl = e.target as Element | null

      // If user is currently typing inside an input/textarea/editable, protect it
      if (isTextInputElement(activeEl) || isTextInputElement(targetEl)) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
          e.preventDefault()
          e.stopPropagation()
          if (playerRef.current?.isFullscreenNoteOpen?.()) {
            playerRef.current.closeFullscreenNote()
          } else if (addNoteRef.current?.isOpen?.()) {
            addNoteRef.current.closeForm()
          }
          if (activeEl instanceof HTMLElement) {
            activeEl.blur()
          }
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          if (playerRef.current?.isFullscreenNoteOpen?.()) {
            playerRef.current.closeFullscreenNote()
          } else if (addNoteRef.current?.isOpen?.()) {
            addNoteRef.current.closeForm()
          }
          if (activeEl instanceof HTMLElement) {
            activeEl.blur()
          }
          return
        }
        return
      }

      // Priority 1: Ctrl+Z to cancel note draft if open
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (playerRef.current?.isFullscreenNoteOpen?.()) {
          e.preventDefault()
          e.stopPropagation()
          playerRef.current.closeFullscreenNote()
          return
        }
        if (addNoteRef.current?.isOpen?.()) {
          e.preventDefault()
          e.stopPropagation()
          addNoteRef.current.closeForm()
          return
        }
      }

      // Priority 2: Escape key handling (Modal > Fullscreen Note > Note composer)
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()

        if (isShortcutsOpen) {
          setIsShortcutsOpen(false)
          return
        }
        if (playerRef.current?.isFullscreenNoteOpen?.()) {
          playerRef.current.closeFullscreenNote()
          return
        }
        if (addNoteRef.current?.isOpen?.()) {
          addNoteRef.current.closeForm()
          return
        }
        // Esc does NOT exit fullscreen (fullscreen toggle is dedicated to 'f')
        return
      }

      // Avoid modifier combos (Ctrl/Meta/Alt) except standard Shift combinations
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const key = e.key.toLowerCase()

      // Toggle Shortcuts modal: '?' or Shift+'/'
      if (e.key === '?' || (e.shiftKey && (e.key === '/' || e.code === 'Slash'))) {
        e.preventDefault()
        setIsShortcutsOpen((prev) => !prev)
        return
      }

      // Add Note: 'n' (protect against key repeat)
      if (!e.shiftKey && (key === 'n' || e.code === 'KeyN')) {
        if (e.repeat) return
        e.preventDefault()
        const curTime = playerRef.current?.getCurrentTime() ?? currentSecondsRef.current ?? 0
        const safeSec = Math.max(0, Math.floor(curTime))

        const isFs = playerRef.current?.isFullscreen?.()
        if (isFs) {
          playerRef.current?.openFullscreenNote?.(safeSec)
        } else {
          addNoteRef.current?.openForm?.(safeSec)
        }

        playerRef.current?.showHudFeedback?.('📝', `Note at ${formatDuration(safeSec)}`)
        return
      }

      // Play / Pause: Space or 'k'
      if (e.key === ' ' || e.code === 'Space' || key === 'k' || e.code === 'KeyK') {
        e.preventDefault()
        playerRef.current?.togglePlay()
        return
      }

      // Seek Backward 10s: 'j'
      if (key === 'j' || e.code === 'KeyJ') {
        e.preventDefault()
        playerRef.current?.seekBy(-10)
        return
      }

      // Seek Forward 10s: 'l'
      if (key === 'l' || e.code === 'KeyL') {
        e.preventDefault()
        playerRef.current?.seekBy(10)
        return
      }

      // Seek Backward 5s: ArrowLeft
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        playerRef.current?.seekBy(-5)
        return
      }

      // Seek Forward 5s: ArrowRight
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        playerRef.current?.seekBy(5)
        return
      }

      // Volume Up: ArrowUp
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        playerRef.current?.changeVolume(5)
        return
      }

      // Volume Down: ArrowDown
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        playerRef.current?.changeVolume(-5)
        return
      }

      // Mute / Unmute: 'm'
      if (key === 'm' || e.code === 'KeyM') {
        e.preventDefault()
        playerRef.current?.toggleMute()
        return
      }

      // Decrease Speed: '<' or ','
      if (e.key === '<' || e.key === ',' || (!e.shiftKey && e.code === 'Comma')) {
        e.preventDefault()
        playerRef.current?.changePlaybackRate('decrease')
        return
      }

      // Increase Speed: '>' or '.'
      if (e.key === '>' || e.key === '.' || (!e.shiftKey && e.code === 'Period')) {
        e.preventDefault()
        playerRef.current?.changePlaybackRate('increase')
        return
      }

      // Fullscreen: 'f'
      if (key === 'f' || e.code === 'KeyF') {
        e.preventDefault()
        playerRef.current?.toggleFullscreen()
        return
      }

      // Beginning (0%): '0' or 'Home'
      if (e.key === 'Home' || (!e.shiftKey && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0'))) {
        e.preventDefault()
        playerRef.current?.seekToPercent(0)
        return
      }

      // End (100%): 'End'
      if (e.key === 'End') {
        e.preventDefault()
        playerRef.current?.seekToPercent(1)
        return
      }

      // Percentage Jump: 1 - 9 (10% to 90% without Shift)
      if (!e.shiftKey && (/^[1-9]$/.test(e.key) || /^Digit[1-9]$/.test(e.code) || /^Numpad[1-9]$/.test(e.code))) {
        let digit = parseInt(e.key, 10)
        if (isNaN(digit)) {
          const match = e.code.match(/\d+/)
          if (match) digit = parseInt(match[0], 10)
        }
        if (!isNaN(digit) && digit >= 1 && digit <= 9) {
          e.preventDefault()
          playerRef.current?.seekToPercent(digit * 0.1)
          return
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isShortcutsOpen])

  const handleStatusChange = useCallback((newStatus: VideoStatus) => {
    setCurrentStatus(newStatus)
  }, [])

  const handleProgressChange = useCallback((seconds: number) => {
    setCurrentSeconds(seconds)
  }, [])

  const handleSeek = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true)
    }
  }, [])

  const handleGetCurrentTime = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current.getCurrentTime()
    }
    return currentSecondsRef.current
  }, [])

  const handleNoteCreated = useCallback((newNote: VideoTimestampNote) => {
    setNotes((prev) => {
      const updated = [...prev, newNote]
      return updated.sort(
        (a, b) =>
          a.timestamp_seconds - b.timestamp_seconds ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
  }, [])

  const handleUpdateNote = useCallback(
    async (noteId: string, content: string): Promise<boolean> => {
      const res = await updateNoteAction(noteId, content)
      if (res.success && res.data) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? { ...n, content: res.data!.content, updated_at: res.data!.updated_at }
              : n
          )
        )
        return true
      }
      return false
    },
    []
  )

  const handleDeleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      const res = await deleteNoteAction(noteId)
      if (res.success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
        return true
      }
      return false
    },
    []
  )

  const { video } = savedVideo
  const durationText = formatDuration(durationSecs)
  const currentProgressText = formatDuration(currentSeconds)
  const progressPercent =
    currentStatus === 'completed'
      ? 100
      : durationSecs > 0
      ? Math.min(100, Math.round((currentSeconds / durationSecs) * 100))
      : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <VideoDetailHeader
        savedVideo={savedVideo}
        currentStatus={currentStatus}
        currentSeconds={currentSeconds}
        fromPlaylist={fromPlaylist}
        onStatusToggle={handleStatusChange}
      />

      {/* Main Layout Grid: Player & Info on Left, Timestamp Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player, Progress, Video Details */}
        <div className="lg:col-span-8 space-y-4">
          {/* Embedded YouTube Player */}
          <div className="space-y-2">
            <VideoPlayer
              ref={playerRef}
              savedVideo={savedVideo}
              currentStatus={currentStatus}
              notes={notes}
              onNoteCreated={handleNoteCreated}
              onStatusChange={handleStatusChange}
              onProgressChange={handleProgressChange}
            />

            {/* Progress Bar & Indicators */}
            {durationSecs > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-xs transition-colors">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                  <span>
                    {currentStatus === 'completed'
                      ? `Completed (${durationText})`
                      : `Progress: ${currentProgressText} / ${durationText} (${progressPercent}%)`}
                  </span>
                </div>

                <div className="w-full sm:max-w-xs h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStatus === 'completed' ? 'bg-emerald-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Information Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
                  {video.title}
                </h1>

                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                  {video.channel_name && (
                    <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span>{video.channel_name}</span>
                    </div>
                  )}

                  {durationSecs > 0 && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Duration: {durationText}</span>
                    </div>
                  )}

                  {savedVideo.saved_at && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        Saved on{' '}
                        {new Date(savedVideo.saved_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Keyboard Shortcuts Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors cursor-pointer"
                  title="View Keyboard Shortcuts (?)"
                >
                  <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                  <span>Shortcuts</span>
                  <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-2xs">?</kbd>
                </button>

                {/* Open on YouTube */}
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Open on YouTube</span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timestamp Notes Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs space-y-4 transition-colors">
            {/* Panel Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Timestamp Notes</h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
                  </p>
                </div>
              </div>

              {/* Add Note Button Trigger */}
              <button
                type="button"
                onClick={() => {
                  const curTime = playerRef.current?.getCurrentTime() ?? currentSecondsRef.current ?? 0
                  addNoteRef.current?.openForm?.(Math.max(0, Math.floor(curTime)))
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-all cursor-pointer"
                title="Add note at current playback time (n)"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add Note</span>
                <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono bg-indigo-700 dark:bg-indigo-800 text-white rounded">n</kbd>
              </button>
            </div>

            {/* Note Composer Form Card */}
            <AddNoteButton
              ref={addNoteRef}
              videoId={savedVideo.video_id}
              getCurrentTime={handleGetCurrentTime}
              onNoteCreated={handleNoteCreated}
            />

            {/* Notes List */}
            <TimestampNotesList
              notes={notes}
              onSeek={handleSeek}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              currentSeconds={currentSeconds}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Dialog */}
      <VideoShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  )
}
