'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/use-connections';
import { Button } from '@/components/ui/button';

export function VoiceTab() {
  const { connections } = useConnections();

  const conversation = useConversation({
    onConnect: () => toast.success('Connected to AI assistant'),
    onDisconnect: () => toast.info('Disconnected from AI assistant'),
    onMessage: (message) => console.log('Message:', message.message),
    onError: (error) => toast.error(`Connection error: ${error}`),
  });

  const startConversation = useCallback(async () => {
    const connectionIds = [
      ...connections.map(c => c.connection_id),
      ...(process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID ? [process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID] : [])
    ];
    console.log("Connections:", connectionIds);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID is not configured');
      }
      await conversation.startSession({
        agentId,
        clientTools: {
          callPica: async ({ input }) => {
            const response = await fetch('/api/pica/execute', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messages: [{ role: 'user', content: input }], connectionIds }),
            });
            if (!response.ok) {
              throw new Error('Failed to call Pica');
            }
            const data = await response.json();
            console.log('Pica response in convo:', data);
            return data.response;
          },
        },
      });
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
      {/* Status Indicators */}
      <div className="flex justify-center gap-6">
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

      {/* Big Circular Connection Button (Icon Only) */}
      <div className="flex justify-center">
        <Button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          variant={isConnected ? 'destructive' : 'default'}
          size="icon"
          className={`
            w-48 h-48 rounded-full flex items-center justify-center
            shadow-2xl transition-all duration-300 text-5xl
            ${isConnected ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}
          `}
        >
          {isConnecting ? (
            <Loader2 className="h-24 w-24 animate-spin" />
          ) : isConnected ? (
            <PhoneOff className="h-24 w-24" />
          ) : (
            <Mic className="h-24 w-24" />
          )}
        </Button>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <p className="text-muted-foreground text-lg">
          {isConnected ? (
            "🎉 Ready! Start speaking to manage your emails and tools."
          ) : (
            "Click connect and allow microphone access to begin."
          )}
        </p>
      </div>
    </div>
  );
}