export type DocumentCategory =
  | 'lecture_notes'
  | 'assignment'
  | 'syllabus'
  | 'textbook'
  | 'reference'
  | 'exam_prep'
  | 'other'

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB (Supabase Free tier limit)

export const SUPPORTED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.csv',
  '.txt',
  '.md',
] as const

export type SupportedDocumentExtension = typeof SUPPORTED_DOCUMENT_EXTENSIONS[number]

export const DOCUMENT_ACCEPT_ATTRIBUTE = SUPPORTED_DOCUMENT_EXTENSIONS.join(',')

/**
 * Checks if a filename has an allowed document extension.
 */
export function isSupportedDocumentFile(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') return false
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return false
  const ext = fileName.substring(lastDotIndex).toLowerCase()
  return SUPPORTED_DOCUMENT_EXTENSIONS.includes(ext as SupportedDocumentExtension)
}

/**
 * Returns a human-readable list of supported document formats.
 */
export function getSupportedDocumentFormatsText(): string {
  return 'PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), Sheets (.xlsx, .xls, .csv), TXT, or Markdown (.md)'
}

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'lecture_notes', label: 'Lecture Notes' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'textbook', label: 'Textbook / Readings' },
  { value: 'reference', label: 'Reference / Cheat Sheet' },
  { value: 'exam_prep', label: 'Exam Prep / Practice' },
  { value: 'other', label: 'Other' },
]

export const DOCUMENT_CATEGORY_STYLES: Record<
  DocumentCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  lecture_notes: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Lecture Notes',
  },
  assignment: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Assignment',
  },
  syllabus: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Syllabus',
  },
  textbook: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    label: 'Textbook',
  },
  reference: {
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    label: 'Reference',
  },
  exam_prep: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'Exam Prep',
  },
  other: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    label: 'Other',
  },
}

/**
 * Returns styling and display label for any document category (standard or custom).
 */
export function getDocumentCategoryConfig(category?: string | null): {
  bg: string
  text: string
  border: string
  label: string
} | null {
  if (!category || !category.trim()) return null
  const trimmed = category.trim()
  const lower = trimmed.toLowerCase()

  if (DOCUMENT_CATEGORY_STYLES[lower as DocumentCategory]) {
    return DOCUMENT_CATEGORY_STYLES[lower as DocumentCategory]
  }

  // Check matching by label
  const matchedOpt = DOCUMENT_CATEGORIES.find(
    (c) => c.label.toLowerCase() === lower || c.value.toLowerCase() === lower
  )
  if (matchedOpt && DOCUMENT_CATEGORY_STYLES[matchedOpt.value]) {
    return DOCUMENT_CATEGORY_STYLES[matchedOpt.value]
  }

  // Custom category
  return {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    label: trimmed,
  }
}

/**
 * Formats a file size in bytes into a clean, human-readable string.
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes <= 0) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const formatted = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)
  return `${formatted} ${units[i] || 'MB'}`
}

export type FileTypeCategory = 'pdf' | 'doc' | 'sheet' | 'slide' | 'code' | 'text' | 'image' | 'archive' | 'generic'

export interface FileTypeInfo {
  type: FileTypeCategory
  label: string
  color: string
  bgColor: string
  borderColor: string
}

/**
 * Determines file type information (label, color palette, icon category) based on file name and mime type.
 */
export function getFileTypeInfo(fileName: string, mimeType?: string | null): FileTypeInfo {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const mime = mimeType?.toLowerCase() || ''

  if (extension === 'pdf' || mime.includes('pdf')) {
    return {
      type: 'pdf',
      label: 'PDF',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    }
  }

  if (['doc', 'docx', 'odt', 'rtf'].includes(extension) || mime.includes('word') || mime.includes('document')) {
    return {
      type: 'doc',
      label: 'DOC',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    }
  }

  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension) || mime.includes('sheet') || mime.includes('csv')) {
    return {
      type: 'sheet',
      label: 'SHEET',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    }
  }

  if (['ppt', 'pptx', 'odp'].includes(extension) || mime.includes('presentation') || mime.includes('powerpoint')) {
    return {
      type: 'slide',
      label: 'SLIDE',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    }
  }

  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'sql', 'sh'].includes(extension)) {
    return {
      type: 'code',
      label: 'CODE',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    }
  }

  if (['txt', 'md', 'markdown'].includes(extension) || mime.includes('text/plain') || mime.includes('text/markdown')) {
    return {
      type: 'text',
      label: 'TXT',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
    }
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension) || mime.startsWith('image/')) {
    return {
      type: 'image',
      label: 'IMG',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
    }
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) || mime.includes('zip') || mime.includes('compressed')) {
    return {
      type: 'archive',
      label: 'ZIP',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    }
  }

  return {
    type: 'generic',
    label: extension.toUpperCase() || 'FILE',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  }
}

/**
 * Sanitizes a filename for storage paths, preserving the extension while replacing special characters.
 */
export function sanitizeFileName(fileName: string): string {
  // Replace path separators and problematic characters with underscore
  const sanitized = fileName
    .replace(/[/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
  return sanitized || 'document'
}
