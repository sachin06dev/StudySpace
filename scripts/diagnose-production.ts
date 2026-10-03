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

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key present:', !!supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

async function main() {
  const testEmail = 'integration_test_user@studyspace.internal'
  const testPassword = 'TestPassword123!@#'

  console.log('Attempting sign in...')
  let { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (error) {
    console.log('Sign in failed, attempting sign up...', error.message)
    const signUpRes = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    if (signUpRes.error) {
      console.error('Sign up also failed:', signUpRes.error)
      return
    }
    console.log('Sign up succeeded! User ID:', signUpRes.data.user?.id)
    data = signUpRes.data as any
  } else {
    console.log('Sign in succeeded! User ID:', data.user?.id)
  }

  const token = data.session?.access_token
  console.log('Got access token:', token ? `${token.substring(0, 15)}... (len: ${token.length})` : 'none')
}

main().catch(console.error)
