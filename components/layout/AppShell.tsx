'use client'

import React, { useState, useCallback } from 'react'
import AppSidebar from './AppSidebar'
import MobileHeader from './MobileHeader'
import MobileNavDrawer from './MobileNavDrawer'

interface AppShellProps {
  children: React.ReactNode
  userEmail?: string | null
}

export default function AppShell({ children, userEmail }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const handleOpenNav = useCallback(() => {
    setIsMobileNavOpen(true)
  }, [])

  const handleCloseNav = useCallback(() => {
    setIsMobileNavOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-transparent transition-colors">
      {/* Desktop Sidebar (hidden on mobile/tablet < 1024px) */}
      <div className="hidden lg:block w-64 shrink-0">
        <AppSidebar userEmail={userEmail} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (hidden on desktop >= 1024px) */}
        <MobileHeader
          onOpenNav={handleOpenNav}
          isNavOpen={isMobileNavOpen}
        />

        {/* Mobile Slide-over Drawer */}
        <MobileNavDrawer
          isOpen={isMobileNavOpen}
          onClose={handleCloseNav}
          userEmail={userEmail}
        />

        {/* Standardized Responsive Page Content Container */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
