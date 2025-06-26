'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, TrendingUp, Clock, Zap, Download, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTokens } from '@/hooks/use-tokens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppHeader } from '@/components/app-header';
import { TokenBalanceCard } from '@/components/tokens/token-balance-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UsagePage() {
  const { balance, transactions, loading, error } = useTokens();
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

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
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Token Usage</h1>
                <p className="text-muted-foreground text-lg">
                  Track your AI processing usage and token consumption
                </p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Token Balance Card */}
            <div className="lg:col-span-1">
              <TokenBalanceCard />
            </div>

            {/* Usage Statistics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              {balance && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{balance.balance.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Current Balance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
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
                        <Clock className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">{balance.total_consumed.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Consumed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>
                        Your token purchases and usage history
                      </CardDescription>
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="purchase">Purchases</SelectItem>
                        <SelectItem value="consumption">Usage</SelectItem>
                        <SelectItem value="bonus">Bonuses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-destructive">{error}</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                      <p className="text-muted-foreground">
                        {filter === 'all' 
                          ? 'Your transaction history will appear here'
                          : `No ${filter} transactions found`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {formatTokenAmount(transaction.amount, transaction.type)} tokens
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Balance: {transaction.balance_after.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}