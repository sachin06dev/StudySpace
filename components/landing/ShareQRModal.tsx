'use client'

import React, { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import gsap from 'gsap'
import { X, Share2, Download, MessageCircle, Copy, Check } from 'lucide-react'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'
import { stopLenis, startLenis } from '@/lib/animations/landing'

interface ShareQRModalProps {
  isOpen: boolean
  onClose: () => void
  downloadUrl: string
  versionText: string
}

export default function ShareQRModal({
  isOpen,
  onClose,
  downloadUrl,
  versionText,
}: ShareQRModalProps) {
  const modalOverlayRef = useRef<HTMLDivElement>(null)
  const modalCardRef = useRef<HTMLDivElement>(null)
  const cardPreviewRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Host domain from site URL
  const domain = typeof window !== 'undefined'
    ? window.location.host || 'studyspace4u.vercel.app'
    : 'studyspace4u.vercel.app'

  const shareText = `Get the StudySpace study companion app (v${versionText}): Scan or open ${downloadUrl}`

  // GSAP Entrance, Exit, Lenis stop/start, Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen) return

    stopLenis()
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus close button initially
    closeBtnRef.current?.focus()

    if (modalOverlayRef.current && modalCardRef.current) {
      gsap.fromTo(
        modalOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      )
      gsap.fromTo(
        modalCardRef.current,
        { scale: 0.94, opacity: 0, y: 12 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }
      )
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Simple focus trap inside modal
      if (e.key === 'Tab' && modalCardRef.current) {
        const focusables = modalCardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length > 0) {
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      startLenis()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  const handleDownloadImage = async () => {
    if (!cardPreviewRef.current || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardPreviewRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `StudySpace-App-QR-v${versionText}.png`
      link.href = dataUrl
      link.click()
    } catch {
      handleCopyLink()
    } finally {
      setDownloading(false)
    }
  }

  const handleNativeShare = async () => {
    if (!cardPreviewRef.current) return

    if (navigator.share) {
      try {
        const dataUrl = await toPng(cardPreviewRef.current, { pixelRatio: 2 })
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], 'studyspace-qr.png', { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'StudySpace study companion app',
            text: shareText,
            files: [file],
          })
          return
        }
        await navigator.share({
          title: 'StudySpace study companion app',
          text: shareText,
          url: downloadUrl,
        })
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(
      `Get the StudySpace study companion app! Timetable scanner, attendance tracker, and study vault in one app: ${downloadUrl}`
    )}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      ref={modalOverlayRef}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Share StudySpace QR Card"
    >
      <div
        ref={modalCardRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-center my-auto"
      >
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Branded QR Card Preview (Flat Solid Theme Colors - Zero Gradients) */}
        <div
          ref={cardPreviewRef}
          className="w-full rounded-2xl bg-zinc-950 p-6 flex flex-col items-center justify-between text-white border border-zinc-800 select-none space-y-4"
        >
          {/* Top Branding */}
          <div className="flex flex-col items-center gap-1">
            <StudySpaceLogo size="md" showText={false} />
            <span className="font-extrabold tracking-tight text-base text-zinc-100">
              StudySpace
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              Study Companion App
            </span>
          </div>

          {/* Large QR in Rounded White Frame (260px) */}
          <div className="p-3 bg-white rounded-2xl shadow-md flex items-center justify-center">
            <QRCodeSVG
              value={downloadUrl}
              size={240}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/favicon.ico',
                height: 42,
                width: 42,
                excavate: true,
              }}
            />
          </div>

          {/* Bottom Card Text & Domain */}
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-zinc-200 leading-snug">
              Scan to get the StudySpace study companion app
            </p>
            <span className="text-[11px] font-mono text-violet-400 font-bold block">
              {domain}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Saving…' : 'Save Image'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 font-semibold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Copy Link Fallback */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Download Link Copied
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Direct Download URL</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
