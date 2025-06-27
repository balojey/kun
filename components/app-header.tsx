'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SettingsMenu } from '@/components/settings-menu';
import { TokenIndicator } from '@/components/tokens/token-indicator';
import { Logo } from '@/components/logo';

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-screen border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 left-0">
      <div className="max-w-none flex h-16 items-center justify-between px-6 w-full">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Logo width={32} height={32} priority />
            <span className="font-semibold text-xl">Aven</span>
          </Link>
          
          {/* Bolt Logo - Subtle placement */}
          <div className="flex items-center">
            <div className="w-px h-6 bg-border/50 mx-3" />
            <Link 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent/50 transition-colors group"
              title="Powered by Bolt"
            >
              <Image
                src="/bolt.png"
                alt="Bolt"
                width={16}
                height={16}
                className="opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                bolt
              </span>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <TokenIndicator />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}