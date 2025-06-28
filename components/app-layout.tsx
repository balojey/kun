'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const getPageInfo = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  switch (lastSegment) {
    case 'app':
      return { title: 'Home', description: 'AI Assistant Interface' };
    case 'dashboard':
      return { title: 'Dashboard', description: 'Usage & Analytics' };
    case 'connections':
      return { title: 'Connections', description: 'Connected Tools' };
    case 'pricing':
      return { title: 'Pricing', description: 'Token Packages' };
    case 'profile':
      return { title: 'Profile', description: 'Account Settings' };
    case 'usage':
      return { title: 'Usage', description: 'Token History' };
    case 'success':
      return { title: 'Success', description: 'Payment Confirmation' };
    default:
      return { title: 'Aven', description: 'AI Email Assistant' };
  }
};

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    <span className="font-semibold">{pageInfo.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {pageInfo.description}
                    </Badge>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}