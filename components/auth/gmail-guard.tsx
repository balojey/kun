'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';
import { useGmailConnection } from '@/hooks/use-gmail-connection';
import { useAuthContext } from './auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GmailGuardProps {
  children: React.ReactNode;
}

export function GmailGuard({ children }: GmailGuardProps) {
  const { user, loading: authLoading } = useAuthContext();
  const { hasGmailConnection, loading: gmailLoading, error } = useGmailConnection();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we have a user, finished loading, and confirmed no Gmail connection
    if (user && !authLoading && !gmailLoading && hasGmailConnection === false) {
      router.replace('/app/connections?needsGmail=true');
    }
  }, [user, authLoading, gmailLoading, hasGmailConnection, router]);

  // Show loading while checking authentication or Gmail connection
  if (authLoading || gmailLoading || hasGmailConnection === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking your connections...</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an issue checking Gmail connection
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Connection Check Failed</CardTitle>
            <CardDescription>
              We couldn't verify your Gmail connection. Please try again.
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

  // Show connection required message if no Gmail connection (fallback)
  if (hasGmailConnection === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Gmail Connection Required</CardTitle>
            <CardDescription>
              To use Aven's email assistant, you need to connect your Gmail account first.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/app/connections?needsGmail=true')} className="w-full">
              Connect Gmail
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has Gmail connection, show the protected content
  return <>{children}</>;
}