'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Maximize2, Minimize2, PanelLeftOpen } from 'lucide-react'
import VideoPlayer, { type VideoPlayerRef } from '@/components/videos/VideoPlayer'
import VideoDetailHeader from '@/components/videos/VideoDetailHeader'
import AddNoteButton, { type AddNoteButtonRef } from '@/components/videos/AddNoteButton'
import TimestampNotesList from '@/components/videos/TimestampNotesList'
import VideoShortcutsModal from '@/components/videos/VideoShortcutsModal'
import { updateNoteAction, deleteNoteAction } from '@/lib/actions/timestampNotes'
import { formatDuration } from '@/lib/youtube/client'
import type { SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'
import type { VideoTimestampNote } from '@/lib/data/timestampNotes'
import { useSidebarCollapse } from '@/components/layout/SidebarCollapseContext'

export interface PlaylistNavInfo {
  playlistId: string
  playlistTitle?: string
  currentIndex: number
  totalVideos: number
  previousVideo?: { id: string; title: string } | null
  nextVideo?: { id: string; title: string } | null
}

interface VideoWatchViewProps {
  savedVideo: SavedVideoWithDetails
  initialNotes?: VideoTimestampNote[]
  fromPlaylist?: string
  initialTimestamp?: number
  playlistNav?: PlaylistNavInfo | null
}

/**
 * Desktop-only focus mode toggle button.
 * Collapses the app sidebar for a wider video viewing area.
 * Mobile navigation is already hidden so this button is lg+ only.
 */
function FocusModeButton() {
  const { isSidebarCollapsed, collapseSidebar, restoreSidebar } = useSidebarCollapse()

  return (
    <button
      type="button"
      onClick={isSidebarCollapsed ? restoreSidebar : collapseSidebar}
      className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--surface-raised)] hover:border-[var(--accent)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer group"
      aria-label={isSidebarCollapsed ? 'Exit focus mode' : 'Enter focus mode — collapse sidebar'}
      title={isSidebarCollapsed ? 'Exit Focus Mode · Ctrl+Shift+F' : 'Focus Mode · Ctrl+Shift+F'}
    >
      {isSidebarCollapsed ? (
        <>
          <Minimize2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Exit Focus</span>
          <kbd className="hidden xl:inline-block px-1 py-0.2 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border-subtle)] rounded">
            Ctrl+Shift+F
          </kbd>
        </>
      ) : (
        <>
          <Maximize2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>Focus Mode</span>
          <kbd className="hidden xl:inline-block px-1 py-0.2 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border-subtle)] rounded">
            Ctrl+Shift+F
          </kbd>
        </>
      )}
    </button>
  )
}

