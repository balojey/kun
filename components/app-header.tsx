'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SettingsMenu } from '@/components/settings-menu';
import { TokenIndicator } from '@/components/tokens/token-indicator';
import { Logo } from '@/components/logo';

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-screen border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 left-0">
      <div className="max-w-none flex h-16 items-center justify-between px-6 w-full">
        <Link href="/" className="flex items-center space-x-2">
          <Logo width={32} height={32} priority />
          <span className="font-semibold text-xl">Aven</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <TokenIndicator />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}