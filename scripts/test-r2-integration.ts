/**
 * StudySpace Automated Cloudflare R2 Storage Integration Test
 *
 * Tests:
 * 1. Storage key sanitization and user scoping rules
 * 2. Environment variable presence
 * 3. PutObject (upload buffer)
 * 4. HeadObject (verify existence & size)
 * 5. Presigned GET URL generation
 * 6. DeleteObject (remove object)
 * 7. Verify 404 after deletion
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

import { testR2Connection } from '../lib/storage/r2'
import { generateDocumentStorageKey, isUserStorageKey, parseDocumentStorageKey } from '../lib/storage/keys'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exitCode = 1
  } else {
    console.log(`✅ PASSED: ${message}`)
  }
}

async function run() {
  console.log('=== StudySpace Cloudflare R2 Storage Integration Test ===\n')

  // 1. Test Storage Key Utilities
  console.log('1. Testing Storage Key Sanitization & Scoping...')
  const sampleUserId = '8f3a960b-1122-3344-5566-778899aabbcc'
  const sampleDocId = '31a98765-4321-0000-1111-222233334444'
  const key = generateDocumentStorageKey(sampleUserId, sampleDocId, 'Operating Systems Notes (Spring/2026).pdf')
  assert(
    key === `users/${sampleUserId}/documents/${sampleDocId}/Operating_Systems_Notes_Spring_2026_.pdf`,
    `Key correctly sanitized: ${key}`
  )
  assert(isUserStorageKey(key, sampleUserId), 'Storage key strictly validated against owner user ID')
  assert(!isUserStorageKey(key, 'attacker-user-id'), 'Cross-user storage key access blocked')

  const parsed = parseDocumentStorageKey(key)
  assert(
    parsed !== null && parsed.userId === sampleUserId && parsed.documentId === sampleDocId,
    'Storage key cleanly parses into userId, documentId, and fileName'
  )

  // 2. Check R2 Environment Variables
  console.log('\n2. Checking Cloudflare R2 Server Environment...')
  const hasAccountId = !!process.env.R2_ACCOUNT_ID
  const hasAccessKey = !!process.env.R2_ACCESS_KEY_ID
  const hasSecretKey = !!process.env.R2_SECRET_ACCESS_KEY

  if (!hasAccountId || !hasAccessKey || !hasSecretKey) {
    console.log('ℹ️  R2 credentials are not set in .env.local. Storage key invariants verified successfully.')
    console.log('   Configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in .env.local for live cloud testing.')
    console.log('\n=== Automated Test Suite Finished ===\n')
    return
  }

  assert(hasAccountId, 'R2_ACCOUNT_ID is present')
  assert(hasAccessKey, 'R2_ACCESS_KEY_ID is present')
  assert(hasSecretKey, 'R2_SECRET_ACCESS_KEY is present')

  // 3. Live Round-Trip R2 Lifecycle Test
  console.log('\n3. Executing Live R2 Storage Lifecycle Test...')
  const result = await testR2Connection()
  for (const step of result.steps) {
    assert(step.success, `${step.name}: ${step.details || 'ok'}`)
  }

  assert(result.success, `Full R2 Round-Trip Lifecycle Completed in ${result.durationMs}ms`)
  console.log('\n=== All Cloudflare R2 Integration Tests Completed ===\n')
}

run()
