'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useTransition,
  useCallback,
} from 'react'
import { createSessionAction, completeSessionAction } from '@/lib/actions/pomodoro'
import type { UserSettings, SessionType } from '@/lib/data/pomodoro'
import { playCompletionChime, sendBrowserNotification } from '@/lib/pomodoro/sound'

export interface PomodoroCompletionInfo {
  completedType: SessionType
  nextType: SessionType
  durationMinutes: number
  cycleCount: number
  totalCycles: number
  timestamp: number
}

export interface TimerState {
  sessionId: string | null
  sessionType: SessionType
  plannedSeconds: number
  remainingSeconds: number
  isRunning: boolean
  isPaused: boolean
  cycleCount: number
  settings: UserSettings
  completionInfo: PomodoroCompletionInfo | null
  soundEnabled: boolean
}

export interface TimerContextType extends TimerState {
  startSession: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  setMode: (mode: SessionType) => void
  adjustDuration: (deltaMinutes: number) => void
  updateSettings: (newSettings: UserSettings) => void
  formatTimeDisplay: (seconds: number) => string
  dismissCompletion: () => void
  startNextSession: () => void
  setSoundEnabled: (enabled: boolean) => void
}

const TimerContext = createContext<TimerContextType | null>(null)

export function useTimer(): TimerContextType {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}

export function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const SOUND_STORAGE_KEY = 'studyspace_pomodoro_sound'

