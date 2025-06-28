'use client';

import { LogOut, User, Settings } from 'lucide-react';
import { useAuthContext } from './auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

export function UserMenu() {
  const { user, signOut } = useAuthContext();

  if (!user) return null;

  // Check if user has an avatar (from Google)
  const hasAvatar = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full overflow-hidden">
          {hasAvatar ? (
            <Image 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata?.full_name || 'User'} 
              width={32} 
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {user.user_metadata?.full_name && (
              <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}