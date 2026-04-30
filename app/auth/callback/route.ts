import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/profile'

  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  if (error || errorCode) {
    console.error('OAuth Callback Error:', { error, errorCode, errorDescription })
    
    // Se estávamos em um popup, precisamos fechar ele mesmo com erro
    if (next === '/auth/close-popup') {
      return NextResponse.redirect(`${origin}/auth/close-popup?error=${errorCode || error}&description=${errorDescription}`)
    }
    
    return NextResponse.redirect(`${origin}/?error=${errorCode || error}`)
  }

  if (code) {
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && data.session) {
      const { user, provider_refresh_token } = data.session
      
      if (provider_refresh_token && user) {
        await supabase.from('user_integrations').upsert({
          user_id: user.id,
          google_refresh_token: provider_refresh_token,
          updated_at: new Date().toISOString()
        })
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`)
}
