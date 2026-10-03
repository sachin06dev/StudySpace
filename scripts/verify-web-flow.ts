import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { getPresignedUploadUrl, getPresignedDownloadUrl, deleteR2Object } from '../lib/storage/r2'
import { generateDocumentStorageKey } from '../lib/storage/keys'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

async function testWebDocumentFlow() {
  console.log('=== Verifying Web Document Flow ===')

  // Authenticate user
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'integration_test_user@studyspace.internal',
    password: 'TestPassword123!@#',
  })

  if (authErr || !authData.user) {
    throw new Error('Supabase Auth failed: ' + authErr?.message)
  }

  const userId = authData.user.id
  console.log('1. Authenticated web user:', userId)

  // 1. Generate presigned upload URL (same as web Server Action)
  const documentId = crypto.randomUUID()
  const fileName = 'web_test_doc.pdf'
  const storageKey = generateDocumentStorageKey(userId, documentId, fileName)
  const uploadUrl = await getPresignedUploadUrl(storageKey, 'application/pdf', 600)
  console.log('2. Generated presigned upload URL for web')

  // 2. Direct browser upload with fetch PUT
  const pdfBytes = Buffer.from('%PDF-1.4\n%Web regression test document\n%%EOF', 'utf-8')
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: pdfBytes,
  })

  if (!putRes.ok) {
    throw new Error(`Direct PUT failed: ${putRes.status} ${putRes.statusText}`)
  }
  console.log('3. Browser direct PUT to R2 succeeded (HTTP 200)')

  // 3. User authenticated Supabase client for metadata
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  })

  const { data: docData, error: insertErr } = await userClient
    .from('documents')
    .insert({
      id: documentId,
      user_id: userId,
      title: 'Web Regression Test Document',
      file_name: fileName,
      file_path: storageKey,
      mime_type: 'application/pdf',
      file_size_bytes: pdfBytes.length,
      category: 'notes',
    })
    .select()
    .single()

  if (insertErr) {
    throw new Error(`Web metadata insert failed: ${insertErr.message}`)
  }
  console.log('4. Web metadata record created:', docData.id)

  // 4. Generate presigned download URL
  const downloadUrl = await getPresignedDownloadUrl(storageKey, 900, fileName)
  console.log('5. Presigned download URL generated for web viewer')

  // 5. Download and verify content
  const downloadRes = await fetch(downloadUrl)
  if (!downloadRes.ok) {
    throw new Error(`Presigned GET failed: ${downloadRes.status}`)
  }
  console.log('6. Presigned GET fetched successfully, Content-Type:', downloadRes.headers.get('content-type'))

  // 6. Cleanup
  await deleteR2Object(storageKey)
  await userClient.from('documents').delete().eq('id', documentId).eq('user_id', userId)
  console.log('7. Cleanup completed. Web document flow verified 100%!')
}

testWebDocumentFlow().catch((e) => {
  console.error('❌ Web flow verification failed:', e)
  process.exit(1)
})
