import type { Metadata } from 'next';


import { AppSidebar } from '@/components/app-sidebar';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ThemeProvider } from '@/components/theme-provider';
import { Card } from '@/components/ui/card';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { getAgents } from '@/app/actions/manage-agents';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ElevenLabs Next.js Playground',
    template: '%s | ElevenLabs Next.js',
  },
  metadataBase: new URL('https://elevenlabs-playground.vercel.app'),
  description: 'A Next.JS playground to explore ElevenLabs capabilities.',
  openGraph: {
    title: 'ElevenLabs Next.js Playground',
    description: 'A playground to explore ElevenLabs capabilities.',
    images: [`/api/og?title=ElevenLabs Next.js Playground`],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const agentsResult = await getAgents();
  
  const sortedAgents = agentsResult.ok
    ? [...agentsResult.value.agents].sort((a, b) => b.createdAtUnixSecs - a.createdAtUnixSecs)
    : [];

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthGuard>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="background">
                  <header className="relative flex h-[60px] shrink-0 items-center justify-between px-3">
                    <SidebarTrigger />
                  </header>
                  <div className="p-4">
                    <div className="mx-auto max-w-4xl space-y-3 px-2 pt-20 lg:px-8 lg:py-8">
                      <Card className="border-gradient rounded-lg p-px shadow-lg">
                        <div className="bg-card rounded-lg">{children}</div>
                      </Card>
                    </div>
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </AuthGuard>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}