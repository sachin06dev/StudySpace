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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

async function testBearerTokenClient() {
  console.log('=== Testing Supabase Client with Bearer Token ===')

  // 1. Authenticate test user to get JWT
  const authClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
    email: 'integration_test_user@studyspace.internal',
    password: 'TestPassword123!@#',
  })

  if (authErr || !authData.session) {
    console.error('Auth error:', authErr)
    return
  }

  const token = authData.session.access_token
  const userId = authData.user.id
  console.log('User ID:', userId)

  // 2. Client WITHOUT Bearer token header (simulating the current bug)
  console.log('\n2. Testing insert WITHOUT Bearer header (current bug):')
  const clientWithoutHeader = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  const testDocId1 = crypto.randomUUID()
  const { error: errWithout } = await clientWithoutHeader.from('documents').insert({
    id: testDocId1,
    user_id: userId,
    title: 'Test Doc Without Header',
    file_name: 'test.pdf',
    file_path: `users/${userId}/documents/${testDocId1}/test.pdf`,
    file_size_bytes: 100,
  })
  console.log('Insert without header result error:', errWithout?.message || 'none')

  // 3. Client WITH Bearer token header
  console.log('\n3. Testing insert WITH Bearer header:')
  const clientWithHeader = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
  const testDocId2 = crypto.randomUUID()
  const { data: insertData, error: errWith } = await clientWithHeader.from('documents').insert({
    id: testDocId2,
    user_id: userId,
    title: 'Test Doc With Header',
    file_name: 'test.pdf',
    file_path: `users/${userId}/documents/${testDocId2}/test.pdf`,
    file_size_bytes: 100,
  }).select().single()

  console.log('Insert with header result error:', errWith?.message || 'none')
  console.log('Inserted doc successfully:', insertData?.id)

  if (insertData?.id) {
    // 4. Test fetch
    const { data: fetchDoc, error: fetchErr } = await clientWithHeader
      .from('documents')
      .select('*')
      .eq('id', testDocId2)
      .single()
    console.log('Fetched document successfully:', fetchDoc?.title, 'error:', fetchErr?.message || 'none')

    // Clean up
    await clientWithHeader.from('documents').delete().eq('id', testDocId2)
    console.log('Cleaned up test document row.')
  }
}

testBearerTokenClient().catch(console.error)
