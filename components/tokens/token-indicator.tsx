'use client';

import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive">
              <Zap className="h-4 w-4 mr-1" />
              Error
            </Button>
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
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-accent">
              <Zap className="h-4 w-4" />
              <span className="font-medium">
                {formatTokens(balance.balance)}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  balanceStatus === 'good' ? 'border-green-500/20 text-green-600' :
                  balanceStatus === 'medium' ? 'border-yellow-500/20 text-yellow-600' :
                  balanceStatus === 'low' ? 'border-orange-500/20 text-orange-600' :
                  'border-red-500/20 text-red-600'
                }`}
              >
                {balanceStatus === 'empty' ? 'Empty' :
                 balanceStatus === 'low' ? 'Low' :
                 balanceStatus === 'medium' ? 'Medium' : 'Good'}
              </Badge>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Token Balance</p>
            <p className="text-sm">{balance.balance.toLocaleString()} tokens available</p>
            <p className="text-xs text-muted-foreground">Click to view dashboard</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}