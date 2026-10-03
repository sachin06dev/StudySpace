import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DocumentCategory } from '@/lib/documents/utils'
import { getPresignedDownloadUrl, deleteR2Object } from '@/lib/storage/r2'

export interface StudyDocument {
  id: string
  user_id: string
  title: string
  description: string | null
  file_name: string
  file_path: string
  mime_type: string
  file_size_bytes: number
  category: DocumentCategory | string | null
  storage_provider: 'supabase' | 'r2' | string
  storage_key: string | null
  created_at: string
  updated_at: string
}

export interface CreateDocumentInput {
  id: string
  userId: string
  title: string
  description?: string | null
  fileName: string
  filePath?: string
  storageKey: string
  storageProvider?: 'supabase' | 'r2' | string
  mimeType: string
  fileSizeBytes: number
  category?: DocumentCategory | string | null
}

/**
 * Helper to ensure consistent StudyDocument object shape regardless of database column differences.
 */
function mapDocumentRow(doc: Record<string, unknown> | null): StudyDocument {
  if (!doc) return doc as unknown as StudyDocument
  const filePath = (doc.file_path as string) || ''
  const isR2 = doc.storage_provider === 'r2' || filePath.startsWith('users/')
  return {
    ...(doc as unknown as StudyDocument),
    storage_provider: (doc.storage_provider as string) || (isR2 ? 'r2' : 'supabase'),
    storage_key: (doc.storage_key as string) || filePath || null,
  }
}

/**
 * Fetches all documents for a user, ordered with newest first.
 */
export async function getDocuments(userId: string, client?: SupabaseClient | null): Promise<StudyDocument[]> {
  const supabase = client || (await createClient())
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error('Failed to fetch documents')
  }

  return (data || []).map((row: Record<string, unknown>) => mapDocumentRow(row))
}

/**
 * Fetches a single document by ID and user ID.
 */
export async function getDocument(id: string, userId: string, client?: SupabaseClient | null): Promise<StudyDocument | null> {
  const supabase = client || (await createClient())
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error(`Error fetching document ${id}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error('Failed to fetch document')
  }

  return mapDocumentRow(data)
}

/**
 * Creates a new document metadata record in the database.
 */
export async function createDocument(input: CreateDocumentInput, client?: SupabaseClient | null): Promise<StudyDocument> {
  const supabase = client || (await createClient())
  const key = input.storageKey || input.filePath || ''

  // Build the payload matching the active database schema
  const payload = {
    id: input.id,
    user_id: input.userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    file_name: input.fileName,
    file_path: key,
    mime_type: input.mimeType || 'application/pdf',
    file_size_bytes: input.fileSizeBytes,
    category: input.category || null,
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Document metadata insert failed:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error('Failed to create document record')
  }

  return mapDocumentRow(data)
}

/**
 * Generates a signed view URL for a document.
 * Routes to Cloudflare R2 presigned URLs if storage_provider === 'r2' (or storage_key starts with 'users/').
 * Falls back to Supabase Storage signed URLs for legacy unmigrated files.
 */
export async function getDocumentDownloadUrl(
  filePathOrKey: string,
  storageProvider: string = 'r2',
  fileName?: string
): Promise<string> {
  // If provider is R2 or starts with 'users/'
  if (storageProvider === 'r2' || filePathOrKey.startsWith('users/')) {
    try {
      return await getPresignedDownloadUrl(filePathOrKey, 900, fileName)
    } catch (r2Error) {
      console.error(`Error generating R2 presigned URL for ${filePathOrKey}:`, r2Error)
      throw new Error('Failed to generate R2 document view link')
    }
  }

  // Supabase Storage fallback for legacy files
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('study-documents')
    .createSignedUrl(filePathOrKey, 60, { download: false })

  if (error || !data?.signedUrl) {
    console.error(`Error generating Supabase signed view URL for ${filePathOrKey}:`, error)
    throw new Error('Failed to generate view URL')
  }

  return data.signedUrl
}

/**
 * Deletes BOTH the storage file (R2 or Supabase) and the database row for a document.
 * If storage deletion fails, the database row is kept intact to prevent orphaned files.
 */
export async function deleteDocument(
  id: string,
  userId: string,
  storageKeyOrPath: string,
  storageProvider: string = 'r2',
  client?: SupabaseClient | null
): Promise<void> {
  // 1. Remove storage object from the appropriate provider
  if (storageProvider === 'r2' || storageKeyOrPath.startsWith('users/')) {
    try {
      await deleteR2Object(storageKeyOrPath)
    } catch (r2Err) {
      console.error(`Error deleting R2 object ${storageKeyOrPath}:`, r2Err)
      throw new Error('Failed to delete file from Cloudflare R2. Document deletion aborted.')
    }
  } else {
    const supabase = client || (await createClient())
    const { error: storageError } = await supabase.storage
      .from('study-documents')
      .remove([storageKeyOrPath])

    if (storageError) {
      console.error(`Error deleting Supabase storage file ${storageKeyOrPath}:`, storageError)
      throw new Error('Failed to delete file from Supabase storage. Document deletion aborted.')
    }
  }

  // 2. Delete row from documents table
  const supabase = client || (await createClient())
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (dbError) {
    console.error(`Error deleting document row ${id}:`, {
      message: dbError.message,
      code: dbError.code,
      details: dbError.details,
      hint: dbError.hint,
    })
    throw new Error('Failed to delete document metadata record')
  }
}
