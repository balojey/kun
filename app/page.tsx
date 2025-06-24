'use client';

import { useAuthContext } from '@/components/auth/auth-provider';
import { LandingPage } from '@/components/landing/landing-page';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Always show landing page at root, regardless of auth status
  return <LandingPage />;
}