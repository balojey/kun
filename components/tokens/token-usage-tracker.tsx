'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Play, Square } from 'lucide-react';
import { useTokenSession } from '@/hooks/use-token-session';
import { useTokens } from '@/hooks/use-tokens';

interface TokenUsageTrackerProps {
  serviceType: 'conversational_ai' | 'pica_endpoint';
  isActive: boolean;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onInsufficientTokens?: () => void;
}

export function TokenUsageTracker({
  serviceType,
  isActive,
  onSessionStart,
  onSessionEnd,
  onInsufficientTokens,
}: TokenUsageTrackerProps) {
  const { balance } = useTokens();
  const {
    currentSession,
    loading,
    error,
    startSession,
    endSession,
    getCurrentDuration,
    getEstimatedTokens,
    checkTokenSufficiency,
  } = useTokenSession();

  const [duration, setDuration] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  // Update duration and estimated tokens every second when session is active
  useEffect(() => {
    if (!currentSession?.isActive) return;

    const interval = setInterval(() => {
      const currentDuration = getCurrentDuration();
      const tokens = getEstimatedTokens();
      
      setDuration(currentDuration);
      setEstimatedTokens(tokens);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, getCurrentDuration, getEstimatedTokens]);

  // Handle session lifecycle based on isActive prop
  useEffect(() => {
    const handleSessionChange = async () => {
      if (isActive && !currentSession?.isActive) {
        // Check if user has sufficient tokens for at least 30 seconds
        const minTokens = serviceType === 'conversational_ai' ? 30 : 15;
        const hasSufficientTokens = await checkTokenSufficiency(minTokens);
        
        if (!hasSufficientTokens) {
          onInsufficientTokens?.();
          return;
        }

        const sessionId = await startSession(serviceType);
        if (sessionId) {
          onSessionStart?.(sessionId);
        }
      } else if (!isActive && currentSession?.isActive) {
        const success = await endSession();
        if (success) {
          onSessionEnd?.();
        }
      }
    };

    handleSessionChange();
  }, [isActive, currentSession?.isActive, serviceType, startSession, endSession, checkTokenSufficiency, onSessionStart, onSessionEnd, onInsufficientTokens]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getServiceName = () => {
    return serviceType === 'conversational_ai' ? 'Voice Conversation' : 'Tool Automation';
  };

  const getTokenRate = () => {
    return serviceType === 'conversational_ai' ? '1 token/sec' : '0.5 tokens/sec';
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Session Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={currentSession?.isActive ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Token Usage
          </div>
          <Badge 
            variant={currentSession?.isActive ? 'default' : 'secondary'}
            className={currentSession?.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
          >
            {currentSession?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Service</div>
            <div className="font-medium">{getServiceName()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Rate</div>
            <div className="font-medium">{getTokenRate()}</div>
          </div>
        </div>

        {currentSession?.isActive && (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(duration)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Tokens Used</div>
                <div className="font-medium text-primary">
                  {estimatedTokens.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Remaining Balance:</span>
                <span className="font-medium">
                  {balance ? (balance.balance - estimatedTokens).toLocaleString() : '---'} tokens
                </span>
              </div>
            </div>
          </>
        )}

        {!currentSession?.isActive && balance && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Current Balance:</span>
              <span className="font-medium">
                {balance.balance.toLocaleString()} tokens
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              {currentSession?.isActive ? 'Ending session...' : 'Starting session...'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}