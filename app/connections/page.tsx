'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, RefreshCw, Plus, Unplug } from 'lucide-react';
import { useConnections } from '@/hooks/use-connections';
import { AuthKitButton } from '@/components/pica/AuthKitButton';
import { getProviderInfo, PicaConnection } from '@/lib/pica';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionsPage() {
  const { connections, loading, disconnectTool, refreshConnections } = useConnections();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleDisconnect = async (connection: PicaConnection) => {
    setDisconnecting(connection.id);
    try {
      await disconnectTool(connection);
    } finally {
      setDisconnecting(null);
    }
  };

  const handleRefresh = () => {
    refreshConnections();
  };

  const handleConnectionSuccess = () => {
    refreshConnections();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Separator />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Connected Tools</h1>
            <p className="text-muted-foreground">
              Manage your connected tools and integrations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <AuthKitButton
              onSuccess={handleConnectionSuccess}
              size="sm"
            />
          </div>
        </div>

        <Separator />

        {/* Connections List */}
        {connections.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Unplug className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No tools connected</h3>
                <p className="text-muted-foreground">
                  Connect your first tool to get started with automation
                </p>
              </div>
              <AuthKitButton onSuccess={handleConnectionSuccess} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {connections.map((connection) => {
              const providerInfo = getProviderInfo(connection.provider);
              const isDisconnecting = disconnecting === connection.id;

              return (
                <Card key={connection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{providerInfo.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{providerInfo.name}</CardTitle>
                          <CardDescription>
                            Connected {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Connected</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDisconnecting}
                            >
                              {isDisconnecting ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect {providerInfo.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the connection to {providerInfo.name} and revoke access.
                                You can reconnect at any time.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDisconnect(connection)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>Connection ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{connection.connection_id}</code></p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Connection Card */}
        {connections.length > 0 && (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect another tool</h3>
                  <p className="text-sm text-muted-foreground">
                    Add more integrations to expand your automation capabilities
                  </p>
                </div>
                <AuthKitButton
                  onSuccess={handleConnectionSuccess}
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}