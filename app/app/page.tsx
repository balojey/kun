'use client';

import { HomePage } from '@/components/home/home-page';
import { GmailGuard } from '@/components/auth/gmail-guard';

export default function AppHomePage() {
  return (
    // <GmailGuard>
      <HomePage />
    // </GmailGuard>
  );
}