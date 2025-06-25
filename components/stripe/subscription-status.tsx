'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Zap, Plus } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatusProps {
  subscription?: any;
  loading?: boolean;
  error?: string | null;
  getProductName?: () => string | null;
  isActive?: () => boolean;
  isTrialing?: () => boolean;
  isCanceled?: () => boolean;
  isPastDue?: () => boolean;
}

export function SubscriptionStatus({
  subscription,
  loading = false,
  error = null,
  getProductName = () => null,
  isActive = () => false,
  isTrialing = () => false,
  isCanceled = () => false,
  isPastDue = () => false,
}: SubscriptionStatusProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Account Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // For token-based system, we show token balance instead of subscription
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Token Balance
        </CardTitle>
        <CardDescription>
          Your available AI processing credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Purchase</span>
              <span className="text-sm">{getProductName() || 'Token Package'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                Active
              </Badge>
            </div>

            {subscription.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Purchased</span>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(subscription.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No tokens purchased yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Purchase tokens to start using your AI voice assistant
            </p>
            <Link href="/app/pricing">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Buy Tokens
              </Button>
            </Link>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Tokens</span>
            <span className="text-lg font-bold text-primary">
              {/* This would come from your token balance API */}
              --
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tokens never expire and can be used for any AI operation
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/app/pricing" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Buy More Tokens
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            View Usage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}