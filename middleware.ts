import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookies = request.cookies;
  const supabase = createMiddlewareClient(
    { req: request, res: response },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );
  
  // Check if the path is a public route
  const { pathname } = request.nextUrl;
  const isPublicRoute = pathname === '/' || 
                        pathname === '/pricing' || 
                        pathname === '/login' || 
                        pathname === '/signup' || 
                        pathname.startsWith('/auth/');
  
  // If it's a public route, allow access without authentication check
  if (isPublicRoute) {
    return response;
  }

  // For protected routes, check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access a protected route, redirect to login
  if (!session && pathname.startsWith('/app')) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};