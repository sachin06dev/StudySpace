import { createClient } from '@/lib/supabase/server'
import type { DocumentCategory } from '@/lib/documents/utils'

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
  created_at: string
  updated_at: string
}

export interface CreateDocumentInput {
  id: string
  userId: string
  title: string
  description?: string | null
  fileName: string
  filePath: string
  mimeType: string
  fileSizeBytes: number
  category?: DocumentCategory | string | null
}

/**
 * Fetches all documents for a user, ordered with newest first.
 */
export async function getDocuments(userId: string): Promise<StudyDocument[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error('Failed to fetch documents')
  }

  return (data || []) as StudyDocument[]
}

/**
 * Fetches a single document by ID and user ID.
 */
export async function getDocument(id: string, userId: string): Promise<StudyDocument | null> {
  const supabase = await createClient()
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
    console.error(`Error fetching document ${id}:`, error)
    throw new Error('Failed to fetch document')
  }

  return data as StudyDocument
}

/**
 * Creates a new document metadata record in the database.
 */
export async function createDocument(input: CreateDocumentInput): Promise<StudyDocument> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .insert({
      id: input.id,
      user_id: input.userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      file_name: input.fileName,
      file_path: input.filePath,
      mime_type: input.mimeType || 'application/octet-stream',
      file_size_bytes: input.fileSizeBytes,
      category: input.category || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document record:', error)
    throw new Error('Failed to create document record')
  }

  return data as StudyDocument
}

/**
 * Generates a short-lived (60s) signed view URL for a private storage object.
 * download: false ensures the browser opens/renders the file inline rather than forcing a download.
 */
export async function getDocumentDownloadUrl(filePath: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('study-documents')
    .createSignedUrl(filePath, 60, { download: false })

  if (error || !data?.signedUrl) {
    console.error(`Error generating signed view URL for ${filePath}:`, error)
    throw new Error('Failed to generate view URL')
  }

  return data.signedUrl
}

/**
 * Deletes BOTH the storage file and the database row for a document.
 * If storage deletion fails, the database row is kept intact to prevent orphaned files.
 */
export async function deleteDocument(id: string, userId: string, filePath: string): Promise<void> {
  const supabase = await createClient()

  // 1. Remove storage object from bucket
  const { error: storageError } = await supabase.storage
    .from('study-documents')
    .remove([filePath])

  if (storageError) {
    console.error(`Error deleting storage file ${filePath}:`, storageError)
    throw new Error('Failed to delete file from storage. Document deletion aborted.')
  }

  // 2. Delete row from documents table
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (dbError) {
    console.error(`Error deleting document row ${id}:`, dbError)
    throw new Error('Failed to delete document metadata record')
  }
}
