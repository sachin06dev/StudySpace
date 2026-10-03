/**
 * StudySpace CLI: Cloudflare R2 Document Storage Migration Script
 *
 * Usage:
 *   npx tsx scripts/migrate-documents-to-r2.ts
 *   npx tsx scripts/migrate-documents-to-r2.ts --delete-original
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load .env.local manually if present without external dependencies
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

import { migrateDocumentsToR2 } from '../lib/storage/migration'

async function run() {
  console.log('===========================================================')
  console.log('StudySpace Cloudflare R2 Document Migration')
  console.log('===========================================================\n')

  const deleteOriginal = process.argv.includes('--delete-original')
  if (deleteOriginal) {
    console.log('⚠️  FLAG ENABLED: Will delete legacy Supabase Storage objects after verification.\n')
  } else {
    console.log('ℹ️  SAFE MODE: Original Supabase Storage objects will be preserved.\n')
  }

  try {
    const summary = await migrateDocumentsToR2({
      batchSize: 100,
      deleteOriginalFromSupabase: deleteOriginal,
      onProgress: (msg) => console.log(`[PROGRESS] ${msg}`),
    })

    console.log('\n===========================================================')
    console.log('Migration Summary')
    console.log('===========================================================')
    console.log(`Total Found : ${summary.totalFound}`)
    console.log(`Migrated    : ${summary.migrated}`)
    console.log(`Skipped     : ${summary.skipped}`)
    console.log(`Failed      : ${summary.failed}`)
    console.log(`Duration    : ${summary.durationMs} ms\n`)

    if (summary.errors.length > 0) {
      console.error('Errors encountered:')
      summary.errors.forEach((err) => {
        console.error(` - [${err.documentId}] ${err.fileName}: ${err.error}`)
      })
      process.exit(1)
    } else {
      console.log('✅ All documents processed successfully.')
      process.exit(0)
    }
  } catch (err) {
    console.error('Fatal migration error:', err)
    process.exit(1)
  }
}

run()