export function TimerProvider({
  initialSettings,
  children,
}: {
  initialSettings: UserSettings
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [sessionType, setSessionType] = useState<SessionType>('focus')
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [plannedSeconds, setPlannedSeconds] = useState<number>(
    initialSettings.pomodoro_duration * 60
  )
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    initialSettings.pomodoro_duration * 60
  )
  const [cycleCount, setCycleCount] = useState<number>(0)
  const [completionInfo, setCompletionInfo] = useState<PomodoroCompletionInfo | null>(null)
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SOUND_STORAGE_KEY)
        if (stored !== null) {
          return stored === 'true'
        }
      } catch {
        // Ignore localStorage access issues in restricted environments
      }
    }
    return true
  })
  const [, startTransition] = useTransition()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const remainingOnStartRef = useRef<number>(initialSettings.pomodoro_duration * 60)
  const sessionIdRef = useRef<string | null>(null)
  const createPromiseRef = useRef<Promise<string | null> | null>(null)
  const plannedSecondsRef = useRef<number>(initialSettings.pomodoro_duration * 60)
  const sessionTypeRef = useRef<SessionType>('focus')
  const cycleCountRef = useRef<number>(0)
  const settingsRef = useRef<UserSettings>(initialSettings)
  const isCompletingRef = useRef<boolean>(false)
  const soundEnabledRef = useRef<boolean>(soundEnabled)

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled)
    soundEnabledRef.current = enabled
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(enabled))
    } catch {
      // Ignore localStorage access issues
    }
  }, [])

  // Synchronize refs with state for reliable interval & background callbacks
  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  useEffect(() => {
    plannedSecondsRef.current = plannedSeconds
  }, [plannedSeconds])

  useEffect(() => {
    sessionTypeRef.current = sessionType
  }, [sessionType])

  useEffect(() => {
    cycleCountRef.current = cycleCount
  }, [cycleCount])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const getDefaultDurationForMode = useCallback((m: SessionType, s: UserSettings): number => {
    switch (m) {
      case 'focus':
        return s.pomodoro_duration * 60
      case 'short_break':
        return s.short_break_duration * 60
      case 'long_break':
        return s.long_break_duration * 60
    }
  }, [])

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Document title updates while active
  useEffect(() => {
    if (timerStatus === 'running' || timerStatus === 'paused') {
      const modeLabel =
        sessionType === 'focus'
          ? 'Focus'
          : sessionType === 'short_break'
          ? 'Short Break'
          : 'Long Break'
      document.title = `(${formatTimeDisplay(remainingSeconds)}) ${modeLabel} | StudySpace`
    }
  }, [remainingSeconds, timerStatus, sessionType])

  // Session completion handler (natural countdown to 0)
  const handleSessionComplete = useCallback(() => {
    // Idempotency check to prevent duplicate completion executions
    if (isCompletingRef.current) return
    isCompletingRef.current = true

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const planned = plannedSecondsRef.current
    const currentMode = sessionTypeRef.current
    const currentCycle = cycleCountRef.current
    const currentSettings = settingsRef.current
    const currentSessionPromise = createPromiseRef.current
    const currentSessionId = sessionIdRef.current

    // Safely record session completion in database
    startTransition(async () => {
      let resolvedId = currentSessionId
      if (!resolvedId && currentSessionPromise) {
        resolvedId = await currentSessionPromise
      }

      if (resolvedId) {
        try {
          await completeSessionAction({
            id: resolvedId,
            actualSeconds: planned,
            status: 'completed',
          })
        } catch (err) {
          console.error('StudySpace: Failed to save completed pomodoro session:', err)
        }
      }
    })

    // Determine next mode and cycle count
    let nextMode: SessionType = 'focus'
    let nextCycle = currentCycle

    if (currentMode === 'focus') {
      const completedFocusCount = currentCycle + 1
      if (completedFocusCount >= currentSettings.long_break_interval) {
        nextMode = 'long_break'
        nextCycle = 0
      } else {
        nextMode = 'short_break'
        nextCycle = completedFocusCount
      }
    } else if (currentMode === 'long_break') {
      nextMode = 'focus'
      nextCycle = 0
    } else {
      // short break completed
      nextMode = 'focus'
      nextCycle = currentCycle
    }

    const nextDuration = getDefaultDurationForMode(nextMode, currentSettings)
    setSessionType(nextMode)
    setCycleCount(nextCycle)
    setTimerStatus('idle')
    setSessionId(null)
    sessionIdRef.current = null
    createPromiseRef.current = null
    setPlannedSeconds(nextDuration)
    setRemainingSeconds(nextDuration)

    // Trigger visual completion modal state
    const completionData: PomodoroCompletionInfo = {
      completedType: currentMode,
      nextType: nextMode,
      durationMinutes: Math.max(1, Math.round(planned / 60)),
      cycleCount: currentMode === 'focus' ? currentCycle + 1 : currentCycle,
      totalCycles: currentSettings.long_break_interval,
      timestamp: Date.now(),
    }
    setCompletionInfo(completionData)

    // Trigger audio chime if sound is enabled
    if (soundEnabledRef.current) {
      playCompletionChime()
    }

    // Trigger desktop browser notification if granted
    const notifTitle =
      currentMode === 'focus'
        ? 'Pomodoro Complete! 🎉'
        : currentMode === 'short_break'
        ? 'Short Break Finished! ⚡'
        : 'Long Break Finished! 🏆'

    const notifBody =
      currentMode === 'focus'
        ? nextMode === 'long_break'
          ? 'Great focus session! Time for a well-deserved 15-minute long break.'
          : 'Great focus session! Take a short 5-minute break to recharge.'
        : 'Break is over. Ready to start your next focus session?'

    sendBrowserNotification(notifTitle, {
      body: notifBody,
      tag: `studyspace-pomodoro-${Date.now()}`,
    })
  }, [getDefaultDurationForMode])

  // Handle visibility & window focus changes to prevent timer drift after tab backgrounding
  useEffect(() => {
    const handleSyncOnResume = () => {
      if (
        document.visibilityState === 'visible' &&
        startTimeRef.current !== null &&
        !isCompletingRef.current
      ) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const updatedRemaining = Math.max(0, remainingOnStartRef.current - elapsed)
        setRemainingSeconds(updatedRemaining)

        if (updatedRemaining <= 0) {
          handleSessionComplete()
        }
      }
    }

    document.addEventListener('visibilitychange', handleSyncOnResume)
    window.addEventListener('focus', handleSyncOnResume)
    return () => {
      document.removeEventListener('visibilitychange', handleSyncOnResume)
      window.removeEventListener('focus', handleSyncOnResume)
    }
  }, [handleSessionComplete])

  // Start / Resume session
  const resume = useCallback(() => {
    isCompletingRef.current = false
    startTimeRef.current = Date.now()
    remainingOnStartRef.current = remainingSeconds
    setTimerStatus('running')

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const updatedRemaining = Math.max(0, remainingOnStartRef.current - elapsed)
      setRemainingSeconds(updatedRemaining)

      if (updatedRemaining <= 0) {
        handleSessionComplete()
      }
    }, 250)
  }, [remainingSeconds, handleSessionComplete])

  const startSession = useCallback(() => {
    if (timerStatus === 'idle') {
      isCompletingRef.current = false
      const currentPlanned = remainingSeconds
      setPlannedSeconds(currentPlanned)

      // Start asynchronous creation promise
      const promise = (async () => {
        try {
          const res = await createSessionAction({
            sessionType,
            plannedSeconds: currentPlanned,
          })

          if (res.success && res.data) {
            setSessionId(res.data.id)
            sessionIdRef.current = res.data.id
            return res.data.id
          }
        } catch (err) {
          console.error('StudySpace: Failed to create pomodoro session:', err)
        }
        return null
      })()

      createPromiseRef.current = promise

      startTimeRef.current = Date.now()
      remainingOnStartRef.current = currentPlanned
      setTimerStatus('running')

      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        if (!startTimeRef.current) return
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const updatedRemaining = Math.max(0, remainingOnStartRef.current - elapsed)
        setRemainingSeconds(updatedRemaining)

        if (updatedRemaining <= 0) {
          handleSessionComplete()
        }
      }, 250)
    } else if (timerStatus === 'paused') {
      resume()
    }
  }, [timerStatus, remainingSeconds, sessionType, handleSessionComplete, resume])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerStatus('paused')
  }, [])

  const reset = useCallback(() => {
    isCompletingRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const currentSessionId = sessionIdRef.current
    const currentSessionPromise = createPromiseRef.current
    if (timerStatus !== 'idle') {
      const elapsedSeconds = Math.max(0, plannedSeconds - remainingSeconds)
      startTransition(async () => {
        let resolvedId = currentSessionId
        if (!resolvedId && currentSessionPromise) {
          resolvedId = await currentSessionPromise
        }
        if (resolvedId) {
          try {
            await completeSessionAction({
              id: resolvedId,
              actualSeconds: elapsedSeconds,
              status: 'cancelled',
            })
          } catch (err) {
            console.error('StudySpace: Failed to cancel session:', err)
          }
        }
      })
    }

    const defaultDuration = getDefaultDurationForMode(sessionType, settings)
    setTimerStatus('idle')
    setSessionId(null)
    sessionIdRef.current = null
    createPromiseRef.current = null
    setPlannedSeconds(defaultDuration)
    setRemainingSeconds(defaultDuration)
  }, [timerStatus, plannedSeconds, remainingSeconds, sessionType, settings, getDefaultDurationForMode])

  const skip = useCallback(() => {
    isCompletingRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const currentSessionId = sessionIdRef.current
    const currentSessionPromise = createPromiseRef.current
    if (timerStatus !== 'idle') {
      const elapsedSeconds = Math.max(0, plannedSeconds - remainingSeconds)
      startTransition(async () => {
        let resolvedId = currentSessionId
        if (!resolvedId && currentSessionPromise) {
          resolvedId = await currentSessionPromise
        }
        if (resolvedId) {
          try {
            await completeSessionAction({
              id: resolvedId,
              actualSeconds: elapsedSeconds,
              status: 'cancelled',
            })
          } catch (err) {
            console.error('StudySpace: Failed to skip session:', err)
          }
        }
      })
    }

    let nextMode: SessionType = 'focus'
    let nextCycle = cycleCount

    if (sessionType === 'focus') {
      const completedFocusCount = cycleCount + 1
      if (completedFocusCount >= settings.long_break_interval) {
        nextMode = 'long_break'
        nextCycle = 0
      } else {
        nextMode = 'short_break'
        nextCycle = completedFocusCount
      }
    } else {
      nextMode = 'focus'
    }

    const nextDuration = getDefaultDurationForMode(nextMode, settings)
    setSessionType(nextMode)
    setCycleCount(nextCycle)
    setTimerStatus('idle')
    setSessionId(null)
    sessionIdRef.current = null
    createPromiseRef.current = null
    setPlannedSeconds(nextDuration)
    setRemainingSeconds(nextDuration)
  }, [timerStatus, plannedSeconds, remainingSeconds, sessionType, cycleCount, settings, getDefaultDurationForMode])

  const setMode = useCallback((newMode: SessionType) => {
    if (timerStatus !== 'idle') {
      const confirmSwitch = window.confirm(
        'A session is currently in progress. Switching modes will cancel it. Continue?'
      )
      if (!confirmSwitch) return

      isCompletingRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      const currentSessionId = sessionIdRef.current
      const currentSessionPromise = createPromiseRef.current
      const elapsedSeconds = Math.max(0, plannedSeconds - remainingSeconds)
      startTransition(async () => {
        let resolvedId = currentSessionId
        if (!resolvedId && currentSessionPromise) {
          resolvedId = await currentSessionPromise
        }
        if (resolvedId) {
          try {
            await completeSessionAction({
              id: resolvedId,
              actualSeconds: elapsedSeconds,
              status: 'cancelled',
            })
          } catch (err) {
            console.error('StudySpace: Failed to cancel session on mode switch:', err)
          }
        }
      })
    }

    const defaultDuration = getDefaultDurationForMode(newMode, settings)
    setSessionType(newMode)
    setTimerStatus('idle')
    setSessionId(null)
    sessionIdRef.current = null
    createPromiseRef.current = null
    setPlannedSeconds(defaultDuration)
    setRemainingSeconds(defaultDuration)
  }, [timerStatus, plannedSeconds, remainingSeconds, settings, getDefaultDurationForMode])

  const adjustDuration = useCallback((deltaMinutes: number) => {
    const newSeconds = Math.max(60, Math.min(180 * 60, remainingSeconds + deltaMinutes * 60))
    if (timerStatus === 'idle') {
      setPlannedSeconds(newSeconds)
      setRemainingSeconds(newSeconds)
    } else {
      setPlannedSeconds((prev) => Math.max(60, prev + deltaMinutes * 60))
      setRemainingSeconds(newSeconds)
      remainingOnStartRef.current = newSeconds
      startTimeRef.current = Date.now()
    }
  }, [timerStatus, remainingSeconds])

  const updateSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings)
    if (timerStatus === 'idle') {
      const defaultDuration = getDefaultDurationForMode(sessionType, newSettings)
      setPlannedSeconds(defaultDuration)
      setRemainingSeconds(defaultDuration)
    }
  }, [timerStatus, sessionType, getDefaultDurationForMode])

  const dismissCompletion = useCallback(() => {
    setCompletionInfo(null)
  }, [])

  const startNextSession = useCallback(() => {
    setCompletionInfo(null)
    // Small timeout to allow state to settle and then start the new session
    setTimeout(() => {
      isCompletingRef.current = false
      setTimerStatus((curr) => {
        if (curr === 'idle') {
          // Trigger start
          return 'idle'
        }
        return curr
      })
      startSession()
    }, 50)
  }, [startSession])

  const value: TimerContextType = {
    sessionId,
    sessionType,
    plannedSeconds,
    remainingSeconds,
    isRunning: timerStatus === 'running',
    isPaused: timerStatus === 'paused',
    cycleCount,
    settings,
    completionInfo,
    soundEnabled,
    startSession,
    pause,
    resume,
    reset,
    skip,
    setMode,
    adjustDuration,
    updateSettings,
    formatTimeDisplay,
    dismissCompletion,
    startNextSession,
    setSoundEnabled,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}
