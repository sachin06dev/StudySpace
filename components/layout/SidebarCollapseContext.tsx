'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface SidebarCollapseContextValue {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  collapseSidebar: () => void
  restoreSidebar: () => void
}

const SidebarCollapseContext = createContext<SidebarCollapseContextValue | null>(null)

const STORAGE_KEY = 'studyspace_sidebar_collapsed'

export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEY) === 'true'
      } catch {
        return false
      }
    }
    return false
  })

  const setCollapsed = useCallback((val: boolean) => {
    setIsSidebarCollapsed(val)
    try {
      localStorage.setItem(STORAGE_KEY, String(val))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // Ignore localStorage errors
      }
      return next
    })
  }, [])

  const collapseSidebar = useCallback(() => setCollapsed(true), [setCollapsed])
  const restoreSidebar = useCallback(() => setCollapsed(false), [setCollapsed])

  // Keyboard shortcut: [ or Ctrl/Cmd + B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside inputs or textareas
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (
        e.key === '[' ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b')
      ) {
        e.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarCollapseContext.Provider
      value={{ isSidebarCollapsed, toggleSidebar, collapseSidebar, restoreSidebar }}
    >
      {children}
    </SidebarCollapseContext.Provider>
  )
}

export function useSidebarCollapse(): SidebarCollapseContextValue {
  const ctx = useContext(SidebarCollapseContext)
  if (!ctx) {
    throw new Error('useSidebarCollapse must be used within SidebarCollapseProvider')
  }
  return ctx
}
