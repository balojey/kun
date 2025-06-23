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
    const publicRoutes = ['/', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/');
      return;
    }

    if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      router.replace('/');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For authenticated users, show the full app layout
  if (user) {
    return <>{children}</>;
  }

  // For unauthenticated users on public routes, show minimal layout
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Fallback - shouldn't reach here due to redirect above
  return null;
}