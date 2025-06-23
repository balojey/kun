import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppSidebar } from '@/components/app-sidebar';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { getAgents } from '@/app/actions/manage-agents';

import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Aven - AI Voice Assistant for Email',
    template: '%s | Aven',
  },
  metadataBase: new URL('https://aven.ai'),
  description: 'Transform your email productivity with Aven, the AI voice assistant that helps you manage, reply to, and organize emails through natural conversation.',
  openGraph: {
    title: 'Aven - AI Voice Assistant for Email',
    description: 'Transform your email productivity with Aven, the AI voice assistant that helps you manage, reply to, and organize emails through natural conversation.',
    images: [`/api/og?title=Aven`],
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
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable}`}>
      <body className="font-sans">
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
                <SidebarInset className="min-h-screen bg-background">
                  <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center px-6">
                      <SidebarTrigger className="mr-4" />
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold tracking-tight">Aven</h2>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1">
                    <div className="container mx-auto px-6 py-8">
                      {children}
                    </div>
                  </main>
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