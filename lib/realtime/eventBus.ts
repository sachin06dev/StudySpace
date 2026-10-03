'use client'

export type RealtimeChangeType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeBroadcastPayload<T = Record<string, unknown>> {
  table: string
  eventType: RealtimeChangeType
  new: T
  old: T
}

type RealtimeListener<T = Record<string, unknown>> = (
  payload: RealtimeBroadcastPayload<T>
) => void

class RealtimeEventBus {
  private listeners: Map<string, Set<RealtimeListener>> = new Map()
  private channel: BroadcastChannel | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('studyspace_realtime_sync')
        this.channel.onmessage = (event) => {
          const data = event.data as { table: string; payload: RealtimeBroadcastPayload }
          if (data?.table && data?.payload) {
            this.dispatchLocal(data.table, data.payload)
          }
        }
      } catch (err) {
        console.warn('[RealtimeEventBus] BroadcastChannel not supported or restricted:', err)
      }
    }
  }

  subscribe<T = Record<string, unknown>>(
    table: string,
    listener: RealtimeListener<T>
  ): () => void {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set())
    }
    const set = this.listeners.get(table)!
    set.add(listener as RealtimeListener)

    return () => {
      set.delete(listener as RealtimeListener)
      if (set.size === 0) {
        this.listeners.delete(table)
      }
    }
  }

  on<T = Record<string, unknown>>(
    table: string,
    listener: RealtimeListener<T>
  ): () => void {
    return this.subscribe<T>(table, listener)
  }

  private dispatchLocal<T = Record<string, unknown>>(
    table: string,
    payload: RealtimeBroadcastPayload<T>
  ): void {
    // 1. Table-specific listeners
    const tableSet = this.listeners.get(table)
    if (tableSet) {
      tableSet.forEach((listener) => {
        try {
          listener(payload as RealtimeBroadcastPayload)
        } catch (e) {
          console.error(`[RealtimeEventBus] Listener error on table ${table}:`, e)
        }
      })
    }

    // 2. Wildcard '*' listeners
    const wildcardSet = this.listeners.get('*')
    if (wildcardSet) {
      wildcardSet.forEach((listener) => {
        try {
          listener(payload as RealtimeBroadcastPayload)
        } catch (e) {
          console.error(`[RealtimeEventBus] Wildcard listener error on table ${table}:`, e)
        }
      })
    }
  }

  emit<T = Record<string, unknown>>(
    table: string,
    payload: RealtimeBroadcastPayload<T>,
    broadcast = true
  ): void {
    this.dispatchLocal(table, payload)
    if (broadcast && this.channel) {
      try {
        this.channel.postMessage({ table, payload })
      } catch (err) {
        console.warn('[RealtimeEventBus] Failed to postMessage:', err)
      }
    }
  }
}

export const realtimeEventBus = new RealtimeEventBus()
