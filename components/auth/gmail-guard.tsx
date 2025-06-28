'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';
import { useConnections } from '@/hooks/use-connections';
import { useAuthContext } from './auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConnectionGuardProps {
  children: React.ReactNode;
}

export function GmailGuard({ children }: ConnectionGuardProps) {
  const { user, loading: authLoading } = useAuthContext();
  const { connections, loading: connectionsLoading, error } = useConnections();
  const router = useRouter();

  const hasAnyConnection = connections.length > 0;

  useEffect(() => {
    // Only redirect if we have a user, finished loading, and confirmed no connections
    if (user && !authLoading && !connectionsLoading && !hasAnyConnection) {
      router.replace('/app/connections?needsConnection=true');
    }
  }, [user, authLoading, connectionsLoading, hasAnyConnection, router]);

  // Show loading while checking authentication or connections
  if (authLoading || connectionsLoading || hasAnyConnection === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking your connections...</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an issue checking connections
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Zap className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Connection Check Failed</CardTitle>
            <CardDescription>
              We couldn't verify your tool connections. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/app/connections')} className="w-full">
              Go to Connections
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show connection required message if no connections (fallback)
  if (!hasAnyConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Tool Connection Required</CardTitle>
            <CardDescription>
              To use Aven's personal assistant features, you need to connect at least one tool first.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/app/connections?needsConnection=true')} className="w-full">
              Connect Your First Tool
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has at least one connection, show the protected content
  return <>{children}</>;
}