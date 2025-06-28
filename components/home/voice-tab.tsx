'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/use-connections';
import { useTokens } from '@/hooks/use-tokens';
import { Button } from '@/components/ui/button';
import { TokenGuard } from '@/components/tokens/token-guard';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '../auth/auth-provider';

export function VoiceTab() {
  const { connections } = useConnections();
  const { hassufficientTokens } = useTokens();
  const supabase = createClient();
  const { user } = useAuthContext();

  const connectionIds = [
    ...connections.map(c => c.connection_id),
    ...(process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID ? [process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID] : [])
  ];
  const connectedTools = connections.map(c => c.provider).join(', ');
  
  console.log("Connections:", connectionIds);

  const executeUserCommand = async ({ rowId }: { command: string, rowId: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pica-execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ connectionIds, rowId }),
    });
    if (!response.ok) {
      throw new Error('Failed to call Pica');
    }
    const data = await response.text();
    console.log('Pica response in convo:', data);
    return data;
  }

  const createPromptRow = async ({ prompt }: { prompt: string }) => {
    try {
      const { data, error } = await supabase
        .from('aven_calls')
        .insert({ user_id: user?.id, prompt })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating aven_call:', error);
        return null;
      }

      console.log('Created aven_call:', data);
      return data?.id || null;
    } catch (err) {
      console.error('Unexpected error creating aven_call:', err);
      return null;
    }
  }

  const getCallResponse = async ({ id }: { id: string }) => {
    const { data, error } = await supabase
      .from('aven_calls')
      .select('response')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching aven_calls row:', error);
      return '';
    }

    console.log('Fetched aven_calls row:', data);
    return data?.response || '';
  }

  const conversation = useConversation({
    onConnect: async () => {
      toast.success('Connected to AI assistant');
      
      // Create conversation session record when connection starts
      try {
        const conversationId = conversation.getId();
        if (conversationId && user) {
          const { error } = await supabase
            .from('conversation_sessions')
            .insert({
              user_id: user.id,
              conversation_id: conversationId,
              status: 'initiated'
            });

          if (error) {
            console.error('Error creating conversation session:', error);
          } else {
            console.log(`Created conversation session for ${conversationId}`);
          }
        }
      } catch (error) {
        console.error('Error in conversation session creation:', error);
      }
    },
    onDisconnect: () => {
      toast.info('Disconnected from AI assistant');
    },
    onMessage: (message) => console.log('Message:', message.message),
    onError: (error) => {
      toast.error(`Connection error: ${error}`);
    },
  });

  const startConversation = useCallback(async () => {
    // Check if user has sufficient tokens for at least 30 seconds of conversation
    if (!hassufficientTokens(30)) {
      toast.error('Insufficient tokens for voice conversation');
      return;
    }
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID is not configured');
      }
      await conversation.startSession({
        agentId,
        dynamicVariables: {
          connectedTools: connectedTools,
        },
        clientTools: {
          executeUserCommand,
          createPromptRow,
          getCallResponse,
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation. Please check microphone permissions.');
    }
  }, [conversation, connections, hassufficientTokens]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <div className="space-y-8">
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