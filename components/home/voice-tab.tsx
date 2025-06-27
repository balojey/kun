'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/use-connections';
import { useExecutionTracker } from '@/hooks/use-execution-tracker';
import { Button } from '@/components/ui/button';
import { TokenGuard } from '@/components/tokens/token-guard';
import Link from 'next/link';

export function VoiceTab() {
  const { connections } = useConnections();

  const conversation = useConversation({
    onConnect: () => {
      toast.success('Connected to AI assistant');
      startExecution();
    },
    onDisconnect: () => {
      toast.info('Disconnected from AI assistant');
      endExecution();
    },
    onMessage: (message) => console.log('Message:', message.message),
    onError: (error) => {
      toast.error(`Connection error: ${error}`);
      endExecution();
    },
  });

  // Use execution tracker
  const { 
    isExecuting, 
    executionDuration, 
    estimatedTokens, 
    startExecution, 
    endExecution,
    hassufficientTokens 
  } = useExecutionTracker('conversational_ai');

  const startConversation = useCallback(async () => {
    // Check if user has sufficient tokens for at least 30 seconds of conversation
    if (!hassufficientTokens(30)) {
      toast.error('Insufficient tokens for voice conversation');
      return;
    }

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pica-execute`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messages: [{ role: 'user', content: input }], connectionIds }),
            });
            if (!response.ok) {
              throw new Error('Failed to call Pica');
            }
            const data = await response.text();
            console.log('Pica response in convo:', data);
            return data;
          },
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation. Please check microphone permissions.');
    }
  }, [conversation, connections, hassufficientTokens, startExecution]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <div className="space-y-8">
      {/* Execution Status */}
      {isExecuting && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-green-800 dark:text-green-200 font-medium">
              Voice Session Active
            </span>
            <div className="flex items-center gap-4 text-green-700 dark:text-green-300 text-sm">
              <span>Duration: {executionDuration}s</span>
              <span>Est. Tokens: {estimatedTokens}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-10">
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
          {isExecuting && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Session Active
              </span>
            </div>
          )}
        </div>

        {/* Big Circular Connection Button */}
        <TokenGuard
          serviceType="conversational_ai"
          estimatedDurationSeconds={30}
          fallback={
            <div className="text-center space-y-4">
              <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center opacity-50">
                <Mic className="h-24 w-24 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Insufficient tokens for voice conversation
              </p>
              <Link href="/app/pricing">
                <Button>Buy Tokens</Button>
              </Link>
            </div>
          }
        >
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
        </TokenGuard>

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
    </div>
  );
}