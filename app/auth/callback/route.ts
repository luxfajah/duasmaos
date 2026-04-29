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
      const { user, provider_refresh_token, provider_token } = data.session
      
      console.log('OAuth Callback Session:', { 
        userId: user?.id, 
        hasRefreshToken: !!provider_refresh_token,
        hasAccessToken: !!provider_token 
      })

      if (provider_refresh_token && user) {
        const { error: dbError } = await supabase.from('user_integrations').upsert({
          user_id: user.id,
          google_refresh_token: provider_refresh_token,
          updated_at: new Date().toISOString()
        })
        
        if (dbError) {
          console.error('Erro ao salvar refresh token no banco:', dbError)
        } else {
          console.log('Refresh token salvo com sucesso para o usuário:', user.id)
        }
      } else if (user) {
        console.warn('Callback concluído mas provider_refresh_token está ausente. Persistence não funcionará.')
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se deu erro, redireciona para a home
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`)
}