export default function VideoWatchView({
  savedVideo,
  initialNotes = [],
  fromPlaylist,
  initialTimestamp,
  playlistNav,
}: VideoWatchViewProps) {
  const router = useRouter()
  const { isSidebarCollapsed, collapseSidebar, restoreSidebar } = useSidebarCollapse()
  const durationSecs = savedVideo.video.duration_seconds || 0
  const isInitiallyCompleted = savedVideo.status === 'completed'
  const isInitiallyNearEnd =
    durationSecs > 0 &&
    (savedVideo.watch_progress_seconds || 0) >= durationSecs * 0.95

  const [currentStatus, setCurrentStatus] = useState<VideoStatus>(savedVideo.status)
  const [currentSeconds, setCurrentSeconds] = useState<number>(
    typeof initialTimestamp === 'number'
      ? initialTimestamp
      : isInitiallyCompleted
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

  // Synchronize state when navigating between lessons in a playlist
  const [prevVideoId, setPrevVideoId] = useState(savedVideo.id)
  if (prevVideoId !== savedVideo.id) {
    setPrevVideoId(savedVideo.id)
    setCurrentStatus(savedVideo.status)
    setCurrentSeconds(
      typeof initialTimestamp === 'number'
        ? initialTimestamp
        : isInitiallyCompleted
        ? durationSecs
        : isInitiallyNearEnd
        ? 0
        : savedVideo.watch_progress_seconds || 0
    )
    setNotes(
      [...initialNotes].sort(
        (a, b) =>
          a.timestamp_seconds - b.timestamp_seconds ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    )
  }

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  const playerRef = useRef<VideoPlayerRef>(null)
  const addNoteRef = useRef<AddNoteButtonRef>(null)
  const currentSecondsRef = useRef(currentSeconds)

  useEffect(() => {
    currentSecondsRef.current = currentSeconds
  }, [currentSeconds])

  // Persist Last Watched Video state in localStorage on progress change and page exit
  useEffect(() => {
    const saveLastWatchedToStorage = () => {
      try {
        const curSec = currentSecondsRef.current || 0
        localStorage.setItem(
          'studyspace_last_watched_video',
          JSON.stringify({
            savedVideoId: savedVideo.id,
            videoId: savedVideo.video_id,
            title: savedVideo.video.title,
            channelName: savedVideo.video.channel_name,
            thumbnailUrl: savedVideo.video.thumbnail_url,
            timestamp: curSec,
            duration: durationSecs,
            fromPlaylist: fromPlaylist || null,
            playlistTitle: playlistNav?.playlistTitle || null,
            status: currentStatus,
            updatedAt: new Date().toISOString(),
          })
        )
      } catch {
        // Ignore localStorage error
      }
    }

    const interval = setInterval(saveLastWatchedToStorage, 5000)
    window.addEventListener('beforeunload', saveLastWatchedToStorage)

    return () => {
      clearInterval(interval)
      saveLastWatchedToStorage()
      window.removeEventListener('beforeunload', saveLastWatchedToStorage)
    }
  }, [savedVideo, durationSecs, fromPlaylist, playlistNav, currentStatus])

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

      // Focus Mode Shortcut: Ctrl/Cmd + Shift + F (always available except in text inputs)
      if (
        !isTextInputElement(activeEl) &&
        !isTextInputElement(targetEl) &&
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key.toLowerCase() === 'f' || e.code === 'KeyF')
      ) {
        e.preventDefault()
        if (isSidebarCollapsed) {
          restoreSidebar()
        } else {
          collapseSidebar()
        }
        return
      }

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

      // Playlist Next Video: Shift + N
      if (e.shiftKey && (e.key.toLowerCase() === 'n' || e.code === 'KeyN') && playlistNav?.nextVideo) {
        e.preventDefault()
        router.push(`/videos/${playlistNav.nextVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`)
        return
      }

      // Playlist Previous Video: Shift + P
      if (e.shiftKey && (e.key.toLowerCase() === 'p' || e.code === 'KeyP') && playlistNav?.previousVideo) {
        e.preventDefault()
        router.push(`/videos/${playlistNav.previousVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`)
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
  }, [isShortcutsOpen, isSidebarCollapsed, collapseSidebar, playlistNav, restoreSidebar, router])

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
    <div
      className={
        isSidebarCollapsed
          ? 'w-full space-y-3.5 transition-all duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)]'
          : 'max-w-6xl mx-auto space-y-6 transition-all duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)]'
      }
    >
      {/* Top Header / Focus Control Bar */}
      {isSidebarCollapsed ? (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xs transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Show Navigation Button */}
            <button
              type="button"
              onClick={restoreSidebar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-muted)] hover:bg-[var(--accent)]/15 border border-[var(--accent)]/30 rounded-xl transition-all cursor-pointer shrink-0"
              aria-label="Show navigation sidebar"
              title="Show Navigation"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
              <span>Show Navigation</span>
            </button>

            {/* Breadcrumb / Back */}
            <Link
              href={fromPlaylist ? `/playlists/${fromPlaylist}` : '/videos'}
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <span>‹ {fromPlaylist ? 'Back to Playlist' : 'Back to Videos'}</span>
            </Link>

            {/* Playlist Nav in Focus Bar */}
            {playlistNav && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[11px]">
                <span className="font-mono text-[var(--text-muted)] mr-1">
                  Lesson {playlistNav.currentIndex}/{playlistNav.totalVideos}
                </span>
                {playlistNav.previousVideo ? (
                  <Link
                    href={`/videos/${playlistNav.previousVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`}
                    className="px-1.5 py-0.5 rounded text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                    title={`Previous: ${playlistNav.previousVideo.title} (Shift+P)`}
                  >
                    ‹
                  </Link>
                ) : (
                  <span className="px-1.5 py-0.5 text-[var(--text-muted)] opacity-40 cursor-not-allowed">‹</span>
                )}
                {playlistNav.nextVideo ? (
                  <Link
                    href={`/videos/${playlistNav.nextVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`}
                    className="px-1.5 py-0.5 rounded font-bold text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors"
                    title={`Next: ${playlistNav.nextVideo.title} (Shift+N)`}
                  >
                    ›
                  </Link>
                ) : (
                  <span className="px-1.5 py-0.5 text-[var(--text-muted)] opacity-40 cursor-not-allowed">›</span>
                )}
              </div>
            )}

            <span className="hidden md:inline-block text-[var(--border-subtle)]">|</span>

            <span className="text-xs font-semibold text-[var(--text-primary)] truncate hidden md:inline-block max-w-md">
              {video.title}
            </span>
          </div>

          {/* Right Actions in Focus Mode */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Shortcuts */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] hover:border-[var(--accent)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
              title="View Keyboard Shortcuts (?)"
            >
              <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="hidden lg:inline-block px-1 py-0.2 text-[10px] font-mono bg-[var(--surface)] border border-[var(--border-subtle)] rounded shadow-2xs">?</kbd>
            </button>

            {/* Open on YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] hover:border-[var(--accent)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
              title="Open on YouTube"
            >
              <span>YouTube</span>
              <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Exit Focus Button */}
            <button
              type="button"
              onClick={restoreSidebar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-raised)] hover:border-[var(--accent)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
              aria-label="Exit Focus Mode"
              title="Exit Focus Mode · Ctrl+Shift+F"
            >
              <Minimize2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Exit Focus</span>
            </button>
          </div>
        </div>
      ) : (
        <VideoDetailHeader
          savedVideo={savedVideo}
          currentStatus={currentStatus}
          currentSeconds={currentSeconds}
          fromPlaylist={fromPlaylist}
          playlistNav={playlistNav}
          onStatusToggle={handleStatusChange}
        />
      )}

      {/* Main Layout Grid: Player & Info on Left, Timestamp Notes on Right */}
      <div
        className={
          isSidebarCollapsed
            ? 'grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_390px] gap-4 items-stretch'
            : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
        }
      >
        {/* Left Column: Player, Progress, Video Details */}
        <div className={isSidebarCollapsed ? 'min-w-0 flex flex-col space-y-3' : 'lg:col-span-8 space-y-4'}>
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
              initialStartSeconds={initialTimestamp}
            />

            {/* Up Next in Playlist / Course Complete Card (Triggered at video finish or near end) */}
            {playlistNav && (currentStatus === 'completed' || (durationSecs > 0 && currentSeconds >= durationSecs * 0.95)) && (
              <div className="bg-[var(--surface)] border border-[var(--accent)]/30 rounded-2xl p-4 shadow-xs animate-in fade-in-50 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">
                      {playlistNav.nextVideo ? '⏭️' : '🎉'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                        {playlistNav.nextVideo
                          ? `Up Next · Lesson ${playlistNav.currentIndex + 1} of ${playlistNav.totalVideos}`
                          : 'Course Complete!'}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                        {playlistNav.nextVideo
                          ? playlistNav.nextVideo.title
                          : `You've completed all ${playlistNav.totalVideos} lessons in ${playlistNav.playlistTitle || 'this playlist'}!`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {playlistNav.previousVideo && (
                      <Link
                        href={`/videos/${playlistNav.previousVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous Lesson</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSeek(0)}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
                    >
                      Replay
                    </button>
                    {playlistNav.nextVideo ? (
                      <Link
                        href={`/videos/${playlistNav.nextVideo.id}?fromPlaylist=${encodeURIComponent(playlistNav.playlistId)}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Next Lesson</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ) : (
                      <Link
                        href={`/playlists/${playlistNav.playlistId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[var(--success)] hover:opacity-90 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Course Overview</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar & Indicators (Normal Mode Only) */}
            {!isSidebarCollapsed && durationSecs > 0 && (
              <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-xs transition-colors">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium shrink-0">
                  <span className={`w-2 h-2 rounded-full ${currentStatus === 'completed' ? 'bg-[var(--success)]' : 'bg-[var(--accent)] animate-pulse'}`} />
                  <span>
                    {currentStatus === 'completed'
                      ? `Completed (${durationText})`
                      : `Progress: ${currentProgressText} / ${durationText} (${progressPercent}%)`}
                  </span>
                </div>

                <div className="w-full sm:max-w-xs h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden shrink-0 border border-[var(--border-subtle)]">
                  <div
                    className={`h-full transition-all duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth-out)] ${
                      currentStatus === 'completed' ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Information Card (Normal Mode Only) */}
          {!isSidebarCollapsed && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug">
                    {video.title}
                  </h1>

                  <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-muted)]">
                    {video.channel_name && (
                      <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                        <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span>{video.channel_name}</span>
                      </div>
                    )}

                    {durationSecs > 0 && (
                      <div className="flex items-center gap-1 font-mono">
                        <svg
                          className="w-3.5 h-3.5 text-[var(--text-muted)]"
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
                      <div className="flex items-center gap-1 font-mono">
                        <svg
                          className="w-3.5 h-3.5 text-[var(--text-muted)]"
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
                  {/* Focus Mode Toggle — desktop only */}
                  <FocusModeButton />

                  {/* Keyboard Shortcuts Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsShortcutsOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--surface-raised)] hover:border-[var(--accent)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
                    title="View Keyboard Shortcuts (?)"
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                    <span>Shortcuts</span>
                    <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono bg-[var(--surface)] border border-[var(--border-subtle)] rounded shadow-2xs">?</kbd>
                  </button>

                  {/* Open on YouTube */}
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--surface-raised)] hover:border-[var(--accent)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Open on YouTube</span>
                    <svg
                      className="w-3.5 h-3.5 text-[var(--text-muted)]"
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
          )}
        </div>

        {/* Right Column: Timestamp Notes Panel */}
        <div className={isSidebarCollapsed ? 'w-full flex flex-col min-h-0' : 'lg:col-span-4'}>
          <div
            className={`bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 shadow-xs transition-colors ${
              isSidebarCollapsed
                ? 'flex flex-col h-full lg:max-h-[calc(100vh-160px)] overflow-hidden'
                : 'space-y-4'
            }`}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
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
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Timestamp Notes</h2>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:opacity-90 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
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
                <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono bg-white/20 text-white rounded">n</kbd>
              </button>
            </div>

            {/* Note Composer Form Card */}
            <div className="shrink-0 pt-3">
              <AddNoteButton
                ref={addNoteRef}
                videoId={savedVideo.video_id}
                getCurrentTime={handleGetCurrentTime}
                onNoteCreated={handleNoteCreated}
              />
            </div>

            {/* Notes List (Independently scrollable in focus mode) */}
            <div className={isSidebarCollapsed ? 'flex-1 overflow-y-auto min-h-0 pt-3 pr-1' : 'pt-3'}>
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
      </div>

      {/* Persistent Bottom Video Information & Progress Strip (Focus Mode only) */}
      {isSidebarCollapsed && (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] px-4 sm:px-6 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                currentStatus === 'completed' ? 'bg-[var(--success)]' : 'bg-[var(--accent)] animate-pulse'
              }`}
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">
                {video.title}
              </h2>
              {video.channel_name && (
                <p className="text-[11px] text-[var(--text-muted)] truncate">
                  {video.channel_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3.5 shrink-0 sm:self-center">
            <div className="font-mono text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
              {currentProgressText} / {durationText}
              <span className="text-[var(--text-muted)] ml-1.5 font-normal">
                ({progressPercent}%)
              </span>
            </div>
            <div className="w-28 sm:w-44 h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className={`h-full rounded-full transition-all duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth-out)] ${
                  currentStatus === 'completed' ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Dialog */}
      <VideoShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  )
}
