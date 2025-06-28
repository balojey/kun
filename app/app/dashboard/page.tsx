'use client';

import { TokenBalanceCard } from '@/components/tokens/token-balance-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Clock, Activity, ArrowRight, BarChart3 } from 'lucide-react';
import { useTokens } from '@/hooks/use-tokens';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { balance, transactions, loading, error } = useTokens();

  const recentTransactions = transactions.slice(0, 5);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '💳';
      case 'consumption':
        return '⚡';
      case 'bonus':
        return '🎁';
      default:
        return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600';
      case 'consumption':
        return 'text-red-600';
      case 'bonus':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTokenAmount = (amount: number, type: string) => {
    const prefix = type === 'consumption' ? '' : '+';
    return `${prefix}${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Token Dashboard</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Monitor your AI usage and token consumption
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Link href="/app/usage" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 h-10 sm:h-auto">
                <BarChart3 className="h-4 w-4" />
                <span className="sm:inline">Detailed Usage</span>
              </Button>
            </Link>
            <Link href="/app/pricing" className="flex-1 sm:flex-initial">
              <Button className="w-full sm:w-auto flex items-center gap-2 h-10 sm:h-auto">
                <Zap className="h-4 w-4" />
                <span className="sm:inline">Buy Tokens</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Mobile Responsive */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Token Balance - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1">
          <TokenBalanceCard />
        </div>

        {/* Usage Overview - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Quick Stats - Responsive grid */}
          {balance && (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{balance.total_purchased.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Purchased</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{balance.total_consumed.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Consumed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">
                        {balance.total_purchased > 0 
                          ? Math.round((balance.total_consumed / balance.total_purchased) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Usage Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                  <CardDescription className="text-sm">
                    Your latest token transactions
                  </CardDescription>
                </div>
                <Link href="/app/usage">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm">View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3 sm:space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3 sm:h-4 w-24 sm:w-32 bg-muted rounded animate-pulse" />
                          <div className="h-2 sm:h-3 w-16 sm:w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 sm:h-6 w-16 sm:w-20 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No activity yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start using Aven to see your token activity here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-lg sm:text-xl flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-semibold text-sm ${getTransactionColor(transaction.type)}`}>
                          {formatTokenAmount(transaction.amount, transaction.type)} tokens
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Token Usage Guide</CardTitle>
              <CardDescription className="text-sm">
                Understanding how tokens are consumed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Voice Operations</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Voice conversations</span>
                      <span>1 token/second</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speech transcription</span>
                      <span>~50 tokens/minute</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Text-to-speech</span>
                      <span>~100 tokens/minute</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">AI Operations</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Tool automation</span>
                      <span>0.5 tokens/second</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Document processing</span>
                      <span>~25-75 tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complex tasks</span>
                      <span>~100-200 tokens</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 sm:mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                      Pro Tip: Optimize Your Usage
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Use text commands when possible to conserve tokens for voice interactions. 
                      Voice conversations consume more tokens but provide the most natural experience.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}