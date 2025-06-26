'use client';

import { AppHeader } from '@/components/app-header';
import { HomePage } from '@/components/home/home-page';
import { GmailGuard } from '@/components/auth/gmail-guard';

export default function AppHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8">
        <GmailGuard>
          <HomePage />
        </GmailGuard>
      </main>
    </div>
  );
}