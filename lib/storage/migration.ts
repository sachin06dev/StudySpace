import { createClient } from '@/lib/supabase/server'
import {
  putR2Object,
  headR2Object,
} from '@/lib/storage/r2'
import { generateDocumentStorageKey } from '@/lib/storage/keys'

export interface MigrationOptions {
  batchSize?: number
  deleteOriginalFromSupabase?: boolean
  onProgress?: (message: string) => void
}

export interface MigrationSummary {
  totalFound: number
  migrated: number
  skipped: number
  failed: number
  errors: { documentId: string; fileName: string; error: string }[]
  durationMs: number
}

/**
 * Safely migrates documents from Supabase Storage to Cloudflare R2.
 * Idempotent, resumable, and non-destructive by default.
 */
export async function migrateDocumentsToR2(
  options: MigrationOptions = {}
): Promise<MigrationSummary> {
  const { batchSize = 100, deleteOriginalFromSupabase = false, onProgress } = options
  const startTime = Date.now()
  const supabase = await createClient()

  // 1. Query documents that are not yet migrated to R2 (i.e. path does not start with 'users/')
  const { data: documents, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .limit(batchSize)

  if (fetchError) {
    throw new Error(`Failed to query documents: ${fetchError.message}`)
  }

  const items = (documents || []).filter(
    (doc) => doc.file_path && !doc.file_path.startsWith('users/')
  )
  const summary: MigrationSummary = {
    totalFound: items.length,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  }

  onProgress?.(`Found ${items.length} unmigrated document(s) to process.`)

  for (const doc of items) {
    const docId = doc.id
    const fileName = doc.file_name || doc.title || 'document'
    const legacyFilePath = doc.file_path

    if (!legacyFilePath) {
      summary.skipped++
      continue
    }

    try {
      // 2. Download from legacy Supabase Storage bucket
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(legacyFilePath)

      if (downloadError || !fileData) {
        summary.failed++
        summary.errors.push({
          documentId: docId,
          fileName,
          error: `Download from Supabase failed: ${downloadError?.message || 'Empty data'}`,
        })
        continue
      }

      // Convert Blob to ArrayBuffer / Buffer
      const arrayBuffer = await fileData.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // 3. Upload to Cloudflare R2
      const storageKey = doc.storage_key || generateDocumentStorageKey(doc.user_id, docId, fileName)
      const mimeType = doc.mime_type || fileData.type || 'application/octet-stream'

      await putR2Object(storageKey, buffer, mimeType)

      // 4. Verify R2 upload via HEAD request
      const existsInR2 = await headR2Object(storageKey)
      if (!existsInR2) {
        summary.failed++
        summary.errors.push({
          documentId: docId,
          fileName,
          error: 'Verification failed: object not found in R2 after upload',
        })
        continue
      }

      // 5. Update Supabase database record
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          file_path: storageKey,
          updated_at: new Date().toISOString(),
        })
        .eq('id', docId)

      if (updateError) {
        summary.failed++
        summary.errors.push({
          documentId: docId,
          fileName,
          error: `Database update failed: ${updateError.message}`,
        })
        continue
      }

      // 6. Optionally delete original file from Supabase storage
      if (deleteOriginalFromSupabase) {
        try {
          await supabase.storage.from('documents').remove([legacyFilePath])
        } catch {
          // Non-blocking cleanup error
        }
      }

      summary.migrated++
      onProgress?.(`Migrated: ${fileName} (${docId})`)
    } catch (err: unknown) {
      summary.failed++
      summary.errors.push({
        documentId: docId,
        fileName,
        error: err instanceof Error ? err.message : 'Unknown migration error',
      })
    }
  }

  summary.durationMs = Date.now() - startTime
  return summary
}

/**
 * Returns overall document storage migration metrics and percentage complete.
 */
export async function getMigrationStatus(): Promise<{
  totalDocuments: number
  r2Documents: number
  supabaseDocuments: number
  percentComplete: number
}> {
  const supabase = await createClient()

  // Get total count and list
  const { data: allDocs, error } = await supabase
    .from('documents')
    .select('file_path')

  if (error || !allDocs) {
    return {
      totalDocuments: 0,
      r2Documents: 0,
      supabaseDocuments: 0,
      percentComplete: 100,
    }
  }

  const total = allDocs.length
  const r2 = allDocs.filter((d) => d.file_path && d.file_path.startsWith('users/')).length
  const legacy = Math.max(0, total - r2)
  const percent = total > 0 ? Math.round((r2 / total) * 100) : 100

  return {
    totalDocuments: total,
    r2Documents: r2,
    supabaseDocuments: legacy,
    percentComplete: percent,
  }
}
