'use client'

import React, { useState, useRef, useTransition } from 'react'
import type { Semester } from '@/lib/data/semesters'
import type { ScanTimetableResult } from '@/lib/ai/timetableScanner'
import { scanTimetableImageAction } from '@/lib/actions/timetableAi'
import ScannedTimetableReview from './ScannedTimetableReview'

interface ScanTimetableModalProps {
  isOpen: boolean
  onClose: () => void
  existingSemesters: Semester[]
  currentActiveSemesterId?: string | null
}

export default function ScanTimetableModal({
  isOpen,
  onClose,
  existingSemesters,
  currentActiveSemesterId,
}: ScanTimetableModalProps) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanTimetableResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WebP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.')
      return
    }

    setSelectedFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please drop a valid image file (PNG, JPG, or WebP).')
      return
    }

    setSelectedFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAnalyze = () => {
    if (!selectedFile) return
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    startTransition(async () => {
      const res = await scanTimetableImageAction(formData)
      if (!res.success || !res.data) {
        setErrorMsg(res.error || "Couldn't read timetable from image. You can enter classes manually.")
      } else {
        setScanResult(res.data)
      }
    })
  }

  const handleReset = () => {
    setSelectedFile(null)
    setImagePreviewUrl(null)
    setScanResult(null)
    setErrorMsg(null)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50"
    >
      <div className="bg-white dark:bg-(--surface) border border-gray-200 dark:border-(--border-subtle) rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Scan Timetable Photo
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI extracts your subjects, days, and times automatically.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-1">
            <p className="font-semibold">{errorMsg}</p>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              Tip: You can always add classes directly using the manual &ldquo;Add Class&rdquo; form if AI extraction is unavailable.
            </p>
          </div>
        )}

        {/* Phase 1: Upload Photo / Preview */}
        {!scanResult ? (
          <div className="space-y-4">
            {!imagePreviewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-900/30 space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    Click to browse or drag & drop timetable image
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    PNG, JPG, or WebP up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-black/5 dark:bg-black/40 max-h-72 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreviewUrl}
                    alt="Timetable upload preview"
                    className="max-h-72 object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors text-xs"
                    title="Choose different photo"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Selected file: <strong>{selectedFile?.name}</strong></span>
                  <span>({Math.round((selectedFile?.size || 0) / 1024)} KB)</span>
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>
                <strong>Privacy Guaranteed:</strong> Your timetable photo is processed strictly in-memory for extraction and discarded immediately. It is never stored.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isPending}
                onClick={handleAnalyze}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Analyzing Timetable Photo...</span>
                  </>
                ) : (
                  <span>Extract Classes with AI</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Phase 2: Review and Save Detected Classes */
          <ScannedTimetableReview
            initialClasses={scanResult.classes}
            suggestedSemesterName={scanResult.suggestedSemesterName}
            existingSemesters={existingSemesters}
            currentActiveSemesterId={currentActiveSemesterId}
            onSaveSuccess={() => {
              handleReset()
              onClose()
            }}
            onCancel={handleReset}
          />
        )}
      </div>
    </div>
  )
}
