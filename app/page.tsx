'use client';

import { useAuthContext } from '@/components/auth/auth-provider';
import { LandingPage } from '@/components/landing/landing-page';
import { HomePage } from '@/components/home/home-page';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';


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

  // Show home page for authenticated users
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold tracking-tight">Aven</h2>
            </div>
          </div>
        </header>
        <HomePage />
      </SidebarInset>
    </SidebarProvider>
);
}