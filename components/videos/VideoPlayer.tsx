'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { updateProgress } from '@/lib/actions/videos'
import { formatDuration } from '@/lib/youtube/client'
import FullscreenNotesOverlay from '@/components/videos/FullscreenNotesOverlay'
import type { SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'
import type { VideoTimestampNote } from '@/lib/data/timestampNotes'

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId?: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void
            onApiChange?: (event: { target: YTPlayerInstance }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YTPlayerInstance
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface YTPlayerInstance {
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  playVideo: () => void
  pauseVideo: () => void
  getPlayerState: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  getVolume: () => number
  setVolume: (volume: number) => void
  getPlaybackRate: () => number
  setPlaybackRate: (rate: number) => void
  getAvailablePlaybackRates?: () => number[]
  loadVideoById?: (videoId: string | { videoId: string; startSeconds?: number }, startSeconds?: number) => void
  cueVideoById?: (videoId: string | { videoId: string; startSeconds?: number }, startSeconds?: number) => void
  loadModule?: (module: string) => void
  unloadModule?: (module: string) => void
  setOption?: (module: string, option: string, value: unknown) => void
  getOption?: (module: string, option: string) => unknown
  getOptions?: (module?: string) => unknown[]
  getIframe?: () => HTMLIFrameElement
  destroy: () => void
}

export interface VideoPlayerRef {
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  seekToPercent: (percent: number) => void
  seekBy: (deltaSeconds: number) => void
  playVideo: () => void
  pauseVideo: () => void
  togglePlay: () => void
  toggleMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
  changeVolume: (delta: number) => void
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
  changePlaybackRate: (direction: 'increase' | 'decrease') => void
  toggleFullscreen: () => void
  isFullscreen: () => boolean
  showHudFeedback: (icon: string, text: string) => void
  openFullscreenNote: (explicitTimestamp?: number) => void
  closeFullscreenNote: () => void
  isFullscreenNoteOpen: () => boolean
}

export interface VideoPlayerProps {
  savedVideo: SavedVideoWithDetails
  currentStatus?: VideoStatus
  onStatusChange?: (status: VideoStatus) => void
  onProgressChange?: (progressSeconds: number) => void
  notes?: VideoTimestampNote[]
  onNoteCreated?: (note: VideoTimestampNote) => void
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

let apiLoadingPromise: Promise<void> | null = null

/**
 * Loads the YouTube IFrame API script once globally and resolves when window.YT.Player is available.
 */
function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve()
  }

  if (apiLoadingPromise) {
    return apiLoadingPromise
  }

  apiLoadingPromise = new Promise<void>((resolve) => {
    const isReady = () => Boolean(window.YT && window.YT.Player)

    if (isReady()) {
      resolve()
      return
    }

    let scriptTag = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null
    if (!scriptTag) {
      scriptTag = document.createElement('script')
      scriptTag.id = 'youtube-iframe-api'
      scriptTag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(scriptTag)
    }

    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) {
        try {
          prevCallback()
        } catch (e) {
          console.error('Error in previous onYouTubeIframeAPIReady callback:', e)
        }
      }
      if (isReady()) {
        resolve()
      }
    }

    const interval = setInterval(() => {
      if (isReady()) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })

  return apiLoadingPromise
}

function VideoPlayerComponent(
  {
    savedVideo,
    currentStatus,
    onStatusChange,
    onProgressChange,
    notes = [],
    onNoteCreated,
  }: VideoPlayerProps,
  ref: React.Ref<VideoPlayerRef>
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerSlotRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Internal state tracking refs for instant control & audio/rate consistency
  const isPlayingRef = useRef<boolean>(false)
  const currentVolumeRef = useRef<number>(100)
  const isMutedRef = useRef<boolean>(false)
  const currentPlaybackRateRef = useRef<number>(1)

  // Fullscreen state tracking
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isFullscreenRef = useRef(false)

  // Fullscreen note composer state
  const [isFullscreenNoteOpen, setIsFullscreenNoteOpen] = useState(false)
  const [fullscreenNoteTimestamp, setFullscreenNoteTimestamp] = useState(0)

  // HUD visual feedback state
  const [hudFeedback, setHudFeedback] = useState<{ icon: string; text: string } | null>(null)
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showHud = useCallback((icon: string, text: string) => {
    if (hudTimeoutRef.current) {
      clearTimeout(hudTimeoutRef.current)
    }
    setHudFeedback({ icon, text })
    hudTimeoutRef.current = setTimeout(() => {
      setHudFeedback(null)
      hudTimeoutRef.current = null
    }, 1200)
  }, [])

  // Use refs to avoid re-triggering player effects on parent state changes
  const savedVideoRef = useRef(savedVideo)
  const onStatusChangeRef = useRef(onStatusChange)
  const onProgressChangeRef = useRef(onProgressChange)
  const statusRef = useRef<VideoStatus>(currentStatus || savedVideo.status)
  const lastSavedTimeRef = useRef<number>(savedVideo.watch_progress_seconds || 0)
  const notesRef = useRef(notes)
  const onNoteCreatedRef = useRef(onNoteCreated)

  useEffect(() => {
    savedVideoRef.current = savedVideo
  }, [savedVideo])

  useEffect(() => {
    statusRef.current = currentStatus || savedVideo.status
  }, [currentStatus, savedVideo.status])

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange
  }, [onProgressChange])

  useEffect(() => {
    notesRef.current = notes
  }, [notes])

  useEffect(() => {
    onNoteCreatedRef.current = onNoteCreated
  }, [onNoteCreated])

  // Track Fullscreen changes & Keyboard Lock
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
        (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
      )
      setIsFullscreen(isFs)
      isFullscreenRef.current = isFs
      if (!isFs) {
        setIsFullscreenNoteOpen(false)
        if (
          typeof navigator !== 'undefined' &&
          'keyboard' in navigator &&
          typeof (navigator as unknown as { keyboard?: { unlock?: () => void } }).keyboard?.unlock === 'function'
        ) {
          try {
            ;(navigator as unknown as { keyboard: { unlock: () => void } }).keyboard.unlock()
          } catch {}
        }
      } else {
        if (
          typeof navigator !== 'undefined' &&
          'keyboard' in navigator &&
          typeof (navigator as unknown as { keyboard?: { lock?: (keys?: string[]) => Promise<void> } }).keyboard?.lock === 'function'
        ) {
          try {
            ;(navigator as unknown as { keyboard: { lock: (keys?: string[]) => Promise<void> } }).keyboard.lock(['Escape']).catch(() => {})
          } catch {}
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    document.addEventListener('mozfullscreenchange', handleFsChange)
    document.addEventListener('MSFullscreenChange', handleFsChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
      document.removeEventListener('mozfullscreenchange', handleFsChange)
      document.removeEventListener('MSFullscreenChange', handleFsChange)
    }
  }, [])

  const youtubeVideoId = savedVideo.video.youtube_video_id

  // Progress Update Dispatcher
  const handleProgressUpdate = useCallback((seconds: number, duration: number) => {
    const safeSec = Math.max(0, Math.floor(seconds))
    const safeDur = Math.max(0, Math.floor(duration))
    const currentSavedVideo = savedVideoRef.current

    // Avoid redundant progress updates
    if (Math.abs(safeSec - lastSavedTimeRef.current) < 1) {
      return
    }

    lastSavedTimeRef.current = safeSec

    if (onProgressChangeRef.current) {
      onProgressChangeRef.current(safeSec)
    }

    // Check for completion threshold (95%)
    if (
      safeDur > 0 &&
      safeSec >= safeDur * 0.95 &&
      statusRef.current !== 'completed'
    ) {
      statusRef.current = 'completed'
      if (onStatusChangeRef.current) {
        onStatusChangeRef.current('completed')
      }
    } else if (
      safeSec > 5 &&
      statusRef.current === 'saved'
    ) {
      const nextStatus: VideoStatus = 'in_progress'
      statusRef.current = nextStatus
      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(nextStatus)
      }
    }

    // Async save to database
    updateProgress(currentSavedVideo.id, safeSec, safeDur).catch((err) => {
      console.error('[StudySpace VideoPlayer] Failed to sync progress:', err)
    })
  }, [])

  const handleProgressUpdateRef = useRef(handleProgressUpdate)
  useEffect(() => {
    handleProgressUpdateRef.current = handleProgressUpdate
  }, [handleProgressUpdate])

  // Expose imperative API
  useImperativeHandle(
    ref,
    () => ({
      getCurrentTime: () => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const t = playerRef.current.getCurrentTime()
            if (typeof t === 'number' && !isNaN(t)) return t
          } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[StudySpace VideoPlayer] getCurrentTime error:', err)
            }
          }
        }
        return lastSavedTimeRef.current || 0
      },
      getDuration: () => {
        if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
          try {
            const d = playerRef.current.getDuration()
            if (typeof d === 'number' && !isNaN(d) && d > 0) return d
          } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[StudySpace VideoPlayer] getDuration error:', err)
            }
          }
        }
        return savedVideoRef.current.video.duration_seconds || 0
      },
      seekTo: (seconds: number, allowSeekAhead: boolean = true) => {
        const safeSec = Math.max(0, seconds)
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          try {
            playerRef.current.seekTo(safeSec, allowSeekAhead)
          } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[StudySpace VideoPlayer] seekTo error:', err)
            }
          }
        }
        lastSavedTimeRef.current = safeSec
        if (onProgressChangeRef.current) {
          onProgressChangeRef.current(safeSec)
        }
      },
      seekToPercent: (percent: number) => {
        let dur = 0
        if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
          try {
            const d = playerRef.current.getDuration()
            if (typeof d === 'number' && !isNaN(d) && d > 0) dur = d
          } catch {}
        }
        if (dur <= 0) {
          dur = savedVideoRef.current.video.duration_seconds || 0
        }
        if (dur > 0) {
          const clampedPercent = Math.max(0, Math.min(1, percent))
          const target = Math.max(0, Math.min(dur, Math.floor(dur * clampedPercent)))
          if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            try {
              playerRef.current.seekTo(target, true)
            } catch {}
          }
          lastSavedTimeRef.current = target
          if (onProgressChangeRef.current) {
            onProgressChangeRef.current(target)
          }
          showHud('📍', `${Math.round(clampedPercent * 100)}% (${formatDuration(target)})`)
        }
      },
      seekBy: (deltaSeconds: number) => {
        let cur = lastSavedTimeRef.current || 0
        let dur = savedVideoRef.current.video.duration_seconds || 0
        if (playerRef.current) {
          try {
            if (typeof playerRef.current.getCurrentTime === 'function') {
              const t = playerRef.current.getCurrentTime()
              if (typeof t === 'number' && !isNaN(t)) cur = t
            }
            if (typeof playerRef.current.getDuration === 'function') {
              const d = playerRef.current.getDuration()
              if (typeof d === 'number' && !isNaN(d) && d > 0) dur = d
            }
          } catch {}
        }
        const target = Math.max(0, Math.min(dur > 0 ? dur : Infinity, cur + deltaSeconds))
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          try {
            playerRef.current.seekTo(target, true)
          } catch {}
        }
        lastSavedTimeRef.current = Math.floor(target)
        if (onProgressChangeRef.current) {
          onProgressChangeRef.current(Math.floor(target))
        }
        const sign = deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`
        showHud(deltaSeconds > 0 ? '⏩' : '⏪', `${sign} (${formatDuration(Math.floor(target))})`)
      },
      playVideo: () => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          try {
            playerRef.current.playVideo()
          } catch {}
        }
        isPlayingRef.current = true
        showHud('▶️', 'Playing')
      },
      pauseVideo: () => {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          try {
            playerRef.current.pauseVideo()
          } catch {}
        }
        isPlayingRef.current = false
        showHud('⏸️', 'Paused')
      },
      togglePlay: () => {
        let isPlaying = isPlayingRef.current
        if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
          try {
            const state = playerRef.current.getPlayerState()
            // 1: PLAYING, 3: BUFFERING
            if (state === 1 || state === 3) {
              isPlaying = true
            } else if (state === 2 || state === 0 || state === 5 || state === -1) {
              isPlaying = false
            }
          } catch {}
        }
        if (isPlaying) {
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            try {
              playerRef.current.pauseVideo()
            } catch {}
          }
          isPlayingRef.current = false
          showHud('⏸️', 'Paused')
        } else {
          if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
            try {
              playerRef.current.playVideo()
            } catch {}
          }
          isPlayingRef.current = true
          showHud('▶️', 'Playing')
        }
      },
      toggleMute: () => {
        let isMuted = isMutedRef.current
        if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
          try {
            isMuted = playerRef.current.isMuted()
          } catch {}
        }
        if (isMuted) {
          if (playerRef.current && typeof playerRef.current.unMute === 'function') {
            try {
              playerRef.current.unMute()
            } catch {}
          }
          isMutedRef.current = false
          showHud('🔊', 'Unmuted')
        } else {
          if (playerRef.current && typeof playerRef.current.mute === 'function') {
            try {
              playerRef.current.mute()
            } catch {}
          }
          isMutedRef.current = true
          showHud('🔇', 'Muted')
        }
      },
      isMuted: () => {
        if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
          try {
            return playerRef.current.isMuted()
          } catch {}
        }
        return isMutedRef.current
      },
      setVolume: (volume: number) => {
        const safeVol = Math.max(0, Math.min(100, Math.round(volume)))
        currentVolumeRef.current = safeVol
        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
          try {
            playerRef.current.setVolume(safeVol)
          } catch {}
        }
        showHud(safeVol === 0 ? '🔇' : '🔊', `Volume ${safeVol}%`)
      },
      getVolume: () => {
        if (playerRef.current && typeof playerRef.current.getVolume === 'function') {
          try {
            const v = playerRef.current.getVolume()
            if (typeof v === 'number' && !isNaN(v)) return v
          } catch {}
        }
        return currentVolumeRef.current
      },
      changeVolume: (delta: number) => {
        let curVol = currentVolumeRef.current
        if (playerRef.current && typeof playerRef.current.getVolume === 'function') {
          try {
            const v = playerRef.current.getVolume()
            if (typeof v === 'number' && !isNaN(v)) curVol = v
          } catch {}
        }
        let isMuted = isMutedRef.current
        if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
          try {
            isMuted = playerRef.current.isMuted()
          } catch {}
        }

        const nextVol = Math.max(0, Math.min(100, Math.round(curVol + delta)))
        currentVolumeRef.current = nextVol

        if (delta > 0 && isMuted) {
          if (playerRef.current && typeof playerRef.current.unMute === 'function') {
            try {
              playerRef.current.unMute()
            } catch {}
          }
          isMutedRef.current = false
        }

        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
          try {
            playerRef.current.setVolume(nextVol)
          } catch {}
        }

        const icon = nextVol === 0 ? '🔇' : nextVol < 50 ? '🔉' : '🔊'
        showHud(icon, `Volume ${nextVol}%`)
      },
      setPlaybackRate: (rate: number) => {
        currentPlaybackRateRef.current = rate
        if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
          try {
            playerRef.current.setPlaybackRate(rate)
          } catch {}
        }
        showHud('⚡', `Speed ${rate}x`)
      },
      getPlaybackRate: () => {
        if (playerRef.current && typeof playerRef.current.getPlaybackRate === 'function') {
          try {
            const r = playerRef.current.getPlaybackRate()
            if (typeof r === 'number' && !isNaN(r) && r > 0) return r
          } catch {}
        }
        return currentPlaybackRateRef.current
      },
      changePlaybackRate: (direction: 'increase' | 'decrease') => {
        let curRate = currentPlaybackRateRef.current
        if (playerRef.current && typeof playerRef.current.getPlaybackRate === 'function') {
          try {
            const r = playerRef.current.getPlaybackRate()
            if (typeof r === 'number' && !isNaN(r) && r > 0) curRate = r
          } catch {}
        }
        let closestIdx = 0
        let minDiff = Infinity
        PLAYBACK_RATES.forEach((r, i) => {
          const diff = Math.abs(r - curRate)
          if (diff < minDiff) {
            minDiff = diff
            closestIdx = i
          }
        })
        const targetIdx =
          direction === 'increase'
            ? Math.min(PLAYBACK_RATES.length - 1, closestIdx + 1)
            : Math.max(0, closestIdx - 1)
        const nextRate = PLAYBACK_RATES[targetIdx]
        currentPlaybackRateRef.current = nextRate

        if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
          try {
            playerRef.current.setPlaybackRate(nextRate)
          } catch {}
        }

        showHud('⚡', `Speed ${nextRate}x`)
      },
      toggleFullscreen: () => {
        if (!containerRef.current) return
        const isFs = Boolean(
          document.fullscreenElement ||
          (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
          (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
          (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
        )

        if (!isFs) {
          const el = containerRef.current
          if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {})
          } else if ((el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
            (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen()
          } else if ((el as unknown as { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
            (el as unknown as { mozRequestFullScreen: () => void }).mozRequestFullScreen()
          } else if ((el as unknown as { msRequestFullscreen?: () => void }).msRequestFullscreen) {
            (el as unknown as { msRequestFullscreen: () => void }).msRequestFullscreen()
          }
          if (
            typeof navigator !== 'undefined' &&
            'keyboard' in navigator &&
            typeof (navigator as unknown as { keyboard?: { lock?: (keys?: string[]) => Promise<void> } }).keyboard?.lock === 'function'
          ) {
            try {
              ;(navigator as unknown as { keyboard: { lock: (keys?: string[]) => Promise<void> } }).keyboard.lock(['Escape']).catch(() => {})
            } catch {}
          }
          showHud('⛶', 'Fullscreen')
        } else {
          if (
            typeof navigator !== 'undefined' &&
            'keyboard' in navigator &&
            typeof (navigator as unknown as { keyboard?: { unlock?: () => void } }).keyboard?.unlock === 'function'
          ) {
            try {
              ;(navigator as unknown as { keyboard: { unlock: () => void } }).keyboard.unlock()
            } catch {}
          }
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {})
          } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
            (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen()
          } else if ((document as unknown as { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
            (document as unknown as { mozCancelFullScreen: () => void }).mozCancelFullScreen()
          } else if ((document as unknown as { msExitFullscreen?: () => void }).msExitFullscreen) {
            (document as unknown as { msExitFullscreen: () => void }).msExitFullscreen()
          }
          showHud('⛶', 'Exit Fullscreen')
        }
      },
      isFullscreen: () => isFullscreenRef.current,
      showHudFeedback: (icon: string, text: string) => {
        showHud(icon, text)
      },
      openFullscreenNote: (explicitTimestamp?: number) => {
        let t = typeof explicitTimestamp === 'number' ? explicitTimestamp : 0
        if (typeof explicitTimestamp !== 'number') {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            try {
              t = playerRef.current.getCurrentTime()
            } catch {}
          }
          if (!t) t = lastSavedTimeRef.current || 0
        }
        setFullscreenNoteTimestamp(Math.max(0, Math.floor(t)))
        setIsFullscreenNoteOpen(true)
      },
      closeFullscreenNote: () => {
        setIsFullscreenNoteOpen(false)
      },
      isFullscreenNoteOpen: () => isFullscreenNoteOpen,
    }),
    [showHud, isFullscreenNoteOpen]
  )

  // Initialize YouTube Iframe Player strictly per videoId
  useEffect(() => {
    let isMounted = true

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[StudySpace VideoPlayer] Setting up YouTube player for:', youtubeVideoId)
    }

    const isCompleted = savedVideoRef.current.status === 'completed'
    const durationSecs = savedVideoRef.current.video.duration_seconds || 0
    const isNearEnd =
      durationSecs > 0 &&
      (savedVideoRef.current.watch_progress_seconds || 0) >= durationSecs * 0.95

    const startSeconds =
      isCompleted || isNearEnd
        ? 0
        : Math.max(0, Math.floor(savedVideoRef.current.watch_progress_seconds || 0))

    loadYouTubeIframeApi().then(() => {
      if (!isMounted || !playerSlotRef.current) {
        return
      }

      // If a player instance already exists, reuse it and update video without destroying
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.loadVideoById === 'function') {
            playerRef.current.loadVideoById(youtubeVideoId, startSeconds)
            return
          }
        } catch {
          // If update failed, proceed to recreate
        }
      }

      try {
        const originUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const playerInstance = new window.YT!.Player(playerSlotRef.current, {
          videoId: youtubeVideoId,
          playerVars: {
            enablejsapi: 1,
            rel: 0,
            playsinline: 1,
            start: startSeconds,
            origin: originUrl,
            cc_lang_pref: 'en',
            cc_load_policy: 1,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return
              if (process.env.NODE_ENV !== 'production') {
                console.debug('[StudySpace VideoPlayer] YouTube player onReady fired')
              }
              playerRef.current = event.target
            },
            onStateChange: (event) => {
              if (!isMounted || !event.target) return

              const playerState = event.data
              const YT = window.YT
              if (!YT) return

              if (process.env.NODE_ENV !== 'production') {
                console.debug('[StudySpace VideoPlayer] Player state changed:', playerState)
              }

              // PLAYING
              if (playerState === YT.PlayerState.PLAYING) {
                isPlayingRef.current = true

                const currentTime = event.target.getCurrentTime()
                const duration = event.target.getDuration()

                if (statusRef.current === 'saved') {
                  handleProgressUpdateRef.current(currentTime, duration)
                }

                if (intervalRef.current) clearInterval(intervalRef.current)
                intervalRef.current = setInterval(() => {
                  if (playerRef.current && isMounted) {
                    const t = playerRef.current.getCurrentTime()
                    const d = playerRef.current.getDuration()
                    handleProgressUpdateRef.current(t, d)
                  }
                }, 10000)
              }
              // PAUSED or BUFFERING
              else if (
                playerState === YT.PlayerState.PAUSED ||
                playerState === YT.PlayerState.BUFFERING
              ) {
                isPlayingRef.current = false
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }
                const currentTime = event.target.getCurrentTime()
                const duration = event.target.getDuration()
                handleProgressUpdateRef.current(currentTime, duration)
              }
              // ENDED
              else if (playerState === YT.PlayerState.ENDED) {
                isPlayingRef.current = false
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }
                const duration =
                  event.target.getDuration() || savedVideoRef.current.video.duration_seconds || 0
                handleProgressUpdateRef.current(duration, duration)
              }
            },
          },
        })

        if (!playerRef.current && playerInstance) {
          playerRef.current = playerInstance
        }
      } catch (err) {
        console.error('[StudySpace VideoPlayer] Error instantiating YouTube Player API:', err)
      }
    })

    return () => {
      isMounted = false

      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current)
        hudTimeoutRef.current = null
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (playerRef.current) {
        try {
          const finalTime = playerRef.current.getCurrentTime()
          const finalDur = playerRef.current.getDuration()
          if (finalTime > 0) {
            updateProgress(
              savedVideoRef.current.id,
              Math.round(finalTime),
              Math.round(finalDur)
            )
          }
          playerRef.current.destroy()
        } catch {
          // Ignored
        }
        playerRef.current = null
      }
    }
  }, [youtubeVideoId])

  const handleFullscreenSeek = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true)
    }
    lastSavedTimeRef.current = seconds
    if (onProgressChangeRef.current) {
      onProgressChangeRef.current(seconds)
    }
  }, [])

  const handleFullscreenNoteCreated = useCallback((newNote: VideoTimestampNote) => {
    if (onNoteCreatedRef.current) {
      onNoteCreatedRef.current(newNote)
    }
    showHud('📝', `Note added at ${formatDuration(newNote.timestamp_seconds)}`)
  }, [showHud])

  return (
    <div
      ref={containerRef}
      className="bg-black rounded-2xl overflow-hidden shadow-md aspect-video w-full relative group [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:rounded-none [&:fullscreen]:aspect-auto [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:-webkit-full-screen]:w-screen [&:-webkit-full-screen]:h-screen [&:-webkit-full-screen]:rounded-none [&:-webkit-full-screen]:aspect-auto"
    >
      {/* YouTube Player mounting slot */}
      <div
        ref={playerSlotRef}
        id={`youtube-player-slot-${youtubeVideoId}`}
        className="w-full h-full"
      />

      {/* Interactive HUD Overlay for Keyboard Shortcuts Feedback */}
      {hudFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-fadeIn">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md text-white text-sm font-semibold shadow-2xl border border-white/20 animate-scaleUp">
            <span className="text-base leading-none">{hudFeedback.icon}</span>
            <span>{hudFeedback.text}</span>
          </div>
        </div>
      )}

      {/* Fullscreen Timestamp Note Taking Overlay */}
      {isFullscreen && isFullscreenNoteOpen && (
        <FullscreenNotesOverlay
          isOpen={isFullscreenNoteOpen}
          capturedSeconds={fullscreenNoteTimestamp}
          videoId={savedVideo.video_id}
          notes={notes}
          onClose={() => setIsFullscreenNoteOpen(false)}
          onNoteCreated={handleFullscreenNoteCreated}
          onSeek={handleFullscreenSeek}
        />
      )}
    </div>
  )
}

const VideoPlayer = memo(forwardRef<VideoPlayerRef, VideoPlayerProps>(VideoPlayerComponent))
export default VideoPlayer
