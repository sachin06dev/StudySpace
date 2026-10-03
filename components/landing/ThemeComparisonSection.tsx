'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Sun, Moon, SlidersHorizontal, ArrowLeftRight } from 'lucide-react'

import Image from 'next/image'

function DashboardCropLight() {
  return (
    <div className="relative w-full h-full bg-[#fdfdfd] overflow-hidden">
      <Image
        src="/images/dashboard-light.png"
        alt="StudySpace Dashboard in Crisp Light Theme"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
        className="object-cover object-top select-none pointer-events-none"
        quality={95}
        priority
      />
    </div>
  )
}

function DashboardCropDark() {
  return (
    <div className="relative w-full h-full bg-[#09090b] overflow-hidden">
      <Image
        src="/images/dashboard-dark.png"
        alt="StudySpace Dashboard in Obsidian Dark Theme"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
        className="object-cover object-top select-none pointer-events-none"
        quality={95}
        priority
      />
    </div>
  )
}

export default function ThemeComparisonSection() {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lightLayerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const currentPosRef = useRef(50)
  const isDraggingRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)

  // Direct DOM update via RAF for smooth 60fps handle motion & clip-path wipe
  const applyPosition = useCallback((percent: number) => {
    currentPosRef.current = percent
    if (lightLayerRef.current) {
      lightLayerRef.current.style.clipPath = `inset(0 ${100 - percent}% 0 0)`
    }
    if (dividerRef.current) {
      dividerRef.current.style.left = `${percent}%`
    }
  }, [])

  const setPreset = (percent: number) => {
    applyPosition(percent)
    setSliderPosition(percent)
  }

  // Pointer drag event handlers
  const updateFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(Math.max((x / rect.width) * 100, 5), 95)

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }

    rafIdRef.current = requestAnimationFrame(() => {
      applyPosition(percent)
    })
  }, [applyPosition])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true
    setIsDragging(true)
    containerRef.current?.setPointerCapture?.(e.pointerId)
    updateFromPointer(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updateFromPointer(e.clientX)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
      containerRef.current?.releasePointerCapture?.(e.pointerId)
      setSliderPosition(currentPosRef.current)
    }
  }

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newPos = sliderPosition
    if (e.key === 'ArrowLeft') {
      newPos = Math.max(0, sliderPosition - 5)
    } else if (e.key === 'ArrowRight') {
      newPos = Math.min(100, sliderPosition + 5)
    } else if (e.key === 'Home') {
      newPos = 0
    } else if (e.key === 'End') {
      newPos = 100
    } else {
      return
    }
    e.preventDefault()
    setPreset(newPos)
  }

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return (
    <section
      id="theme"
      className="py-16 md:py-24 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 transition-colors relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <span>THEME ACCURACY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Light for daylight lectures. Dark for 2 AM study.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal">
            Drag the divider or use arrow keys to compare real feature cards in high-contrast light and deep dark mode.
          </p>

          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPreset(90)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Show Light</span>
            </button>
            <button
              type="button"
              onClick={() => setPreset(50)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-zinc-900 text-xs font-semibold text-violet-700 dark:text-violet-300 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>50 / 50 Split</span>
            </button>
            <button
              type="button"
              onClick={() => setPreset(10)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5 text-violet-400" />
              <span>Show Dark</span>
            </button>
          </div>
        </div>

        {/* Interactive Split-Lens Container */}
        <div className="relative max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden select-none">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="hidden sm:inline font-mono text-slate-500 dark:text-zinc-400 ml-2">
                studyspace4u.app · Theme Comparison
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </span>
              <span className="text-slate-300 dark:text-zinc-700">/</span>
              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </span>
            </div>
          </div>

          {/* Split Screen Slider Body */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-[440px] sm:h-[540px] md:h-[620px] cursor-ew-resize overflow-hidden touch-none"
          >
            {/* Dark Theme Base (Underneath) */}
            <div className="absolute inset-0 w-full h-full">
              <DashboardCropDark />
              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-medium text-zinc-300 flex items-center gap-1 pointer-events-none shadow-md">
                <Moon className="w-3 h-3 text-violet-400" />
                <span>Obsidian Dark Mode</span>
              </div>
            </div>

            {/* Light Theme Clipped Layer (On Top) with clip-path wipe */}
            <div
              ref={lightLayerRef}
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                willChange: isDragging ? 'clip-path' : 'auto',
              }}
            >
              <DashboardCropLight />
              <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1 pointer-events-none shadow-md">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Crisp Light Mode</span>
              </div>
            </div>

            {/* Accessible Draggable Divider Handle */}
            <div
              ref={dividerRef}
              role="slider"
              tabIndex={0}
              aria-label="Theme comparison slider"
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuemin={0}
              aria-valuemax={100}
              onKeyDown={handleKeyDown}
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-zinc-400 z-20 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              style={{
                left: `${sliderPosition}%`,
                willChange: isDragging ? 'left' : 'auto',
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border-2 border-violet-600 dark:border-violet-400 shadow-md flex items-center justify-center text-slate-800 dark:text-zinc-100 hover:scale-105 active:scale-95 transition-transform">
                <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </div>

          {/* Footer instruction */}
          <div className="py-2 px-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 text-center text-[11px] text-slate-500 dark:text-zinc-400">
            Drag the handle or press Left/Right arrow keys to wipe between themes
          </div>
        </div>
      </div>
    </section>
  )
}
