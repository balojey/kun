'use client';

import { Zap, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTokens } from '@/hooks/use-tokens';
import Link from 'next/link';

export function TokenIndicator() {
  const { balance, loading, error } = useTokens();

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

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Loading...</p>
              <p className="text-xs text-muted-foreground">Checking balance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-muted-foreground">Failed to load</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Failed to load token balance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/app/dashboard">
            <Card className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${
              balanceStatus === 'good' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' :
              balanceStatus === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' :
              balanceStatus === 'low' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' :
              'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className={`h-5 w-5 ${
                      balanceStatus === 'good' ? 'text-green-600' :
                      balanceStatus === 'medium' ? 'text-yellow-600' :
                      balanceStatus === 'low' ? 'text-orange-600' :
                      'text-red-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {formatTokens(balance.balance)} tokens
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click to view dashboard
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      balanceStatus === 'good' ? 'border-green-500/20 text-green-600 bg-green-500/10' :
                      balanceStatus === 'medium' ? 'border-yellow-500/20 text-yellow-600 bg-yellow-500/10' :
                      balanceStatus === 'low' ? 'border-orange-500/20 text-orange-600 bg-orange-500/10' :
                      'border-red-500/20 text-red-600 bg-red-500/10'
                    }`}
                  >
                    {balanceStatus === 'empty' ? 'Empty' :
                     balanceStatus === 'low' ? 'Low' :
                     balanceStatus === 'medium' ? 'Medium' : 'Good'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}