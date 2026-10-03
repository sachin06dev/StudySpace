import { GetBucketCorsCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3'
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

import { getR2Client, getR2BucketName } from '../lib/storage/r2'

import { getPresignedUploadUrl } from '../lib/storage/r2'

async function checkCors() {
  console.log('=== Checking Cloudflare R2 CORS Configuration via Preflight OPTIONS ===')
  const testKey = `_system-tests/cors-test-${Date.now()}.pdf`
  const uploadUrl = await getPresignedUploadUrl(testKey, 'application/pdf', 300)
  console.log('Generated Presigned URL for CORS check')

  // Simulate browser preflight OPTIONS request
  try {
    const res = await fetch(uploadUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://studyspace4u.vercel.app',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type',
      }
    })
    console.log(`Preflight OPTIONS status: ${res.status} ${res.statusText}`)
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'))
    console.log('Access-Control-Allow-Methods:', res.headers.get('access-control-allow-methods'))
    console.log('Access-Control-Allow-Headers:', res.headers.get('access-control-allow-headers'))
  } catch (e) {
    console.error('Preflight OPTIONS failed:', e)
  }
}

checkCors().catch(console.error)
