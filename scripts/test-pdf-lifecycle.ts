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

import { getPresignedUploadUrl, getPresignedDownloadUrl, deleteR2Object } from '../lib/storage/r2'
import { generateDocumentStorageKey } from '../lib/storage/keys'

async function testPdfLifecycle() {
  console.log('=== Real PDF Upload & Download Lifecycle Test on R2 ===\n')

  const userId = '87a87be3-ceb7-46c8-aa92-64a51b8cf8bc'
  const docId = 'test-doc-' + Date.now()
  const fileName = 'Sample_Lecture_Notes.pdf'
  const storageKey = generateDocumentStorageKey(userId, docId, fileName)
  console.log('Generated Storage Key:', storageKey)

  // 1. Generate Presigned Upload URL
  const uploadUrl = await getPresignedUploadUrl(storageKey, 'application/pdf', 600)
  console.log('1. Presigned Upload URL generated successfully (len: ' + uploadUrl.length + ')')

  // 2. Minimal valid 1-page PDF bytes
  const pdfString = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000102 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
178
%%EOF`
  const pdfBytes = Buffer.from(pdfString, 'utf-8')

  // 3. Perform PUT to R2
  console.log('2. Uploading PDF bytes (' + pdfBytes.length + ' bytes) to R2 via PUT...')
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: pdfBytes,
  })
  console.log(`PUT status: ${putRes.status} ${putRes.statusText}`)
  if (!putRes.ok) {
    throw new Error('PUT to R2 failed: ' + await putRes.text())
  }
  console.log('✅ Direct PUT upload succeeded!')

  // 4. Generate Presigned Download URL
  console.log('\n3. Generating Presigned GET URL...')
  const downloadUrl = await getPresignedDownloadUrl(storageKey, 900, fileName)
  console.log('Presigned GET URL generated (len: ' + downloadUrl.length + ')')

  // 5. Fetch PDF via Presigned GET URL
  console.log('\n4. Fetching PDF via Presigned GET URL...')
  const getRes = await fetch(downloadUrl)
  console.log(`GET status: ${getRes.status} ${getRes.statusText}`)
  console.log(`Content-Type: ${getRes.headers.get('content-type')}`)
  console.log(`Content-Disposition: ${getRes.headers.get('content-disposition')}`)
  const downloadedBytes = await getRes.arrayBuffer()
  console.log(`Downloaded bytes: ${downloadedBytes.byteLength}`)

  if (getRes.status === 200 && getRes.headers.get('content-type')?.includes('application/pdf')) {
    console.log('✅ PDF retrieved successfully with valid application/pdf Content-Type!')
  } else {
    throw new Error('PDF retrieval failed or incorrect Content-Type')
  }

  // 6. Cleanup
  console.log('\n5. Cleaning up test object...')
  await deleteR2Object(storageKey)
  console.log('✅ Cleaned up test object from R2.')
  console.log('\n=== All PDF Lifecycle Tests Passed! ===')
}

testPdfLifecycle().catch(console.error)
