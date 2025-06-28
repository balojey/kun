import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/env.mjs';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Create Supabase client using @supabase/ssr
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key: string) => request.cookies.get(key)?.value,
        set: (key: string, value: string, options: any) => {
          response.cookies.set(key, value, options);
        },
        remove: (key: string, options: any) => {
          response.cookies.set(key, '', { ...options, maxAge: 0 });
        },
      },
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};