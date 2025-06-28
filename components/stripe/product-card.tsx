'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckout } from '@/hooks/use-checkout';
import { StripeProduct } from '@/src/stripe-config';
import { Loader2, Check, Zap, Star, Crown } from 'lucide-react';

interface ProductCardProps {
  product: StripeProduct;
  isCurrentPlan?: boolean;
  featured?: boolean;
}

export function ProductCard({ product, isCurrentPlan = false, featured = false }: ProductCardProps) {
  const { createCheckoutSession, loading } = useCheckout();

  const handlePurchase = () => {
    createCheckoutSession({
      priceId: product.priceId,
      mode: product.mode,
    });
  };

  const getCardStyles = () => {
    if (isCurrentPlan) {
      return 'ring-2 ring-primary border-primary/50 bg-primary/5 shadow-xl';
    }
    if (featured) {
      return 'ring-2 ring-blue-500 border-blue-500/50 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 relative sm:scale-105 shadow-2xl';
    }
    return 'hover:shadow-xl transition-all duration-300 hover:scale-102 border-0 shadow-lg';
  };

  const getBestValueBadge = () => {
    if (product.name === 'Delta') {
      return (
        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg text-xs">
            <Crown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            Best Value
          </Badge>
        </div>
      );
    }
    return null;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toLocaleString();
  };

  const getUsageEstimate = () => {
    const conversationalMinutes = Math.floor(product.tokens / 60);
    const picaMinutes = Math.floor(product.tokens / 30);
    
    return {
      conversational: conversationalMinutes,
      pica: picaMinutes
    };
  };

  const usage = getUsageEstimate();

  return (
    <Card className={getCardStyles()}>
      {isCurrentPlan && (
        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-lg text-xs">
            <Check className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}
      
      {!isCurrentPlan && getBestValueBadge()}
      
      <CardHeader className="text-center pb-4 sm:pb-6 relative p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg ${
            featured ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-primary/10'
          }`}>
            <Zap className={`h-6 w-6 sm:h-8 sm:w-8 ${featured ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
        <CardTitle className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">{product.name}</CardTitle>
        <div className="space-y-2 sm:space-y-3">
          <div className="text-2xl sm:text-4xl font-bold text-primary">
            ${product.price}
          </div>
          <CardDescription className="text-base sm:text-lg font-medium">
            {formatTokens(product.tokens)} tokens
          </CardDescription>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {product.tokenRate} per token
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        {/* Usage Estimates */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
            Estimated Usage
          </h4>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-background/50 rounded-lg border border-border/50">
              <span className="text-xs sm:text-sm font-medium">Voice Conversations</span>
              <span className="font-bold text-primary text-xs sm:text-sm">~{usage.conversational} min</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-background/50 rounded-lg border border-border/50">
              <span className="text-xs sm:text-sm font-medium">Tool Automation</span>
              <span className="font-bold text-primary text-xs sm:text-sm">~{usage.pica} min</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
            What's Included
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {[
              'AI Voice Processing',
              'Email Management',
              'Tool Integrations',
              'Priority Support',
              'Never Expires'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                </div>
                <span className="text-xs sm:text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 sm:pt-6 border-t border-border/50">
          <Button 
            onClick={handlePurchase}
            disabled={loading || isCurrentPlan}
            className={`w-full h-10 sm:h-12 text-xs sm:text-base font-semibold ${
              featured ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : ''
            }`}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Processing...
              </>
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : (
              <>
                <span className="hidden sm:inline">Purchase {formatTokens(product.tokens)} Tokens</span>
                <span className="sm:hidden">Buy {formatTokens(product.tokens)}</span>
              </>
            )}
          </Button>
          
          {!isCurrentPlan && (
            <p className="text-xs text-muted-foreground text-center mt-2 sm:mt-3">
              One-time payment • Instant token credit • No recurring charges
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}