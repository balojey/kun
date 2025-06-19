'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './auth-provider';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  console.log('AuthGuard:', { user, loading, pathname });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
        router.push('/');
      }
      return;
    }

    if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      console.log('Redirecting to home from auth page');
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

  return <>{children}</>;
}