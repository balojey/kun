'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  subscription: any;
  loading: boolean;
  error: string | null;
  getProductName: () => string | null;
  isActive: () => boolean;
  isTrialing: () => boolean;
  isCanceled: () => boolean;
  isPastDue: () => boolean;
}

export function SubscriptionStatus({
  subscription,
  loading,
  error,
  getProductName,
  isActive,
  isTrialing,
  isCanceled,
  isPastDue,
}: SubscriptionStatusProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
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
            Subscription Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.subscription_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active subscription</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (!subscription.subscription_status) {
      return <Badge variant="outline">Unknown Status</Badge>;
    }

    if (isActive()) {
      return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
    }
    if (isTrialing()) {
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Trial</Badge>;
    }
    if (isPastDue()) {
      return <Badge variant="destructive">Past Due</Badge>;
    }
    if (isCanceled()) {
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Canceled</Badge>;
    }
    return <Badge variant="outline">{subscription.subscription_status}</Badge>;
  };

  const getStatusIcon = () => {
    if (isActive() || isTrialing()) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Subscription
        </CardTitle>
        <CardDescription>
          Your current subscription status and details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plan</span>
          <span className="text-sm">{getProductName() || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          {getStatusBadge()}
        </div>

        {subscription.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {subscription.cancel_at_period_end ? 'Expires' : 'Renews'}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
            </div>
          </div>
        )}

        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Method</span>
            <span className="text-sm">
              {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
            </span>
          </div>
        )}

        {subscription.cancel_at_period_end && subscription.current_period_end && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your subscription will not renew and will end on{' '}
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}