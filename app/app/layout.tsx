'use client';

import { GmailGuard } from '@/components/auth/gmail-guard';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GmailGuard>
      {children}
    </GmailGuard>
  );
}