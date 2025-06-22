'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff, Zap, Settings } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/use-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function VoiceTab() {
  const { connections } = useConnections();

  const conversation = useConversation({
    onConnect: () => toast.success('Connected to AI assistant'),
    onDisconnect: () => toast.info('Disconnected from AI assistant'),
    onMessage: (message) => console.log('Message:', message.message),
    onError: (error) => toast.error(`Connection error: ${error}`),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID is not configured');
      }
      await conversation.startSession({ agentId });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation. Please check microphone permissions.');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <div className="space-y-8">
      {/* Main Connection Card */}
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Voice Assistant</CardTitle>
          <CardDescription className="text-base">
            Connect to start natural voice conversations with your AI assistant
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Indicators */}
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'AI Connected' : 'AI Disconnected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connections.length > 0 ? 'bg-blue-500' : 'bg-gray-500'}`} />
              <span className="text-sm text-muted-foreground">
                {connections.length} Tools Connected
              </span>
            </div>
          </div>

          {/* Connection Button */}
          <div className="flex justify-center">
            <Button
              onClick={isConnected ? stopConversation : startConversation}
              disabled={isConnecting}
              variant={isConnected ? 'destructive' : 'default'}
              size="lg"
              className="h-14 px-8 text-base font-medium"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <PhoneOff className="mr-2 h-5 w-5" />
                  Disconnect
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Connect AI Assistant
                </>
              )}
            </Button>
          </div>

          {/* Status Message */}
          <div className="text-center">
            <p className="text-muted-foreground">
              {isConnected ? (
                "🎉 Ready! Start speaking to manage your emails and tools."
              ) : (
                "Click connect and allow microphone access to begin."
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Connected Tools */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-500" />
              Connected Tools
            </CardTitle>
            <CardDescription>
              Tools available for voice commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {connections.map((connection) => (
                  <Badge key={connection.id} variant="secondary" className="capitalize">
                    {connection.provider}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No tools connected</p>
                <Link href="/connections">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Connect Tools
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Voice Commands</CardTitle>
            <CardDescription>
              Try these example commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="p-2 rounded bg-muted/50">
                "Read my latest emails"
              </div>
              <div className="p-2 rounded bg-muted/50">
                "Reply to John's email"
              </div>
              <div className="p-2 rounded bg-muted/50">
                "Schedule a meeting for tomorrow"
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}