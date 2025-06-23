import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
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

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-inter antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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