import type { Metadata } from 'next';

import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Aven - AI Personal Assistant',
    template: '%s | Aven',
  },
  metadataBase: new URL('https://aven.ai'),
  description: 'Transform your productivity with Aven, the AI personal assistant that helps you manage emails, calendar, documents, and more through natural conversation.',
  openGraph: {
    title: 'Aven - AI Personal Assistant',
    description: 'Transform your productivity with Aven, the AI personal assistant that helps you manage emails, calendar, documents, and more through natural conversation.',
    images: [`/api/og?title=Aven`],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@balojey'
  },
  icons: {
    icon: '/aven-logo.png',
    shortcut: '/aven-logo.png',
    apple: '/aven-logo.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-ubuntu antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}