import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  // Support authorized mobile deep-link schemes to avoid trapping mobile users in web UI
  const isMobileDeepLink =
    typeof rawNext === 'string' &&
    (rawNext.startsWith('io.supabase.studyspace://') || rawNext.startsWith('studyspace://'))

  // Sanitize next parameter to prevent open redirect vulnerabilities
  const isValidNext =
    isMobileDeepLink ||
    (typeof rawNext === 'string' &&
      rawNext.startsWith('/') &&
      !rawNext.startsWith('//') &&
      !rawNext.startsWith('/\\') &&
      !rawNext.includes('\\') &&
      !rawNext.includes(':'))

  const next = isValidNext ? rawNext : '/dashboard'

  // Handle OAuth provider error (e.g., user cancellation or access denied)
  if (oauthError) {
    console.error('OAuth error callback:', oauthError, oauthErrorDescription)
    const errorParam = encodeURIComponent(oauthErrorDescription || oauthError)
    if (isMobileDeepLink) {
      return NextResponse.redirect(`${next}?error=${errorParam}`)
    }
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`)
  }

  if (!code) {
    if (isMobileDeepLink) {
      return NextResponse.redirect(`${next}?error=missing_code`)
    }
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Failed to exchange OAuth code for session:', error.message)
    if (isMobileDeepLink) {
      return NextResponse.redirect(`${next}?error=oauth_callback_failed`)
    }
    return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`)
  }

  if (isMobileDeepLink) {
    return NextResponse.redirect(next)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
