'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 40, height = 40, priority = false }: LogoProps) {
  return (
    <Image
      src="/aven-logo.png"
      alt="Aven Logo"
      width={width}
      height={height}
      priority={priority}
      className={cn("rounded-lg", className)}
    />
  );
}