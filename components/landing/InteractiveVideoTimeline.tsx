'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, RotateCcw, Clock, AlertCircle } from 'lucide-react'

interface LectureNote {
  sec: number
  time: string
  title: string
}

const NOTES: LectureNote[] = [
  { sec: 252, time: '04:12', title: 'DFS traversal recursion stack explanation' },
  { sec: 570, time: '09:30', title: 'Visited set prevents infinite cycles' },
  { sec: 1122, time: '18:42', title: 'Adjacency list vs matrix space complexity' },
  { sec: 1560, time: '26:00', title: 'Breadth-first search queue implementation' },
]

const TOTAL_DURATION = 1930 // 32:10 in seconds
const VIDEO_ID = '8jLOx1hD3_o'

// YT player state constants
const YT_PLAYING = 1
const YT_PAUSED = 2
const YT_ENDED = 0

type PlayerState = 'idle' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'

interface YTPlayerInstance {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo: () => void
  getCurrentTime: () => number
  getPlayerState: () => number
  destroy: () => void
}

// Local typed helper to access window.YT without conflicting global declarations
type YTWindow = {
  YT: {
    Player: new (el: string | HTMLElement, opts: Record<string, unknown>) => YTPlayerInstance
  }
  onYouTubeIframeAPIReady?: () => void
}
const ytWindow = () => window as unknown as YTWindow


