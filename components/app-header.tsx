'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SettingsMenu } from '@/components/settings-menu';

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-screen border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 left-0">
      <div className="max-w-none flex h-16 items-center justify-between px-6 w-full">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-semibold text-xl">Aven</span>
      </Link>
      
      <SettingsMenu />
      </div>
    </header>
  );
}