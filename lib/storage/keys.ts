import { sanitizeFileName } from '@/lib/documents/utils'

/**
 * Generates a deterministic, user-scoped storage key for Cloudflare R2 objects.
 * Format: users/{userId}/documents/{documentId}/{safeFileName}
 */
export function generateDocumentStorageKey(
  userId: string,
  documentId: string,
  fileName: string
): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '')
  const safeDocId = documentId.replace(/[^a-zA-Z0-9_-]/g, '')
  const safeName = sanitizeFileName(fileName)

  return `users/${safeUserId}/documents/${safeDocId}/${safeName}`
}

/**
 * Validates whether a storage key belongs to a specific user.
 * Supports both new R2 keys (`users/{userId}/...`) and legacy paths (`{userId}/...`).
 */
export function isUserStorageKey(storageKey: string, userId: string): boolean {
  if (!storageKey || !userId) return false
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '')

  return (
    storageKey.startsWith(`users/${safeUserId}/`) ||
    storageKey.startsWith(`${safeUserId}/`)
  )
}

/**
 * Parses a standard document storage key into its constituent parts.
 */
export function parseDocumentStorageKey(storageKey: string): {
  userId: string
  documentId: string
  fileName: string
} | null {
  if (!storageKey) return null

  // Pattern: users/{userId}/documents/{documentId}/{fileName}
  const r2Match = storageKey.match(/^users\/([^/]+)\/documents\/([^/]+)\/(.+)$/)
  if (r2Match) {
    return {
      userId: r2Match[1],
      documentId: r2Match[2],
      fileName: r2Match[3],
    }
  }

  // Legacy Supabase Pattern: {userId}/{documentId}/{fileName}
  const legacyMatch = storageKey.match(/^([^/]+)\/([^/]+)\/(.+)$/)
  if (legacyMatch) {
    return {
      userId: legacyMatch[1],
      documentId: legacyMatch[2],
      fileName: legacyMatch[3],
    }
  }

  return null
}
