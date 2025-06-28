'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Clock, TrendingUp, Plus, AlertTriangle } from 'lucide-react';
import { useTokens } from '@/hooks/use-tokens';
import Link from 'next/link';

export function TokenBalanceCard() {
  const { balance, estimatedTime, loading, error } = useTokens();

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Token Balance Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toLocaleString();
  };

  const getBalanceStatus = () => {
    if (!balance) return 'unknown';
    if (balance.balance === 0) return 'empty';
    if (balance.balance < 1000) return 'low';
    if (balance.balance < 10000) return 'medium';
    return 'good';
  };

  const balanceStatus = getBalanceStatus();

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Token Balance
        </CardTitle>
        <CardDescription>
          Your available AI processing credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {balance ? (
          <>
            {/* Current Balance */}
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-primary">
                {formatTokens(balance.balance)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge 
                  variant={balanceStatus === 'good' ? 'default' : balanceStatus === 'low' ? 'destructive' : 'secondary'}
                  className={
                    balanceStatus === 'good' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    balanceStatus === 'low' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }
                >
                  {balanceStatus === 'empty' ? 'No Tokens' :
                   balanceStatus === 'low' ? 'Low Balance' :
                   balanceStatus === 'medium' ? 'Medium' : 'Good'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {balance.balance.toLocaleString()} tokens
                </span>
              </div>
            </div>

            {/* Usage Estimates */}
            {estimatedTime && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estimated Usage Time
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-xl border border-border/50">
                    <div className="text-2xl font-bold text-primary">
                      {estimatedTime.conversational_ai_minutes}m
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Voice Conversations
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-xl border border-border/50">
                    <div className="text-2xl font-bold text-primary">
                      {estimatedTime.pica_endpoint_minutes}m
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Tool Automation
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-sm font-medium">Total Purchased</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatTokens(balance.total_purchased)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Total Used</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatTokens(balance.total_consumed)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Link href="/app/pricing" className="flex-1">
                <Button className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Buy More
                </Button>
              </Link>
              <Link href="/app/usage" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Usage
                </Button>
              </Link>
            </div>

            {/* Status Alerts */}
            {balanceStatus === 'low' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Low Token Balance
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Consider purchasing more tokens to continue using Aven without interruption.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {balanceStatus === 'empty' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      No Tokens Remaining
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Purchase tokens to continue using Aven's AI features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">Token Account Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your token account will be created automatically
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}