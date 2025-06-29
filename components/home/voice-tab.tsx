'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff, Zap, Users, Clock } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/use-connections';
import { useTokens } from '@/hooks/use-tokens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      toast.success('Connected to AI personal assistant');
    },
    onDisconnect: () => {
      toast.info('Disconnected from AI personal assistant');
    },
    onMessage: (message) => console.log('Message:', message.message),
    onError: (error) => {
      toast.error(`Connection error: ${error}`);
    },
  });

  const startConversation = useCallback(async () => {
    // Check if user has sufficient tokens for at least 30 seconds of conversation (135 tokens)
    if (!hassufficientTokens(135)) {
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
    <div className="h-full flex flex-col">
      {/* Status Cards - Responsive grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 flex-shrink-0 mb-4 sm:mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <p className="text-xs sm:text-sm font-medium">AI Personal Assistant</p>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected & Ready' : 'Disconnected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm font-medium">{connections.length} Tools</p>
                <p className="text-xs text-muted-foreground">Connected & Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <div>
                <p className="text-xs sm:text-sm font-medium">Real-time</p>
                <p className="text-xs text-muted-foreground">Processing Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Voice Interface - Properly Centered and Responsive */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4">
        <TokenGuard
          serviceType="conversational_ai"
          estimatedDurationSeconds={30}
          fallback={
            <div className="text-center space-y-4 sm:space-y-6 max-w-sm mx-auto">
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-muted/50 flex items-center justify-center opacity-50 border-4 border-dashed border-muted-foreground/30 mx-auto">
                <Mic className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">Insufficient Tokens</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  You need more tokens to start a voice conversation. Purchase tokens to continue.
                </p>
                <Link href="/app/pricing">
                  <Button size="lg" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Buy Tokens
                  </Button>
                </Link>
              </div>
            </div>
          }
        >
          <div className="text-center space-y-6 sm:space-y-8 w-full max-w-md mx-auto">
            {/* Voice Button - Responsive sizing */}
            <div className="relative flex justify-center">
              <Button
                onClick={isConnected ? stopConversation : startConversation}
                disabled={isConnecting}
                variant={isConnected ? 'destructive' : 'default'}
                size="icon"
                className={`
                  w-32 h-32 sm:w-48 sm:h-48 rounded-full flex items-center justify-center
                  shadow-2xl transition-all duration-300 text-4xl sm:text-6xl
                  hover:scale-105 active:scale-95
                  ${isConnected 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-3xl'
                  }
                  ${isConnecting ? 'animate-pulse' : ''}
                `}
              >
                {isConnecting ? (
                  <Loader2 className="h-16 w-16 sm:h-24 sm:w-24 animate-spin" />
                ) : isConnected ? (
                  <PhoneOff className="h-16 w-16 sm:h-24 sm:w-24" />
                ) : (
                  <Mic className="h-16 w-16 sm:h-24 sm:w-24" />
                )}
              </Button>
              
              {/* Pulse Animation for Connected State */}
              {/* {isConnected && (
                <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
              )} */}
            </div>

            {/* Status Text - Responsive typography */}
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">
                {isConnecting ? 'Connecting...' : 
                 isConnected ? 'Listening...' : 
                 'Ready to Connect'}
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {isConnecting ? 'Setting up your AI personal assistant connection' :
                 isConnected ? 'Speak naturally to manage your digital workspace and tools' :
                 'Click the microphone to start your voice conversation'}
              </p>
            </div>

            {/* Connection Instructions - Mobile optimized */}
            {!isConnected && !isConnecting && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                  <span>Microphone access required</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
                  <span>Best with headphones or quiet environment</span>
                </div>
              </div>
            )}
          </div>
        </TokenGuard>
      </div>
    </div>
  );
}