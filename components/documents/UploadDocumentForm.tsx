'use client'

import { useState, useRef } from 'react'
import {
  getPresignedDocumentUploadUrlAction,
  createDocumentAction,
  cleanupFailedUploadAction,
} from '@/lib/actions/documents'
import {
  DOCUMENT_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  DOCUMENT_ACCEPT_ATTRIBUTE,
  isSupportedDocumentFile,
  getSupportedDocumentFormatsText,
  formatFileSize,
  getFileTypeInfo,
} from '@/lib/documents/utils'

export default function UploadDocumentForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatusText, setUploadStatusText] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('')
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    setError(null)
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (file.size <= 0) {
      setError('Cannot upload an empty file (0 bytes). Please choose a valid file.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 50 MB. Please choose a smaller file.`
      )
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFile(null)
      return
    }

    if (!isSupportedDocumentFile(file.name)) {
      setError(
        `Unsupported document format "${file.name}". Please choose a supported document format: ${getSupportedDocumentFormatsText()}.`
      )
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setIsOpen(true)

    // Prefill title if empty
    if (!title.trim()) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      setTitle(baseName)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleResetForm = () => {
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setCategory('')
    setCustomCategoryInput('')
    setIsAddingCustomCategory(false)
    setError(null)
    setIsOpen(false)
    setIsUploading(false)
    setUploadStatusText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!selectedFile) {
      setError('Please select a file to upload.')
      return
    }

    if (selectedFile.size <= 0) {
      setError('Cannot upload an empty file (0 bytes).')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File size (${formatFileSize(selectedFile.size)}) exceeds the maximum allowed limit of 50 MB.`
      )
      return
    }

    if (!isSupportedDocumentFile(selectedFile.name)) {
      setError(
        `Unsupported document format "${selectedFile.name}". Please choose a supported document format: ${getSupportedDocumentFormatsText()}.`
      )
      return
    }

    const trimmedTitle = title.trim() || selectedFile.name

    setIsUploading(true)
    setUploadStatusText('Authorizing secure upload...')

    let activeStorageKey: string | null = null
    let activeStorageProvider: string = 'r2'

    try {
      // 1. Authorize & generate presigned upload URL via Server Action
      const presignedRes = await getPresignedDocumentUploadUrlAction({
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type || 'application/octet-stream',
      })

      if (!presignedRes.success || !presignedRes.data) {
        setError(presignedRes.error || 'Failed to authorize upload. Please check your login session.')
        setIsUploading(false)
        return
      }

      const { documentId, uploadUrl, storageKey, storageProvider } = presignedRes.data
      activeStorageKey = storageKey
      activeStorageProvider = storageProvider

      setUploadStatusText(`Uploading ${selectedFile.name} to cloud storage...`)

      // 2. Direct browser upload to Cloudflare R2 via presigned PUT URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream',
        },
      })

      if (!uploadResponse.ok) {
        console.error('R2 direct upload failed with status:', uploadResponse.status)
        setError(`Upload failed (${uploadResponse.status}). Please check your connection and try again.`)
        setIsUploading(false)
        return
      }

      setUploadStatusText('Saving document metadata...')

      const finalCategory = isAddingCustomCategory
        ? customCategoryInput.trim() || null
        : category || null

      // 3. Save metadata in Supabase via Server Action
      const result = await createDocumentAction({
        id: documentId,
        title: trimmedTitle,
        description: description.trim() || null,
        fileName: selectedFile.name,
        storageKey,
        storageProvider,
        mimeType: selectedFile.type || 'application/octet-stream',
        fileSizeBytes: selectedFile.size,
        category: finalCategory,
      })

      if (!result.success) {
        console.error('Metadata creation failed, rolling back uploaded file:', result.error)
        if (activeStorageKey) {
          await cleanupFailedUploadAction(activeStorageKey, activeStorageProvider)
        }

        setError(result.error || 'Failed to save document record. Storage file was cleaned up.')
        setIsUploading(false)
        return
      }

      // 4. Successful upload
      const uploadedTitle = result.data?.title || trimmedTitle
      handleResetForm()
      setSuccessMessage(`"${uploadedTitle}" has been uploaded successfully!`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (err: unknown) {
      console.error('Unexpected error during upload:', err)
      if (activeStorageKey) {
        try {
          await cleanupFailedUploadAction(activeStorageKey, activeStorageProvider)
        } catch {}
      }
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during upload.'
      setError(msg)
    } finally {
      setIsUploading(false)
      setUploadStatusText('')
    }
  }

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile.name, selectedFile.type) : null

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs overflow-hidden mb-8 transition-all">
      <form onSubmit={handleSubmit} className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Upload Study Document</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Securely store PDFs, slides, assignments, or cheat sheets (up to 50 MB).
              </p>
            </div>
          </div>

          {!isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="self-start sm:self-auto text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] hover:bg-[var(--accent)] hover:text-white border border-[var(--accent)]/20 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              + Upload Document
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-semibold cursor-pointer ml-2 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--success-muted)] border border-[var(--success-border)] text-[var(--success)] text-xs flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="font-semibold cursor-pointer hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Drop Zone & File Selector */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            id="document-file-input"
            accept={DOCUMENT_ACCEPT_ATTRIBUTE}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={isUploading}
          />

          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/30'
                  : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50 bg-[var(--surface-raised)]/40 hover:bg-[var(--surface-raised)]'
              }`}
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-[var(--surface)] shadow-xs border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                <span className="text-[var(--accent)] hover:underline">Click to browse</span> or drag and drop your document
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                PDF, Word (.docx), Slides (.pptx), Sheets (.xlsx, .csv), TXT, Markdown (Max 50 MB)
              </p>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="flex items-center justify-between p-3.5 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${fileInfo?.bgColor} ${fileInfo?.color} ${fileInfo?.borderColor}`}
                >
                  {fileInfo?.label || 'FILE'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] px-2.5 py-1 rounded-lg hover:bg-[var(--danger-muted)] transition-colors cursor-pointer"
                >
                  Change File
                </button>
              )}
            </div>
          )}

          {/* Expandable Metadata Form */}
          {(isOpen || selectedFile) && (
            <div className="space-y-3.5 pt-2 border-t border-[var(--border-subtle)] animate-in fade-in-50 duration-[var(--duration-fast)] [animation-timing-function:var(--ease-smooth-out)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="doc-title" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Document Title <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    id="doc-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Operating Systems Lecture 4"
                    disabled={isUploading}
                    className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl px-3.5 py-2.5 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="doc-category" className="block text-xs font-semibold text-[var(--text-primary)]">
                      Category <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                    </label>
                    {isAddingCustomCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomCategory(false)
                          setCustomCategoryInput('')
                          setCategory('')
                        }}
                        className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        Choose Preset
                      </button>
                    )}
                  </div>

                  {isAddingCustomCategory ? (
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g., Computer Architecture"
                        autoFocus
                        disabled={isUploading}
                        maxLength={50}
                        className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl px-3.5 py-2.5 border border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomCategory(false)
                          setCustomCategoryInput('')
                          setCategory('')
                        }}
                        className="absolute right-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs p-0.5 cursor-pointer"
                        title="Cancel custom category"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      id="doc-category"
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsAddingCustomCategory(true)
                          setCategory('')
                        } else {
                          setCategory(e.target.value)
                        }
                      }}
                      disabled={isUploading}
                      className="w-full text-xs text-[var(--text-primary)] bg-[var(--surface-raised)] rounded-xl px-3 py-2.5 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all disabled:opacity-60"
                    >
                      <option value="">No Category</option>
                      {DOCUMENT_CATEGORIES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom Category...</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="doc-description" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Description / Notes <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <textarea
                  id="doc-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key topics, exam dates, or chapter references..."
                  disabled={isUploading}
                  className="w-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--surface-raised)] rounded-xl p-2.5 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all resize-y disabled:opacity-60"
                />
              </div>

              {/* Upload Progress Status Indicator */}
              {isUploading && (
                <div className="p-3 bg-[var(--accent-subtle)] border border-[var(--accent)]/20 rounded-xl text-xs text-[var(--accent)] flex items-center gap-2.5 animate-pulse">
                  <svg className="animate-spin h-4 w-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="font-medium">{uploadStatusText || 'Uploading document...'}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={isUploading}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile || (!title.trim() && !selectedFile?.name)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Upload to Vault</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
