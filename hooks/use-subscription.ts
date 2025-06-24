'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/auth-provider';
import { getProductByPriceId } from '@/src/stripe-config';

export interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Set up real-time subscription for subscription changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_subscriptions',
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getProductName = () => {
    if (!subscription?.price_id) return null;
    const product = getProductByPriceId(subscription.price_id);
    return product?.name || null;
  };

  const isActive = () => {
    return subscription?.subscription_status === 'active';
  };

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing';
  };

  const isCanceled = () => {
    return subscription?.subscription_status === 'canceled';
  };

  const isPastDue = () => {
    return subscription?.subscription_status === 'past_due';
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getProductName,
    isActive,
    isTrialing,
    isCanceled,
    isPastDue,
  };
}