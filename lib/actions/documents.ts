'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createDocument,
  getDocument,
  getDocumentDownloadUrl,
  deleteDocument,
  type StudyDocument,
} from '@/lib/data/documents'
import {
  DOCUMENT_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  isSupportedDocumentFile,
  getSupportedDocumentFormatsText,
  type DocumentCategory,
} from '@/lib/documents/utils'
import { createUserCategory } from '@/lib/data/categories'
import { getPresignedUploadUrl, deleteR2Object } from '@/lib/storage/r2'
import { generateDocumentStorageKey, isUserStorageKey } from '@/lib/storage/keys'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export interface PresignedUploadData {
  documentId: string
  uploadUrl: string
  storageKey: string
  storageProvider: 'r2'
}

/**
 * Server Action: Authorizes and generates a presigned Cloudflare R2 upload URL for direct browser uploads.
 */
export async function getPresignedDocumentUploadUrlAction(input: {
  fileName: string
  fileSizeBytes: number
  mimeType?: string
}): Promise<ActionResult<PresignedUploadData>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    if (!input.fileName || !input.fileName.trim()) {
      return { success: false, error: 'File name is required.' }
    }

    if (!isSupportedDocumentFile(input.fileName)) {
      return {
        success: false,
        error: `Unsupported document format. Allowed formats: ${getSupportedDocumentFormatsText()}.`,
      }
    }

    if (!input.fileSizeBytes || input.fileSizeBytes <= 0) {
      return { success: false, error: 'Cannot upload an empty file (0 bytes).' }
    }

    if (input.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: 'File size exceeds the maximum allowed limit of 50 MB.' }
    }

    // 1. Generate unique document UUID
    const documentId = crypto.randomUUID()

    // 2. Generate deterministic user-scoped R2 storage key: users/{userId}/documents/{documentId}/{safeFileName}
    const storageKey = generateDocumentStorageKey(user.id, documentId, input.fileName)

    // 3. Generate presigned PUT URL valid for 10 minutes
    const contentType = input.mimeType || 'application/octet-stream'
    const uploadUrl = await getPresignedUploadUrl(storageKey, contentType, 600)

    return {
      success: true,
      data: {
        documentId,
        uploadUrl,
        storageKey,
        storageProvider: 'r2',
      },
    }
  } catch (err: unknown) {
    console.error('Error generating presigned upload URL:', err)
    const rawMessage = err instanceof Error ? err.message : ''
    const isConfigError = rawMessage.includes('Cloudflare R2 environment variables are missing')
    const message = isConfigError
      ? 'Unable to authorize document upload. Storage service configuration is required.'
      : (rawMessage || 'Failed to generate upload authorization. Please try again.')
    return { success: false, error: message }
  }
}

/**
 * Server Action: Persists document metadata into Supabase after successful binary upload to R2.
 */
export async function createDocumentAction(input: {
  id: string
  title?: string
  description?: string | null
  fileName: string
  filePath?: string
  storageKey?: string
  storageProvider?: 'supabase' | 'r2' | string
  mimeType: string
  fileSizeBytes: number
  category?: DocumentCategory | string | null
}): Promise<ActionResult<StudyDocument>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    if (!input.id) {
      return { success: false, error: 'Invalid document ID.' }
    }

    if (!input.fileName || !input.fileName.trim()) {
      return { success: false, error: 'File name is required.' }
    }

    if (!isSupportedDocumentFile(input.fileName)) {
      return {
        success: false,
        error: `Unsupported document format. Allowed formats: ${getSupportedDocumentFormatsText()}.`,
      }
    }

    if (!input.fileSizeBytes || input.fileSizeBytes <= 0) {
      return { success: false, error: 'Cannot save an empty file (0 bytes).' }
    }

    if (input.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: 'File size exceeds the maximum allowed limit of 50 MB.' }
    }

    const key = input.storageKey || input.filePath || ''

    // Strict user scoping validation
    if (!key || !isUserStorageKey(key, user.id)) {
      return { success: false, error: 'Invalid storage file path or access denied.' }
    }

    const titleToUse = input.title?.trim() || input.fileName.trim()
    const rawCategory = input.category ? input.category.trim() : null

    // If custom category, register it to user's category list
    if (
      rawCategory &&
      !DOCUMENT_CATEGORIES.some(
        (c) => c.value.toLowerCase() === rawCategory.toLowerCase() || c.label.toLowerCase() === rawCategory.toLowerCase()
      )
    ) {
      try {
        await createUserCategory(user.id, { name: rawCategory })
      } catch {}
    }

    const document = await createDocument({
      id: input.id,
      userId: user.id,
      title: titleToUse,
      description: input.description,
      fileName: input.fileName,
      filePath: key,
      storageKey: key,
      storageProvider: input.storageProvider || 'r2',
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      category: rawCategory,
    })

    revalidatePath('/documents')
    revalidatePath('/dashboard')
    return { success: true, data: document }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while saving document metadata'
    return { success: false, error: message }
  }
}

/**
 * Server Action: Deletes an orphaned storage object if metadata insertion fails.
 */
export async function cleanupFailedUploadAction(
  storageKey: string,
  storageProvider: string = 'r2'
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized.' }
    }

    if (!isUserStorageKey(storageKey, user.id)) {
      return { success: false, error: 'Access denied.' }
    }

    if (storageProvider === 'r2' || storageKey.startsWith('users/')) {
      await deleteR2Object(storageKey)
    } else {
      await supabase.storage.from('study-documents').remove([storageKey])
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('Error during cleanup of failed upload:', err)
    return { success: false, error: 'Failed to clean up upload object' }
  }
}

/**
 * Server Action: Generates a temporary signed view URL for an owned document.
 */
export async function getDownloadUrlAction(documentId: string): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Look up document and verify ownership
    const doc = await getDocument(documentId, user.id)
    if (!doc) {
      return { success: false, error: 'Document not found or access denied.' }
    }

    const key = doc.storage_key || doc.file_path

    // Verify storage path security
    if (!isUserStorageKey(key, user.id)) {
      return { success: false, error: 'Access denied to document file.' }
    }

    const signedUrl = await getDocumentDownloadUrl(key, doc.storage_provider || 'r2', doc.file_name)
    return { success: true, data: signedUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while generating download link'
    return { success: false, error: message }
  }
}

/**
 * Server Action: Deletes a document binary object and its metadata.
 */
export async function deleteDocumentAction(documentId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    // Look up document and verify ownership
    const doc = await getDocument(documentId, user.id)
    if (!doc) {
      return { success: false, error: 'Document not found or access denied.' }
    }

    const key = doc.storage_key || doc.file_path
    await deleteDocument(doc.id, user.id, key, doc.storage_provider || 'r2')

    revalidatePath('/documents')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while deleting document'
    return { success: false, error: message }
  }
}
