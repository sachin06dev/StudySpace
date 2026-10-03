'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { X, ZoomIn, Sun, Moon } from 'lucide-react'

interface ScreenshotLightboxProps {
  isOpen: boolean
  onClose: () => void
  src: string
  title: string
  theme: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function ScreenshotLightbox({
  isOpen,
  onClose,
  src,
  title,
  theme,
  onToggleTheme,
}: ScreenshotLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} screenshot lightbox`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full max-h-[92vh] flex flex-col rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 text-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-100 truncate ml-2">
              {title} — High-Res View ({theme === 'dark' ? 'Dark Theme' : 'Light Theme'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer border border-zinc-700"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} view`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-violet-400" />
                    <span className="hidden sm:inline">Dark Theme</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close image modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Image Canvas */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-zinc-950/40 flex justify-center items-start">
          <div className="relative w-full max-w-full">
            <Image
              src={src}
              alt={title}
              width={1600}
              height={1200}
              className="w-full h-auto rounded-lg shadow-lg object-contain select-none"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/90 border-t border-zinc-800 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-violet-400" />
            <span>Native screenshot from the live StudySpace platform</span>
          </span>
          <span className="font-mono">ESC or click backdrop to close</span>
        </div>
      </div>
    </div>
  )
}
