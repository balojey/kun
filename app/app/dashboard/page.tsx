'use client';

import { AppHeader } from '@/components/app-header';
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
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Token Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                  Monitor your AI usage and token consumption
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/app/usage">
                  <Button variant="outline" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Detailed Usage
                  </Button>
                </Link>
                <Link href="/app/pricing">
                  <Button className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Buy Tokens
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Token Balance - Takes up 1 column */}
            <div className="lg:col-span-1">
              <TokenBalanceCard />
            </div>

            {/* Usage Overview - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              {balance && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{balance.total_purchased.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Purchased</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{balance.total_consumed.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Consumed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Your latest token transactions
                      </CardDescription>
                    </div>
                    <Link href="/app/usage">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Activity className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                      <p className="text-muted-foreground">
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
                          <div className="flex items-center gap-3">
                            <div className="text-xl">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
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
                  <CardTitle>Token Usage Guide</CardTitle>
                  <CardDescription>
                    Understanding how tokens are consumed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
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
                          <span>Email processing</span>
                          <span>~25-75 tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complex tasks</span>
                          <span>~100-200 tokens</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
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
      </main>
    </div>
  );
}