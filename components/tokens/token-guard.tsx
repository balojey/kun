'use client';

import { useEffect, useState } from 'react';
import { useTokens } from '@/hooks/use-tokens';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TokenGuardProps {
  children: React.ReactNode;
  requiredTokens?: number;
  serviceType?: 'conversational_ai' | 'pica_endpoint';
  estimatedDurationSeconds?: number;
  fallback?: React.ReactNode;
}

export function TokenGuard({ 
  children, 
  requiredTokens, 
  serviceType, 
  estimatedDurationSeconds,
  fallback 
}: TokenGuardProps) {
  const { balance, loading, hassufficientTokens, getTokensForDuration } = useTokens();
  const [calculatedTokens, setCalculatedTokens] = useState<number>(0);

  useEffect(() => {
    if (requiredTokens) {
      setCalculatedTokens(requiredTokens);
    } else if (serviceType && estimatedDurationSeconds) {
      const tokens = getTokensForDuration(serviceType, estimatedDurationSeconds);
      setCalculatedTokens(tokens);
    }
  }, [requiredTokens, serviceType, estimatedDurationSeconds, getTokensForDuration]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!balance || !hassufficientTokens(calculatedTokens)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Insufficient Tokens</CardTitle>
          <CardDescription>
            {balance?.balance === 0 
              ? 'You have no tokens remaining'
              : `You need ${calculatedTokens.toLocaleString()} tokens but only have ${balance?.balance.toLocaleString() || 0}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Required:</span>
              <span className="font-medium">{calculatedTokens.toLocaleString()} tokens</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Available:</span>
              <span className="font-medium">{balance?.balance.toLocaleString() || 0} tokens</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/app/pricing" className="flex-1">
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Buy Tokens
              </Button>
            </Link>
            <Link href="/app/usage" className="flex-1">
              <Button variant="outline" className="w-full">
                View Usage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}