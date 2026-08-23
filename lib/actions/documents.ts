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

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createDocumentAction(input: {
  id: string
  title?: string
  description?: string | null
  fileName: string
  filePath: string
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

    // Verify filePath matches user's auth.uid() prefix
    if (!input.filePath || !input.filePath.startsWith(`${user.id}/`)) {
      return { success: false, error: 'Invalid storage file path.' }
    }

    const titleToUse = input.title?.trim() || input.fileName.trim()
    const rawCategory = input.category ? input.category.trim() : null

    // If it's a custom category, register it to the user's category list
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
      filePath: input.filePath,
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

    // Look up the document and verify ownership
    const doc = await getDocument(documentId, user.id)
    if (!doc) {
      return { success: false, error: 'Document not found or access denied.' }
    }

    // Verify storage path security
    if (!doc.file_path.startsWith(`${user.id}/`)) {
      return { success: false, error: 'Access denied to document file.' }
    }

    const signedUrl = await getDocumentDownloadUrl(doc.file_path)
    return { success: true, data: signedUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while generating download link'
    return { success: false, error: message }
  }
}

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

    // Look up the document and verify ownership
    const doc = await getDocument(documentId, user.id)
    if (!doc) {
      return { success: false, error: 'Document not found or access denied.' }
    }

    await deleteDocument(doc.id, user.id, doc.file_path)

    revalidatePath('/documents')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while deleting document'
    return { success: false, error: message }
  }
}
