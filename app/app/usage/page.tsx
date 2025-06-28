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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 p-2 sm:p-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Token Usage</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Track your AI processing usage and token consumption
            </p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Main Content Grid - Mobile Responsive */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Token Balance Card - Full width on mobile */}
        <div className="lg:col-span-1">
          <TokenBalanceCard />
        </div>

        {/* Usage Statistics - Full width on mobile */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Quick Stats - Responsive grid */}
          {balance && (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{balance.balance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Current Balance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
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
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{balance.total_consumed.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Consumed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transaction History - Mobile Optimized */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
                  <CardDescription className="text-sm">
                    Your token purchases and usage history
                  </CardDescription>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-40">
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
                <div className="space-y-3 sm:space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                          <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 sm:h-6 w-16 sm:w-20" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No transactions found</h3>
                  <p className="text-sm text-muted-foreground">
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
                      className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-lg sm:text-2xl flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction.type)}`}>
                          {formatTokenAmount(transaction.amount, transaction.type)} tokens
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
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
  );
}