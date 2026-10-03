import { createClient } from '@/lib/supabase/server'
import { headR2Object, listR2Objects } from '@/lib/storage/r2'

export interface ReconciliationReport {
  scannedDbRows: number
  scannedR2Objects: number
  missingR2Objects: {
    documentId: string
    userId: string
    title: string
    storageKey: string
  }[]
  orphanedR2Objects: {
    key: string
    sizeBytes: number
    lastModified?: Date
  }[]
  sizeMismatches: {
    documentId: string
    title: string
    storageKey: string
    dbSizeBytes: number
    r2SizeBytes: number
  }[]
  isHealthy: boolean
  durationMs: number
}

/**
 * Runs a comprehensive storage reconciliation audit between the Supabase PostgreSQL
 * documents table and Cloudflare R2 bucket objects.
 */
export async function runStorageReconciliation(): Promise<ReconciliationReport> {
  const startTime = Date.now()
  const supabase = await createClient()

  // 1. Fetch all documents
  const { data: dbRows, error } = await supabase
    .from('documents')
    .select('id, user_id, title, file_name, file_size_bytes, file_path')

  if (error) {
    throw new Error(`Failed to fetch database documents for reconciliation: ${error.message}`)
  }

  // Filter R2 documents (which have path starting with users/)
  const isR2Doc = (doc: { file_path?: string | null }) =>
    Boolean(doc.file_path && doc.file_path.startsWith('users/'))

  const documents = (dbRows || [])
    .filter(isR2Doc)
    .map((doc) => ({
      ...doc,
      storage_key: doc.file_path,
    }))
  const missingR2Objects: ReconciliationReport['missingR2Objects'] = []
  const sizeMismatches: ReconciliationReport['sizeMismatches'] = []

  // 2. Fetch all R2 bucket objects under the users/ namespace
  let r2Objects: Awaited<ReturnType<typeof listR2Objects>> = []
  try {
    r2Objects = await listR2Objects('users/', 10000)
  } catch (err) {
    console.error('Failed to list R2 objects during reconciliation:', err)
  }

  const r2KeyMap = new Map<string, number>()
  for (const obj of r2Objects) {
    if (obj.Key) {
      r2KeyMap.set(obj.Key, obj.Size || 0)
    }
  }

  // 3. Check DB rows against R2 objects
  for (const doc of documents) {
    const key = doc.storage_key
    if (!key) {
      missingR2Objects.push({
        documentId: doc.id,
        userId: doc.user_id,
        title: doc.title,
        storageKey: 'MISSING_KEY',
      })
      continue
    }

    if (r2KeyMap.has(key)) {
      const r2Size = r2KeyMap.get(key) || 0
      const dbSize = Number(doc.file_size_bytes) || 0
      if (r2Size !== dbSize && Math.abs(r2Size - dbSize) > 0) {
        sizeMismatches.push({
          documentId: doc.id,
          title: doc.title,
          storageKey: key,
          dbSizeBytes: dbSize,
          r2SizeBytes: r2Size,
        })
      }
    } else {
      // Check directly in case it was outside the list prefix or not returned
      const headCheck = await headR2Object(key)
      if (!headCheck) {
        missingR2Objects.push({
          documentId: doc.id,
          userId: doc.user_id,
          title: doc.title,
          storageKey: key,
        })
      } else {
        const dbSize = Number(doc.file_size_bytes) || 0
        if (headCheck.contentLength !== dbSize) {
          sizeMismatches.push({
            documentId: doc.id,
            title: doc.title,
            storageKey: key,
            dbSizeBytes: dbSize,
            r2SizeBytes: headCheck.contentLength,
          })
        }
      }
    }
  }

  // 4. Check for orphaned R2 objects that have no DB record
  const dbKeySet = new Set(documents.map((d) => d.storage_key).filter(Boolean))
  const orphanedR2Objects: ReconciliationReport['orphanedR2Objects'] = []

  for (const obj of r2Objects) {
    if (obj.Key && !dbKeySet.has(obj.Key)) {
      // Ignore system test objects
      if (!obj.Key.startsWith('_system-tests/')) {
        orphanedR2Objects.push({
          key: obj.Key,
          sizeBytes: obj.Size || 0,
          lastModified: obj.LastModified,
        })
      }
    }
  }

  const isHealthy =
    missingR2Objects.length === 0 &&
    orphanedR2Objects.length === 0 &&
    sizeMismatches.length === 0

  return {
    scannedDbRows: documents.length,
    scannedR2Objects: r2Objects.length,
    missingR2Objects,
    orphanedR2Objects,
    sizeMismatches,
    isHealthy,
    durationMs: Date.now() - startTime,
  }
}
