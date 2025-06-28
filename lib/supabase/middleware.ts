import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env.mjs'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Check if the path is a public route
  const { pathname } = request.nextUrl;
  const isPublicRoute = pathname === '/' || 
                        pathname === '/pricing' || 
                        pathname === '/login' || 
                        pathname === '/signup' || 
                        pathname.startsWith('/auth/');
  
  // If it's a public route, allow access without authentication check
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // For protected routes, check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    pathname.startsWith('/app')
  ) {
    // no user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Add CORS headers to the response
  supabaseResponse.headers.set("Access-Control-Allow-Origin", "*")
  supabaseResponse.headers.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  supabaseResponse.headers.set("Access-Control-Allow-Headers", "Content-Type")

  return supabaseResponse
}