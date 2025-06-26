'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTokens } from '@/hooks/use-tokens';
import { TokenBalanceCard } from '@/components/tokens/token-balance-card';

export function SubscriptionStatus() {
  const { balance, loading, error } = useTokens();

  // For token-based system, we show token balance instead of subscription
  return <TokenBalanceCard />;
}