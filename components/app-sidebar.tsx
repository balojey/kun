'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { UserMenu } from '@/components/auth/user-menu';
import { Logo } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { demos } from '@/lib/demos';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props} className="border-r border-border/40">
      <SidebarHeader className="h-16 border-b border-border/40">
        <div className="flex h-full items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold">Email Assistant</span>
          </Link>
          <UserMenu />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {demos.map((demo) => (
          <SidebarGroup key={demo.name}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {demo.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {demo.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === `/${item.slug}`}
                      className="h-10"
                    >
                      <Link href={`/${item.slug}`} className="flex items-center space-x-3">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-border/40">
        <div className="text-xs text-muted-foreground">
          Powered by ElevenLabs & PicaOS
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}