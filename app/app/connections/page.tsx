'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, RefreshCw, Plus, Unplug, ExternalLink, Zap, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConnections } from '@/hooks/use-connections';
import { AuthKitButton } from '@/components/pica/AuthKitButton';
import { getProviderInfo, PicaConnection } from '@/lib/pica';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionsPage() {
  const { connections, loading, disconnectTool, refreshConnections } = useConnections();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user was redirected due to missing connections
  useEffect(() => {
    const needsConnection = searchParams.get('needsConnection');
    const hasAnyConnection = connections.length > 0;
    
    if (needsConnection === 'true' && !hasAnyConnection && !loading) {
      setShowConnectionDialog(true);
    }
  }, [searchParams, connections.length, loading]);

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
    // Close the connection dialog if it's open
    setShowConnectionDialog(false);
  };

  // Group connections by app type for display
  const connectionsByAppType = connections.reduce((acc, connection) => {
    const appType = connection.app_type;
    if (!acc[appType]) {
      acc[appType] = [];
    }
    acc[appType].push(connection);
    return acc;
  }, {} as Record<string, PicaConnection[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Connection Setup Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl">Connect Your First Tool</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm sm:text-base leading-relaxed">
              To use Aven as your personal assistant, you need to connect at least one tool. This allows your assistant to help manage your emails, calendar, documents, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <AuthKitButton 
              onSuccess={handleConnectionSuccess}
              size="lg"
              className="w-full"
            />
            <Button 
              variant="outline" 
              onClick={() => setShowConnectionDialog(false)}
              className="w-full"
            >
              I'll do this later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Connected Tools</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Manage your integrations and connected services
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="w-full sm:w-auto h-10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <AuthKitButton
              onSuccess={handleConnectionSuccess}
              className="w-full sm:w-auto h-10"
            />
          </div>
        </div>

        {/* Connection Notice */}
        {connections.length === 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                    Tool Connection Required
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Connect at least one tool to start using Aven's personal assistant features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Replacement Notice */}
        {connections.length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                    One Connection Per Tool Type
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Connecting a new account will replace your existing connection for that tool type.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                      <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 sm:h-9 sm:w-24" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats - Mobile Responsive Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{connections.length}</p>
                    <p className="text-xs text-muted-foreground">Connected Tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{Object.keys(connectionsByAppType).length}</p>
                    <p className="text-xs text-muted-foreground">App Types Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">∞</p>
                    <p className="text-xs text-muted-foreground">Available Tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connections List */}
          {connections.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <Unplug className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No tools connected</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                  Connect your first tool to start automating your workflow with AI-powered voice and text commands
                </p>
                <AuthKitButton onSuccess={handleConnectionSuccess} size="lg" className="w-full sm:w-auto" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {connections.map((connection) => {
                const providerInfo = getProviderInfo(connection.provider);
                const isDisconnecting = disconnecting === connection.id;

                return (
                  <Card key={connection.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                            {providerInfo.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <CardTitle className="text-base sm:text-lg truncate">{providerInfo.name}</CardTitle>
                              <Badge variant="outline" className="text-xs w-fit">
                                {connection.app_type}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs sm:text-sm">
                              Connected {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                            Active
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isDisconnecting}
                                className="text-destructive hover:text-destructive text-xs sm:text-sm"
                              >
                                {isDisconnecting ? (
                                  <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                                <span className="hidden sm:inline">
                                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                </span>
                                <span className="sm:hidden">
                                  {isDisconnecting ? '...' : 'Remove'}
                                </span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Disconnect {providerInfo.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the connection to {providerInfo.name} and revoke access.
                                  You can reconnect at any time.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDisconnect(connection)}
                                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Disconnect
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                        <div className="text-muted-foreground">
                          Connection ID: <code className="bg-muted px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-mono break-all">{connection.connection_id}</code>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                          <span className="text-xs">Ready for commands</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add Connection Card */}
          {connections.length > 0 && (
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
              <CardContent className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Connect another tool</h3>
                    <p className="text-sm text-muted-foreground">
                      Add more integrations to expand your automation capabilities
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                      Note: New connections will replace existing ones of the same type
                    </p>
                  </div>
                  <AuthKitButton
                    onSuccess={handleConnectionSuccess}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}