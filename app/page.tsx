'use client';

import { useAuthContext } from '@/components/auth/auth-provider';
import { LandingPage } from '@/components/landing/landing-page';
import { HomePage } from '@/components/home/home-page';
import { AppHeader } from '@/components/app-header';

export default function RootPage() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show home page for authenticated users with header
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8">
        <HomePage />
      </main>
    </div>
  );
}