'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/use-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VoiceTab() {
  const { connections } = useConnections();

  const conversation = useConversation({
    onConnect: () => toast.info('Connected to AI assistant'),
    onDisconnect: () => toast.info('Disconnected from AI assistant'),
    onMessage: (message) => toast.info(`Message: ${message.message}`),
    onError: (error) => toast.error(`Error: ${error}`),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID is not defined');
      }
      await conversation.startSession({
        agentId,
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation. Please check microphone permissions.');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assistant Status</span>
            <div className="flex gap-2">
              <Badge variant={conversation.status === 'connected' ? 'default' : 'secondary'}>
                {conversation.status === 'connected' ? 'AI Connected' : 'AI Disconnected'}
              </Badge>
              <Badge variant={connections.length > 0 ? 'default' : 'outline'}>
                {connections.length} Tools Connected
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Connect to your AI assistant to start voice conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Connection Button */}
            <Button
              onClick={conversation.status === 'connected' ? stopConversation : startConversation}
              disabled={conversation.status === 'connecting'}
              variant={conversation.status === 'connected' ? 'destructive' : 'default'}
              size="lg"
              className="h-16 px-8"
            >
              {conversation.status === 'connecting' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : conversation.status === 'connected' ? (
                <>
                  <PhoneOff className="mr-2 h-5 w-5" />
                  Disconnect AI
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Connect AI Assistant
                </>
              )}
            </Button>

            {/* Status Description */}
            <div className="text-center text-sm text-muted-foreground max-w-md">
              {conversation.status === 'connected' ? (
                <p>
                  Your AI assistant is ready! Start speaking to manage your emails and connected tools.
                </p>
              ) : (
                <p>
                  Connect to your AI assistant to begin voice conversations. Make sure your microphone is enabled.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Tools Info */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connected Tools</CardTitle>
            <CardDescription>
              Your assistant can help you with these connected tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {connections.map((connection) => (
                <Badge key={connection.id} variant="outline">
                  {connection.provider}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold">How to use Voice Mode:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Click "Connect AI Assistant" to start</li>
              <li>• Speak naturally about your email tasks</li>
              <li>• Ask to read, reply, or organize your emails</li>
              <li>• Use connected tools for broader automation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}