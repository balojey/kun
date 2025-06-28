'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './auth-provider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup', '/pricing'];
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/');

    // App routes that require authentication
    const isAppRoute = pathname.startsWith('/app');

    if (!user && isAppRoute) {
      router.push('/login');
      return;
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/app');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}