'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  User, 
  Zap, 
  Settings, 
  LogOut, 
  BarChart3, 
  CreditCard,
  Moon,
  Sun,
  Monitor,
  Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthContext } from '@/components/auth/auth-provider';
import { TokenIndicator } from '@/components/tokens/token-indicator';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigationItems = [
  {
    title: 'Home',
    url: '/app',
    icon: Home,
    description: 'Personal Assistant Interface'
  },
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: BarChart3,
    description: 'Usage & Analytics'
  },
  {
    title: 'Connections',
    url: '/app/connections',
    icon: Zap,
    description: 'Connected Tools'
  },
  {
    title: 'Buy Tokens',
    url: '/app/pricing',
    icon: CreditCard,
    description: 'Token Packages'
  },
];

const accountItems = [
  {
    title: 'Profile',
    url: '/app/profile',
    icon: User,
    description: 'Account Settings'
  },
  {
    title: 'Usage',
    url: '/app/usage',
    icon: BarChart3,
    description: 'Token History'
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <Sidebar variant="inset" className="border-r border-border/50 bg-card/50 backdrop-blur-sm">
      <SidebarHeader className="border-b border-border/50 p-6">
        <Link href="/app" className="flex items-center space-x-3 group">
          <div className="relative">
            <Logo width={36} height={36} priority />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-primary-foreground" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl logo-gradient group-hover:scale-105 transition-transform">
              Aven
            </span>
            <p className="text-xs text-muted-foreground">AI Personal Assistant</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="w-full h-12 rounded-xl transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg"
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <span className="font-medium">{item.title}</span>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="w-full h-12 rounded-xl transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg"
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <span className="font-medium">{item.title}</span>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 space-y-4">
        {/* Token Balance */}
        <div>
          <TokenIndicator />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-3 rounded-xl hover:bg-accent/50">
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center">
                  {theme === 'light' ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : theme === 'dark' ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Monitor className="mr-2 h-4 w-4" />
                  )}
                  <span>Theme</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}