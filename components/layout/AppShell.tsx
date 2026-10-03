'use client'

import React, { useState, useCallback } from 'react'
import AppSidebar from './AppSidebar'
import MobileHeader from './MobileHeader'
import MobileNavDrawer from './MobileNavDrawer'
import GlobalSearchModal from '@/components/search/GlobalSearchModal'
import { SidebarCollapseProvider, useSidebarCollapse } from './SidebarCollapseContext'

interface AppShellProps {
  children: React.ReactNode
  userEmail?: string | null
  userName?: string | null
}

function AppShellInner({ children, userEmail, userName }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { isSidebarCollapsed } = useSidebarCollapse()

  const handleOpenNav = useCallback(() => {
    setIsMobileNavOpen(true)
  }, [])

  const handleCloseNav = useCallback(() => {
    setIsMobileNavOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen bg-(--canvas) transition-colors">
      <GlobalSearchModal />
      {/* Desktop Sidebar — collapses to icon rail so features stay one click away */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)] ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <AppSidebar userEmail={userEmail} userName={userName} />
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
          userName={userName}
        />

        {/* Standardized Responsive Page Content Container */}
        <main
          className={`flex-1 min-w-0 w-full transition-all duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)] ${
            isSidebarCollapsed
              ? 'p-2 sm:p-4 lg:p-4 max-w-[1920px] mx-auto'
              : 'p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppShell({ children, userEmail, userName }: AppShellProps) {
  return (
    <SidebarCollapseProvider>
      <AppShellInner userEmail={userEmail} userName={userName}>{children}</AppShellInner>
    </SidebarCollapseProvider>
  )
}
