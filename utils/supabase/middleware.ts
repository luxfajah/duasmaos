import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase Environment Variables");
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Segurança: getUser() é mais seguro que getSession()
    const { data } = await supabase.auth.getUser()
    const user = data?.user

    // Rotas públicas que não precisam de login
    const isPublicRoute = 
      request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname === '/'; // Assumindo que a raiz pode ser pública (ajuste se necessário)

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (e) {
    console.error("Middleware Error:", e);
    // Se ocorrer erro, ignora para não quebrar o site
    return NextResponse.next({
      request,
    });
  }
}
