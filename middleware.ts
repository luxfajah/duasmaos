import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Prevents breaking if env vars are missing
    if (!supabaseUrl || !supabaseKey) {
      return supabaseResponse
    }

    // Compatible with Edge Runtime and properly syncs Supabase session cookies
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Public routes that don't need authentication (preventing redirect loops)
    const isPublicRoute = 
      request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/signup') || 
      request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/api')

    // If no user and Route is not public, redirect to login
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const redirectResponse = NextResponse.redirect(url)
      
      // Preserve Supabase cookies on redirect
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      
      return redirectResponse
    }

    return supabaseResponse
  } catch (error) {
    // Catches absolute failures preventing MIDDLEWARE_INVOCATION_FAILED
    console.error("Middleware Error:", error)
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

