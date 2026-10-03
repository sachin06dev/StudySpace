'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { realtimeEventBus, type RealtimeChangeType } from '@/lib/realtime/eventBus'
import { getOrCreateDeviceId } from '@/lib/utils/deviceInfo'

interface StudySpaceRealtimeProviderProps {
  children?: React.ReactNode
}

const ROUTE_TABLE_MAP: Record<string, string[]> = {
  tasks: ['/tasks', '/dashboard'],
  attendance_records: ['/attendance', '/timetable', '/dashboard', '/analytics'],
  documents: ['/documents', '/dashboard', '/study'],
  semesters: ['/timetable', '/attendance', '/dashboard', '/analytics'],
  subjects: ['/timetable', '/attendance', '/dashboard', '/analytics'],
  timetable_slots: ['/timetable', '/attendance', '/dashboard'],
  timetable_exceptions: ['/timetable', '/attendance', '/dashboard'],
  pomodoro_sessions: ['/pomodoro', '/dashboard', '/analytics'],
  user_settings: ['/settings', '/pomodoro', '/dashboard'],
  website_resources: ['/resources', '/study', '/dashboard'],
  saved_playlists: ['/playlists', '/study'],
  saved_videos: ['/videos', '/dashboard'],
  video_timestamp_notes: ['/notes', '/videos'],
  user_devices: ['/settings'],
  profiles: ['/settings'],
}

const USER_ID_TABLES = [
  'tasks',
  'attendance_records',
  'documents',
  'semesters',
  'subjects',
  'timetable_slots',
  'timetable_exceptions',
  'pomodoro_sessions',
  'user_settings',
  'website_resources',
  'saved_playlists',
  'saved_videos',
  'video_timestamp_notes',
  'user_devices',
]

export function StudySpaceRealtimeProvider({ children }: StudySpaceRealtimeProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  const channelRef = useRef<RealtimeChannel | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let isSubscribed = true

    const triggerRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      refreshTimeoutRef.current = setTimeout(() => {
        router.refresh()
      }, 300)
    }

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !isSubscribed) return

      // Clean up previous channel if any
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      const channelName = `studyspace_realtime_full_${user.id}_${Date.now()}`
      const channel = supabase.channel(channelName)

      // Helper to process and dispatch events
      const handleTableEvent = (
        table: string,
        eventType: RealtimeChangeType,
        newRow: Record<string, unknown>,
        oldRow: Record<string, unknown>
      ) => {
        // 0. Check if this client device has been removed or revoked from another device
        if (table === 'user_devices') {
          const myDeviceId = getOrCreateDeviceId()
          if (myDeviceId) {
            const isTarget =
              (oldRow.device_id && oldRow.device_id === myDeviceId) ||
              (newRow.device_id && newRow.device_id === myDeviceId)

            const isTerminated =
              (eventType === 'DELETE' && isTarget) ||
              ((eventType === 'UPDATE' || eventType === 'INSERT') &&
                isTarget &&
                Boolean(newRow.is_revoked))

            if (isTerminated) {
              console.warn('[Realtime] This device session was terminated from another device.')
              supabase.auth.signOut({ scope: 'local' }).then(() => {
                router.push('/login?reason=device_removed')
              })
              return
            }
          }
        }

        // 1. Dispatch to client-side EventBus for immediate component state updates
        realtimeEventBus.emit(table, {
          table,
          eventType,
          new: newRow,
          old: oldRow,
        })

        // 2. Check if active route depends on this table for Server Component revalidation
        const currentPath = pathnameRef.current || ''
        const affectedRoutes = ROUTE_TABLE_MAP[table] || []
        const isCurrentRouteAffected = affectedRoutes.some(
          (route) => currentPath === route || currentPath.startsWith(route + '/')
        )

        if (isCurrentRouteAffected) {
          triggerRefresh()
        }
      }

      // Subscribe to all standard user_id scoped tables
      USER_ID_TABLES.forEach((table) => {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            handleTableEvent(
              table,
              payload.eventType as RealtimeChangeType,
              (payload.new as Record<string, unknown>) || {},
              (payload.old as Record<string, unknown>) || {}
            )
          }
        )
      })

      // Subscribe to profiles (id column is user_id)
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          handleTableEvent(
            'profiles',
            payload.eventType as RealtimeChangeType,
            (payload.new as Record<string, unknown>) || {},
            (payload.old as Record<string, unknown>) || {}
          )
        }
      )

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Channel subscribed successfully
        }
      })

      channelRef.current = channel
    }

    void setupRealtime()

    // Handle tab visibility and network reconnects
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void setupRealtime()
      }
    }
    const handleOnline = () => {
      void setupRealtime()
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    // Re-verify on auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'
      ) {
        if (session?.user) {
          void setupRealtime()
        }
      } else if (event === 'SIGNED_OUT') {
        if (channelRef.current) {
          void supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
      }
    })

    // Subscribe to cross-tab broadcast events for instant route revalidation
    const unsubscribeBus = realtimeEventBus.on('*', (payload) => {
      const currentPath = pathnameRef.current || ''
      const affectedRoutes = ROUTE_TABLE_MAP[payload.table] || []
      const isCurrentRouteAffected = affectedRoutes.some(
        (route) => currentPath === route || currentPath.startsWith(route + '/')
      )
      if (isCurrentRouteAffected) {
        triggerRefresh()
      }
    })

    return () => {
      isSubscribed = false
      unsubscribeBus()
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      subscription.unsubscribe()
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [router])

  return <>{children}</>
}

export default StudySpaceRealtimeProvider
