'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, RefreshCw, Plus, Unplug, ExternalLink, Zap, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionsPage() {
  const { connections, loading, disconnectTool, refreshConnections } = useConnections();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const router = useRouter();

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

  const handleBackToHome = () => {
    router.push('/');
  };

  // Check if user has Gmail connection
  const hasGmailConnection = connections.some(conn => conn.provider === 'gmail');

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {hasGmailConnection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToHome}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Connected Tools</h1>
                  <p className="text-muted-foreground text-lg">
                    Manage your integrations and connected services
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <AuthKitButton
                  onSuccess={handleConnectionSuccess}
                  className="h-10"
                />
              </div>
            </div>

            {/* Gmail Connection Notice */}
            {!hasGmailConnection && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        Gmail Connection Required
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Connect your Gmail account to start using Aven's email assistant features.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {loading ? (
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{connections.length}</p>
                        <p className="text-xs text-muted-foreground">Connected Tools</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{connections.length}</p>
                        <p className="text-xs text-muted-foreground">Active Connections</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">∞</p>
                        <p className="text-xs text-muted-foreground">Available Tools</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Connections List */}
              {connections.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                      <Unplug className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No tools connected</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Connect your first tool to start automating your workflow with AI-powered voice and text commands
                    </p>
                    <AuthKitButton onSuccess={handleConnectionSuccess} size="lg" />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => {
                    const providerInfo = getProviderInfo(connection.provider);
                    const isDisconnecting = disconnecting === connection.id;
                    const isGmail = connection.provider === 'gmail';

                    return (
                      <Card key={connection.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                {providerInfo.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{providerInfo.name}</CardTitle>
                                  {isGmail && (
                                    <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription>
                                  Connected {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Active
                              </Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isDisconnecting}
                                    className="text-destructive hover:text-destructive"
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
                                      {isGmail && ' You will need to reconnect Gmail to use Aven\'s email features.'}
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
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                              Connection ID: <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{connection.connection_id}</code>
                            </div>
                            <div className="flex items-center gap-1 text-green-500">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
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
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Connect another tool</h3>
                        <p className="text-muted-foreground">
                          Add more integrations to expand your automation capabilities
                        </p>
                      </div>
                      <AuthKitButton
                        onSuccess={handleConnectionSuccess}
                        variant="outline"
                        size="lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}