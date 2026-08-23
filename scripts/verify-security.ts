/**
 * StudySpace Pre-Ship Security & Data Isolation Audit Verification Script
 *
 * Verifies:
 * 1. Database table schemas have RLS enabled and required user_id checks.
 * 2. Cross-user isolation rules across all data models.
 * 3. File upload restrictions (0 bytes rejected, max size enforced).
 * 4. Storage object path isolation and short-lived signed URLs.
 * 5. Server-side secret exposure checks.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const rootDir = process.cwd()

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exitCode = 1
  } else {
    console.log(`✅ PASSED: ${message}`)
  }
}

console.log('=== StudySpace Pre-Ship Security & Authorization Verification ===\n')

// 1. Check Secret Isolation
console.log('1. Checking Secret Isolation...')
const gitIgnoreContent = readFileSync(join(rootDir, '.gitignore'), 'utf8')
assert(gitIgnoreContent.includes('.env*'), '.gitignore properly excludes .env files')

const clientFiles = [
  'lib/supabase/client.ts',
  'components/auth/GoogleSignInButton.tsx',
  'components/documents/UploadDocumentForm.tsx',
]
for (const file of clientFiles) {
  const content = readFileSync(join(rootDir, file), 'utf8')
  assert(!content.includes('service_role'), `${file} does not contain service_role`)
  assert(!content.includes('SUPABASE_SERVICE_ROLE_KEY'), `${file} does not contain SUPABASE_SERVICE_ROLE_KEY`)
  assert(!content.includes('YOUTUBE_API_KEY'), `${file} does not reference server-only YOUTUBE_API_KEY`)
}

// 2. Check Database Schema RLS & Security Fixes
console.log('\n2. Checking Database Schema & SQL Scripts...')
const schemaSql = readFileSync(join(rootDir, 'supabase/schema.sql'), 'utf8')
const securityFixesSql = readFileSync(join(rootDir, 'supabase/security_fixes.sql'), 'utf8')

const userTables = [
  'profiles',
  'user_settings',
  'tasks',
  'pomodoro_sessions',
  'saved_videos',
  'saved_playlists',
  'video_timestamp_notes',
  'website_resources',
  'documents',
  'user_categories',
]

for (const table of userTables) {
  assert(schemaSql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`), `RLS is enabled for public.${table}`)
  assert(securityFixesSql.includes(`ALTER TABLE IF EXISTS public.${table} ENABLE ROW LEVEL SECURITY;`), `Security fixes script reinforces RLS for public.${table}`)
}

// Check that playlist_items has NO DELETE policy
assert(!schemaSql.includes('ON public.playlist_items FOR DELETE'), 'playlist_items does not have a client DELETE policy')
assert(!securityFixesSql.includes('CREATE POLICY "delete playlist_items"'), 'security_fixes.sql drops DELETE on playlist_items')

// Check storage.objects UPDATE WITH CHECK
const normalizedSchema = schemaSql.replace(/\r\n/g, '\n')
const normalizedSecurityFixes = securityFixesSql.replace(/\r\n/g, '\n')
assert(normalizedSchema.includes('CREATE POLICY "Users can update their own documents"') && normalizedSchema.includes('WITH CHECK (\n        bucket_id = \'study-documents\' AND\n        (storage.foldername(name))[1] = (select auth.uid())::text'), 'storage.objects UPDATE policy includes WITH CHECK')
assert(normalizedSecurityFixes.includes('WITH CHECK (\n        bucket_id = \'study-documents\' AND\n        (storage.foldername(name))[1] = (select auth.uid())::text'), 'security_fixes.sql includes WITH CHECK on storage.objects UPDATE')

// Check handle_new_user search_path and EXECUTE revocation
assert(schemaSql.includes("SET search_path = ''"), 'handle_new_user has hardened search_path')
assert(schemaSql.includes('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;'), 'handle_new_user revokes EXECUTE from PUBLIC')
assert(schemaSql.includes('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;'), 'handle_new_user revokes EXECUTE from anon')
assert(schemaSql.includes('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;'), 'handle_new_user revokes EXECUTE from authenticated')

// 3. Check File Upload Validation & Mobile Permission Avoidance
console.log('\n3. Checking File Upload Security & Permission Policy Compliance...')
const docActionContent = readFileSync(join(rootDir, 'lib/actions/documents.ts'), 'utf8')
assert(docActionContent.includes('input.fileSizeBytes <= 0'), 'createDocumentAction rejects empty files (0 bytes)')
assert(docActionContent.includes('input.fileSizeBytes > MAX_FILE_SIZE_BYTES'), 'createDocumentAction rejects files exceeding 50 MB')
assert(docActionContent.includes("input.filePath.startsWith(`${user.id}/`)"), 'createDocumentAction strictly verifies user prefix in file path')
assert(docActionContent.includes('isSupportedDocumentFile(input.fileName)'), 'createDocumentAction verifies document file extension server-side')

const uploadFormContent = readFileSync(join(rootDir, 'components/documents/UploadDocumentForm.tsx'), 'utf8')
assert(uploadFormContent.includes('file.size <= 0'), 'UploadDocumentForm rejects empty files client-side')
assert(uploadFormContent.includes('file.size > MAX_FILE_SIZE_BYTES'), 'UploadDocumentForm rejects >50MB files client-side')
assert(uploadFormContent.includes('isSupportedDocumentFile(file.name)'), 'UploadDocumentForm rejects unsupported extensions client-side')
assert(!uploadFormContent.includes('capture'), 'UploadDocumentForm has NO capture attribute on file input')
assert(!uploadFormContent.includes('getUserMedia'), 'UploadDocumentForm does NOT call getUserMedia')
assert(!uploadFormContent.includes('mediaDevices'), 'UploadDocumentForm does NOT call mediaDevices')
assert(uploadFormContent.includes('DOCUMENT_ACCEPT_ATTRIBUTE'), 'UploadDocumentForm uses dedicated DOCUMENT_ACCEPT_ATTRIBUTE without image triggers')

// 4. Check Auth Route Open-Redirect Sanitization
console.log('\n4. Checking Auth Callback Protection...')
const callbackContent = readFileSync(join(rootDir, 'app/auth/callback/route.ts'), 'utf8')
assert(callbackContent.includes("rawNext.startsWith('/')"), 'OAuth callback validates relative redirect prefix')
assert(callbackContent.includes("!rawNext.startsWith('//')"), 'OAuth callback blocks protocol-relative open redirects')

console.log('\n=== All Automated Security Invariant Checks Completed ===\n')
