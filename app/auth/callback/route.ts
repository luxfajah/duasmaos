import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/profile'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Se o login incluiu o provedor Google e retornou um refresh token, nós o salvamos
      if (data.session.provider_refresh_token && data.session.user) {
        // Upsert na tabela user_integrations
        const { error: dbError } = await supabase.from('user_integrations').upsert({
          user_id: data.session.user.id,
          google_refresh_token: data.session.provider_refresh_token,
          updated_at: new Date().toISOString()
        })
        
        if (dbError) {
          console.error('Erro ao salvar refresh token:', dbError)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se deu erro, redireciona para a home
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`)
}