export default function InteractiveVideoTimeline() {
  const [currentSeconds, setCurrentSeconds] = useState(1122)
  const [playerState, setPlayerState] = useState<PlayerState>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [isApiReady, setIsApiReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return !!(window as unknown as YTWindow).YT?.Player
  })
  const trackRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  // Queue an action if player is not ready yet
  const pendingActionRef = useRef<(() => void) | null>(null)
  // Track interval for progress updates while playing
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const startProgressPolling = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const t = playerRef.current.getCurrentTime()
          if (typeof t === 'number') setCurrentSeconds(Math.floor(t))
        } catch {
          // player may be destroyed
        }
      }
    }, 500)
  }, [])

  const stopProgressPolling = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  // Load YT IFrame API script once
  useEffect(() => {
    if (ytWindow().YT?.Player) {
      return
    }

    // Set callback before loading script
    const existingCallback = ytWindow().onYouTubeIframeAPIReady
    ytWindow().onYouTubeIframeAPIReady = () => {
      existingCallback?.()
      setIsApiReady(true)
    }

    if (!document.getElementById('yt-iframe-api')) {
      const script = document.createElement('script')
      script.id = 'yt-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }

    return () => {
      // Don't remove script — other components may need it
    }
  }, [])

  // Create YT.Player once API is ready and container exists
  useEffect(() => {
    if (!isApiReady || !iframeContainerRef.current) return

    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://studyspace4u.app'

    const placeholderId = 'yt-player-placeholder'
    // Create placeholder div inside the container
    const placeholder = document.createElement('div')
    placeholder.id = placeholderId
    placeholder.style.width = '100%'
    placeholder.style.height = '100%'
    iframeContainerRef.current.appendChild(placeholder)

    playerRef.current = new (ytWindow().YT.Player)(placeholderId, {
      videoId: VIDEO_ID,
      playerVars: {
        start: 1122,
        autoplay: 0,
        mute: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin,
      },
      events: {
        onReady: () => {
          // Execute any queued action
          if (pendingActionRef.current) {
            pendingActionRef.current()
            pendingActionRef.current = null
          }
        },
        onStateChange: (event: { data: number }) => {
          const state = event.data
          if (state === YT_PLAYING) {
            setPlayerState('playing')
            startProgressPolling()
          } else if (state === YT_PAUSED) {
            setPlayerState('paused')
            stopProgressPolling()
            try {
              const t = playerRef.current?.getCurrentTime()
              if (typeof t === 'number') setCurrentSeconds(Math.floor(t))
            } catch { /* ignore */ }
          } else if (state === YT_ENDED) {
            setPlayerState('ended')
            stopProgressPolling()
          } else if (state === 3) {
            setPlayerState('buffering')
          }
        },
        onError: () => {
          setPlayerState('error')
          stopProgressPolling()
        },
      },
    })

    return () => {
      stopProgressPolling()
      try {
        playerRef.current?.destroy()
        playerRef.current = null
      } catch { /* ignore */ }
    }
  }, [isApiReady, startProgressPolling, stopProgressPolling])

  const seekAndPlay = useCallback((seconds: number) => {
    setCurrentSeconds(seconds)
    const doAction = () => {
      try {
        playerRef.current?.seekTo(seconds, true)
        playerRef.current?.playVideo()
      } catch { /* ignore */ }
    }
    if (playerRef.current) {
      doAction()
    } else {
      pendingActionRef.current = doAction
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return
    try {
      const state = playerRef.current.getPlayerState()
      if (state === YT_PLAYING) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    } catch { /* ignore */ }
  }, [])

  const isPlaying = playerState === 'playing' || playerState === 'buffering'

  const updateFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newSecs = Math.round(ratio * TOTAL_DURATION)
    setCurrentSeconds(newSecs)
    // Don't seek while dragging — seek only on release
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    updateFromPointer(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Safe fallback
      }
      // Seek on release
      seekAndPlay(currentSeconds)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let delta = 0
    if (e.key === 'ArrowRight') delta = 5
    else if (e.key === 'ArrowLeft') delta = -5
    else if (e.key === 'PageUp') delta = 30
    else if (e.key === 'PageDown') delta = -30
    else if (e.key === 'Home') {
      seekAndPlay(0)
      return
    } else if (e.key === 'End') {
      seekAndPlay(TOTAL_DURATION)
      return
    }

    if (delta !== 0) {
      e.preventDefault()
      const newSecs = Math.max(0, Math.min(TOTAL_DURATION, currentSeconds + delta))
      seekAndPlay(newSecs)
    }
  }

  const progressPercent = (currentSeconds / TOTAL_DURATION) * 100

  const activeNoteIndex = NOTES.reduce((acc, note, idx) => {
    return note.sec <= currentSeconds ? idx : acc
  }, 0)

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 overflow-hidden p-4 sm:p-5 text-slate-900 dark:text-zinc-100 shadow-xl transition-colors">
      {/* Header Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-3 font-mono">
        <span className="truncate max-w-[280px] font-semibold text-slate-800 dark:text-zinc-200">
          Data Structures &amp; Algorithms · Lecture 14
        </span>
        <span className="px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-[10px] font-bold border border-violet-200 dark:border-violet-800/80">
          YOUTUBE LECTURE HUB
        </span>
      </div>

      {/* YouTube IFrame container — never re-mounts; YT.Player manages the iframe */}
      <div className="relative aspect-video rounded-xl bg-black border border-slate-200 dark:border-zinc-800 mb-4 overflow-hidden shadow-inner">
        {playerState === 'error' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 text-center px-6">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-semibold text-zinc-200">Video unavailable in this region</p>
            <p className="text-xs text-zinc-400">
              This embed may be restricted. Try opening in YouTube directly.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${VIDEO_ID}&t=${currentSeconds}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
            >
              Open in YouTube
            </a>
          </div>
        ) : (
          <div ref={iframeContainerRef} className="absolute inset-0 w-full h-full" />
        )}

        {/* Floating Controls Overlay */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayPause}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
              aria-label={isPlaying ? 'Pause lecture' : 'Play lecture'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Lecture'}</span>
            </button>
            <span className="hidden sm:inline-block font-sans text-[11px] text-zinc-200 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 truncate max-w-[220px]">
              {NOTES[activeNoteIndex]?.title}
            </span>
          </div>

          <div className="pointer-events-auto font-mono text-[10.5px] text-zinc-300 bg-black/75 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-violet-400" />
            <span>{formatTime(currentSeconds)}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-400">32:10</span>
          </div>
        </div>
      </div>

      {/* Draggable Timeline Track */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono mb-1.5">
          <span className="text-violet-600 dark:text-violet-400 font-bold">{formatTime(currentSeconds)}</span>
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Drag the timeline, or click a note
          </span>
          <span>{formatTime(TOTAL_DURATION)}</span>
        </div>

        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative h-6 flex items-center cursor-pointer select-none group touch-none"
          style={{ touchAction: 'none' }}
        >
          {/* Background Track */}
          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
            {/* Active Progress Fill */}
            <div
              className="h-full bg-violet-600 rounded-full transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Note Marker Ticks */}
          {NOTES.map((n) => {
            const notePos = (n.sec / TOTAL_DURATION) * 100
            return (
              <div
                key={n.sec}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-amber-400 rounded-full pointer-events-none z-10"
                style={{ left: `${notePos}%` }}
                title={`Note at ${n.time}: ${n.title}`}
              />
            )
          })}

          {/* Draggable Thumb */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuenow={currentSeconds}
            aria-valuemin={0}
            aria-valuemax={TOTAL_DURATION}
            aria-label="Video Seek Timeline"
            onKeyDown={handleKeyDown}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 z-20 ${isDragging ? 'scale-110' : ''}`}
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md border-2 border-violet-600 group-hover:scale-125 transition-transform" />
          </div>
        </div>
      </div>

      {/* Timestamp Note Cards — clicking seeks and plays */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 block mb-1">
          Pinned Lecture Notes (Click to jump):
        </span>
        {NOTES.map((note, idx) => {
          const isActive = idx === activeNoteIndex
          return (
            <button
              key={note.sec}
              type="button"
              onClick={() => seekAndPlay(note.sec)}
              className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-violet-50 dark:bg-violet-950/80 border border-violet-600 text-violet-700 dark:text-violet-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-300'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {note.time}
                </span>
                <span className="truncate">{note.title}</span>
              </span>
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono ml-2 shrink-0 font-medium">
                {isActive ? '● Playing' : 'Jump →'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Resume from saved timestamp */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => seekAndPlay(1122)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resume from 18:42</span>
        </button>
        <span className="text-slate-400 dark:text-zinc-500 font-mono text-[10.5px]">Auto-saved note context</span>
      </div>
    </div>
  )
}
