import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

const PRODUCTION_BASE = 'https://studyspace4u.vercel.app'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

async function runProductionDiagnostics() {
  console.log('=== Starting Real Production Runtime Diagnostics ===')
  console.log(`Target: ${PRODUCTION_BASE}`)

  // 1. Authenticate with Supabase
  console.log('\n[Step 1] Supabase Authentication...')
  const testEmail = 'integration_test_user@studyspace.internal'
  const testPassword = 'TestPassword123!@#'
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (authErr || !authData.session?.access_token) {
    console.error('❌ Supabase Auth failed:', authErr)
    return
  }

  const token = authData.session.access_token
  const userId = authData.user.id
  console.log(`✅ Authenticated user ID: ${userId}`)
  console.log(`✅ Supabase Bearer token obtained (${token.length} chars)`)

  // 2. Test Timetable Scan on Production Vercel
  console.log('\n[Step 2] Testing POST /api/timetable/scan on Production...')
  try {
    const fixturePath = path.join(process.cwd(), 'test-fixtures', 'real_timetable.png')
    const fileBytes = fs.readFileSync(fixturePath)
    const blob = new Blob([fileBytes], { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', blob, 'real_timetable.png')

    const scanRes = await fetch(`${PRODUCTION_BASE}/api/timetable/scan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    console.log(`Scan endpoint HTTP Status: ${scanRes.status} ${scanRes.statusText}`)
    const scanBody = await scanRes.text()
    console.log(`Scan endpoint response body: ${scanBody.slice(0, 500)}`)
  } catch (e) {
    console.error('❌ Scan request failed with exception:', e)
  }

  // 3. Test Document Upload URL on Production Vercel
  console.log('\n[Step 3] Testing POST /api/documents/upload-url on Production...')
  let uploadUrlData: any = null
  try {
    const dummyPdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000102 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n'
    const pdfBytes = Buffer.from(dummyPdfContent, 'utf-8')

    const uploadUrlRes = await fetch(`${PRODUCTION_BASE}/api/documents/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: 'production_debug_test.pdf',
        fileSizeBytes: pdfBytes.length,
        mimeType: 'application/pdf',
      }),
    })

    console.log(`Upload-URL endpoint HTTP Status: ${uploadUrlRes.status} ${uploadUrlRes.statusText}`)
    const uploadUrlBody = await uploadUrlRes.text()
    console.log(`Upload-URL response: ${uploadUrlBody.slice(0, 500)}`)

    if (uploadUrlRes.ok) {
      uploadUrlData = JSON.parse(uploadUrlBody).data
    }
  } catch (e) {
    console.error('❌ upload-url request exception:', e)
  }

  if (!uploadUrlData?.uploadUrl) {
    console.error('❌ Cannot proceed to R2 PUT test because uploadUrl was not generated.')
    return
  }

  // 4. Test direct PUT to Cloudflare R2 presigned URL
  console.log('\n[Step 4] Testing Direct PUT to Cloudflare R2 Presigned URL...')
  try {
    const dummyPdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000102 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n'
    const pdfBytes = Buffer.from(dummyPdfContent, 'utf-8')

    console.log(`Uploading ${pdfBytes.length} bytes to R2...`)
    const r2Res = await fetch(uploadUrlData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: pdfBytes,
    })

    console.log(`R2 PUT HTTP Status: ${r2Res.status} ${r2Res.statusText}`)
    if (r2Res.ok) {
      console.log('✅ R2 Direct PUT succeeded!')
    } else {
      console.error('❌ R2 Direct PUT failed:', await r2Res.text())
    }
  } catch (e) {
    console.error('❌ R2 PUT exception:', e)
  }

  // 5. Test POST /api/documents (metadata saving)
  console.log('\n[Step 5] Testing POST /api/documents (Metadata Save)...')
  let savedDocId: string = uploadUrlData.documentId
  try {
    const docRes = await fetch(`${PRODUCTION_BASE}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: savedDocId,
        title: 'Production Debug Document',
        fileName: 'production_debug_test.pdf',
        storageKey: uploadUrlData.storageKey,
        storageProvider: 'r2',
        fileSizeBytes: 200,
        mimeType: 'application/pdf',
        category: 'other',
      }),
    })

    console.log(`POST /api/documents HTTP Status: ${docRes.status} ${docRes.statusText}`)
    const docBody = await docRes.text()
    console.log(`POST /api/documents response: ${docBody.slice(0, 500)}`)
  } catch (e) {
    console.error('❌ POST /api/documents exception:', e)
  }

  // 6. Test GET /api/documents/url?id=... (viewing / download URL)
  console.log('\n[Step 6] Testing GET /api/documents/url?id=... on Production...')
  let downloadUrl: string | null = null
  try {
    const getUrlRes = await fetch(`${PRODUCTION_BASE}/api/documents/url?id=${savedDocId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(`GET /api/documents/url HTTP Status: ${getUrlRes.status} ${getUrlRes.statusText}`)
    const getUrlBody = await getUrlRes.text()
    console.log(`GET /api/documents/url response: ${getUrlBody.slice(0, 500)}`)

    if (getUrlRes.ok) {
      const parsed = JSON.parse(getUrlBody)
      downloadUrl = parsed.data?.url
    }
  } catch (e) {
    console.error('❌ GET /api/documents/url exception:', e)
  }

  // 7. Test fetching the presigned GET URL
  if (downloadUrl) {
    console.log('\n[Step 7] Testing fetching presigned GET URL directly...')
    try {
      const fetchPdfRes = await fetch(downloadUrl)
      console.log(`Presigned GET HTTP Status: ${fetchPdfRes.status} ${fetchPdfRes.statusText}`)
      console.log(`Content-Type: ${fetchPdfRes.headers.get('content-type')}`)
      console.log(`Content-Length: ${fetchPdfRes.headers.get('content-length')}`)
      const pdfData = await fetchPdfRes.arrayBuffer()
      console.log(`✅ Downloaded PDF size: ${pdfData.byteLength} bytes`)
    } catch (e) {
      console.error('❌ Presigned GET fetch exception:', e)
    }
  }
}

runProductionDiagnostics()
