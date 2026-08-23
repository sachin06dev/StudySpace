/**
 * Web Audio API chime synthesis & Browser Notification utilities for StudySpace Pomodoro.
 * Guarantees zero external asset dependencies, zero network requests, and smooth error tolerance.
 */

// Play a pleasant, melodic harmonic chime using Web Audio API synthesis
export function playCompletionChime(): void {
  if (typeof window === 'undefined') return

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

    if (!AudioContextClass) return

    const ctx = new AudioContextClass()

    // Harmonic chime chords: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5]
    const startTime = ctx.currentTime + 0.05

    notes.forEach((freq, index) => {
      const noteStart = startTime + index * 0.12
      const noteDuration = 0.85

      // Primary tone
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Use a blend of sine and triangle for soft, rich bell resonance
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)

      // Natural acoustic bell gain envelope: fast attack, exponential decay
      gain.gain.setValueAtTime(0.0001, noteStart)
      gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(noteStart)
      osc.stop(noteStart + noteDuration + 0.05)

      // Add a subtle harmonic overtone for richness
      const overtoneOsc = ctx.createOscillator()
      const overtoneGain = ctx.createGain()

      overtoneOsc.type = 'triangle'
      overtoneOsc.frequency.setValueAtTime(freq * 2, noteStart)

      overtoneGain.gain.setValueAtTime(0.0001, noteStart)
      overtoneGain.gain.linearRampToValueAtTime(0.04, noteStart + 0.015)
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.4)

      overtoneOsc.connect(overtoneGain)
      overtoneGain.connect(ctx.destination)

      overtoneOsc.start(noteStart)
      overtoneOsc.stop(noteStart + 0.45)
    })

    // Clean up AudioContext after all notes finish
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {})
      }
    }, 2000)
  } catch (err) {
    // Non-fatal: Autoplay restrictions or unavailable audio context
    console.warn('StudySpace: Completion chime playback skipped:', err)
  }
}

/**
 * Send a desktop browser notification if permission is granted.
 */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string
    icon?: string
    tag?: string
  }
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: options?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        body: options?.body,
        tag: options?.tag || 'studyspace-pomodoro',
        silent: false,
      })

      // Focus window when notification is clicked
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  } catch (err) {
    console.warn('StudySpace: Browser notification could not be sent:', err)
  }
}

/**
 * Request notification permission from the user on explicit interaction.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }

  try {
    return await Notification.requestPermission()
  } catch (err) {
    console.warn('StudySpace: Error requesting notification permission:', err)
    return Notification.permission || 'denied'
  }
}

/**
 * Check current notification permission state.
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}
