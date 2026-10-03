'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  LogOut,
  Clock,
  Radio,
} from 'lucide-react'
import {
  getUserDevicesAction,
  registerDeviceAction,
  removeDeviceAction,
  type UserDevice,
} from '@/lib/actions/devices'
import { logoutOtherDevices } from '@/lib/actions/auth'
import { getOrCreateDeviceId, detectDeviceInfo } from '@/lib/utils/deviceInfo'
import { realtimeEventBus } from '@/lib/realtime/eventBus'
import { createClient } from '@/lib/supabase/client'

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Active just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `Active ${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `Active ${diffHour}h ago`
    const diffDays = Math.floor(diffHour / 24)
    if (diffDays === 1) return 'Active yesterday'
    return `Active ${diffDays} days ago`
  } catch {
    return 'Recently active'
  }
}

function getDeviceIcon(deviceType: string, className = 'w-5 h-5') {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className={className} />
    case 'tablet':
      return <Tablet className={className} />
    case 'desktop':
      return <Laptop className={className} />
    default:
      return <Globe className={className} />
  }
}

export default function DevicesSessionsCard() {
  const router = useRouter()
  const [currentDeviceId] = useState<string>(() =>
    typeof window !== 'undefined' ? getOrCreateDeviceId() : ''
  )
  const [devices, setDevices] = useState<UserDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Modals for confirmation
  const [confirmLogoutOthersOpen, setConfirmLogoutOthersOpen] = useState(false)
  const [confirmSingleDevice, setConfirmSingleDevice] = useState<UserDevice | null>(null)

  const loadDevices = async () => {
    const res = await getUserDevicesAction()
    if (res.success && res.devices) {
      setDevices(res.devices)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    const id = currentDeviceId || getOrCreateDeviceId()

    getUserDevicesAction().then((res) => {
      if (!isMounted) return
      if (res.success && res.devices) {
        setDevices(res.devices)
      }
      setIsLoading(false)
    })

    // If device registration hasn't run in this session yet, register in background
    const lastReg = typeof window !== 'undefined' ? sessionStorage.getItem('studyspace_device_last_reg') : null
    if (!lastReg) {
      detectDeviceInfo().then((info) => {
        registerDeviceAction({
          deviceId: id,
          deviceName: info.deviceName,
          deviceType: info.deviceType,
          platform: info.platform,
          browser: info.browser,
        }).then(async (res) => {
          if (!isMounted) return
          if (res && res.isRevoked) {
            const supabase = createClient()
            await supabase.auth.signOut({ scope: 'local' })
            router.push('/login?reason=device_removed')
            return
          }
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('studyspace_device_last_reg', Date.now().toString())
          }
          loadDevices()
        })
      })
    }

    // Listen to real-time device changes across browsers and tabs
    const unsubscribe = realtimeEventBus.on('user_devices', () => {
      loadDevices()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [currentDeviceId, router])

  const executeLogoutOthers = () => {
    setFeedback(null)
    setConfirmLogoutOthersOpen(false)

    startTransition(async () => {
      const res = await logoutOtherDevices()
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Successfully signed out of all other active sessions!',
        })
        setDevices((prev) => prev.filter((d) => d.device_id === currentDeviceId))
        await loadDevices()
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to sign out other devices.',
        })
      }
      setTimeout(() => setFeedback(null), 5000)
    })
  }

  const executeRemoveDevice = async (device: UserDevice) => {
    setFeedback(null)
    setRemovingDeviceId(device.device_id)
    setConfirmSingleDevice(null)

    // Optimistically remove from view
    setDevices((prev) =>
      prev.filter((d) => d.device_id !== device.device_id && d.id !== device.id)
    )

    try {
      const res = await removeDeviceAction({
        deviceId: device.device_id,
        id: device.id,
      })

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully revoked session on "${device.device_name}".`,
        })
        await loadDevices()
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to revoke device session.',
        })
        await loadDevices()
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Network error while attempting to revoke device.',
      })
      await loadDevices()
    } finally {
      setRemovingDeviceId(null)
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  const currentDevice = devices.find((d) => d.device_id === currentDeviceId)
  const otherDevices = devices.filter((d) => d.device_id !== currentDeviceId)

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xs transition-colors space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Connected Devices & Sessions</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manage your active sessions across web browsers and the StudySpace Android app
            </p>
          </div>
        </div>

        {otherDevices.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmLogoutOthersOpen(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out other devices ({otherDevices.length})</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-xs text-[var(--text-muted)] space-y-2">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading connected devices and active sessions...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Section 1: Current Active Device */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Current Device (This Session)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </span>
            </div>

            {currentDevice ? (
              <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--accent-subtle)] border-[var(--accent)]/30 transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20 shadow-xs">
                    {getDeviceIcon(currentDevice.device_type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                        {currentDevice.device_name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--accent)] text-white shrink-0">
                        Current
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>Platform: {currentDevice.platform || 'Web'}</span>
                      {currentDevice.browser && <span>• Browser: {currentDevice.browser}</span>}
                      <span>• {formatRelativeTime(currentDevice.last_active_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <span
                    className="inline-block text-[11px] font-medium text-[var(--text-muted)] px-2.5 py-1.5 rounded-lg bg-[var(--surface)]/80 border border-[var(--border-subtle)] cursor-not-allowed select-none"
                    title="To end this session, click Log Out in the profile menu"
                  >
                    Cannot Revoke Self
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-raised)]/40 text-xs text-[var(--text-muted)] text-center">
                Registering this device session...
              </div>
            )}
          </div>

          {/* Section 2: Other Connected Devices */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Other Connected Sessions ({otherDevices.length})
              </span>
              {otherDevices.length === 0 && (
                <span className="text-[11px] text-[var(--text-muted)]">No other active devices</span>
              )}
            </div>

            {otherDevices.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-raised)]/30 rounded-xl border border-dashed border-[var(--border-subtle)]">
                <Clock className="w-5 h-5 mx-auto mb-1.5 opacity-60 text-[var(--text-muted)]" />
                <p className="font-medium text-[var(--text-secondary)]">No other devices signed in</p>
                <p className="text-[11px] mt-0.5 text-[var(--text-muted)]">
                  When you sign in to StudySpace from your phone or another computer, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {otherDevices.map((device) => {
                  const isRemoving = removingDeviceId === device.device_id

                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border bg-[var(--surface-raised)]/50 border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-[var(--text-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                          {getDeviceIcon(device.device_type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                              {device.device_name}
                            </span>
                            {device.platform && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0">
                                {device.platform}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {device.browser && <span>{device.browser}</span>}
                            <span>•</span>
                            <span>{formatRelativeTime(device.last_active_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={() => setConfirmSingleDevice(device)}
                          disabled={isRemoving || isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title={`Revoke session on ${device.device_name}`}
                        >
                          {isRemoving ? (
                            <>
                              <span className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                              <span>Revoking...</span>
                            </>
                          ) : (
                            'Revoke'
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Sign Out All Other Devices */}
      {confirmLogoutOthersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-[0.97] duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Sign out other devices?
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  This action disconnects all sessions except this device.
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-raised)] p-3 rounded-xl border border-[var(--border-subtle)]">
              You are about to sign out of <strong className="text-[var(--text-primary)]">{otherDevices.length}</strong> other connected session{otherDevices.length === 1 ? '' : 's'}. You will remain signed in on this current browser ({currentDevice?.device_name || 'Current Device'}).
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmLogoutOthersOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLogoutOthers}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Yes, Sign Out Others</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Revoke Individual Device */}
      {confirmSingleDevice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-[0.97] duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Revoke device session?
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Confirm revoking access for this device
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-raised)] p-3 rounded-xl border border-[var(--border-subtle)]">
              Are you sure you want to revoke the session on <strong className="text-[var(--text-primary)]">{confirmSingleDevice.device_name}</strong>? That device will be signed out immediately and returned to the login screen.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSingleDevice(null)}
                className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeRemoveDevice(confirmSingleDevice)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Revoke Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
