export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // 1. Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // 2. Buscar o refresh token no banco
  const { data: integration, error } = await supabase
    .from('user_integrations')
    .select('google_refresh_token')
    .eq('user_id', user.id)
    .single()

  if (error || !integration?.google_refresh_token) {
    return NextResponse.json({ error: 'Nenhuma conta do Google vinculada' }, { status: 404 })
  }

  // 3. Fazer requisição para o Google OAuth para gerar um novo access token
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret || clientSecret === 'PREENCHER_AQUI') {
    return NextResponse.json({ error: 'Credenciais do Google não configuradas no servidor' }, { status: 500 })
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: integration.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro na API do Google:', data)
      return NextResponse.json({ error: 'Falha ao renovar o token do Google' }, { status: response.status })
    }

    // 4. Retornar o novo access_token
    return NextResponse.json({ access_token: data.access_token })
  } catch (err) {
    console.error('Erro na renovação do token:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
