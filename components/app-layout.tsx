'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePathname } from 'next/navigation';
import { Sparkles, Mic, MessageSquare } from 'lucide-react';
import { createContext, useContext, useState, ReactNode } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Create context for interface mode
interface InterfaceModeContextType {
  isTextMode: boolean;
  setIsTextMode: (value: boolean) => void;
}

const InterfaceModeContext = createContext<InterfaceModeContextType | undefined>(undefined);

export function useInterfaceMode() {
  const context = useContext(InterfaceModeContext);
  if (context === undefined) {
    throw new Error('useInterfaceMode must be used within an InterfaceModeProvider');
  }
  return context;
}

const getPageInfo = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  switch (lastSegment) {
    case 'app':
      return { title: 'Home', description: 'Personal Assistant Interface' };
    case 'dashboard':
      return { title: 'Dashboard', description: 'Usage & Analytics' };
    case 'connections':
      return { title: 'Connections', description: 'Connected Tools' };
    case 'pricing':
      return { title: 'Buy Tokens', description: 'Token Packages' };
    case 'profile':
      return { title: 'Profile', description: 'Account Settings' };
    case 'usage':
      return { title: 'Usage', description: 'Token History' };
    case 'success':
      return { title: 'Success', description: 'Payment Confirmation' };
    default:
      return { title: 'Aven', description: 'AI Personal Assistant' };
  }
};

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);
  const [isTextMode, setIsTextMode] = useState(false);
  
  // Only show interface toggle on home page
  const isHomePage = pathname === '/app';

  return (
    <InterfaceModeContext.Provider value={{ isTextMode, setIsTextMode }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 sm:px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb className="flex-1 min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate">{pageInfo.title}</span>
                      <Badge variant="secondary" className="text-xs hidden sm:flex">
                        <Sparkles className="h-3 w-3 mr-1" />
                        <span className="hidden md:inline">{pageInfo.description}</span>
                      </Badge>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              {/* Interface Mode Toggle - Only on Home Page - Mobile Optimized */}
              {isHomePage && (
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Mic className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${!isTextMode ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Label htmlFor="interface-mode" className="text-xs sm:text-sm font-medium cursor-pointer hidden sm:inline">
                      Voice
                    </Label>
                  </div>
                  
                  <Switch
                    id="interface-mode"
                    checked={isTextMode}
                    onCheckedChange={setIsTextMode}
                    className="data-[state=checked]:bg-primary scale-75 sm:scale-100"
                  />
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Label htmlFor="interface-mode" className="text-xs sm:text-sm font-medium cursor-pointer hidden sm:inline">
                      Text
                    </Label>
                    <MessageSquare className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${isTextMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              )}
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-6">
            <div className="min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </InterfaceModeContext.Provider>
  );
}