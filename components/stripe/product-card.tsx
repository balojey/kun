'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckout } from '@/hooks/use-checkout';
import { StripeProduct } from '@/src/stripe-config';
import { Loader2, Check, Star } from 'lucide-react';

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
      return 'ring-2 ring-primary border-primary/50 bg-primary/5';
    }
    if (featured) {
      return 'ring-2 ring-blue-500 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 relative scale-105';
    }
    return 'hover:shadow-lg transition-all duration-200 hover:scale-102';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline';
    if (featured) return 'default';
    return 'outline';
  };

  const getFeatures = () => {
    const baseFeatures = [
      'AI Voice Assistant',
      'Email Management',
      'Basic Tool Integrations',
      '14-day Free Trial',
    ];

    const alphaFeatures = [
      ...baseFeatures,
      'Priority Support',
      'Advanced Analytics',
      'Extended Integrations',
      'Custom Voice Commands',
    ];

    const gammaFeatures = [
      ...alphaFeatures,
      'Team Management',
      'Custom Integrations',
      'API Access',
      'Dedicated Account Manager',
    ];

    switch (product.name) {
      case 'Alpha':
        return alphaFeatures;
      case 'Gamma':
        return gammaFeatures;
      default:
        return baseFeatures;
    }
  };

  return (
    <Card className={getCardStyles()}>
      {featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white border-blue-500">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Check className="h-3 w-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
        <div className="space-y-2">
          <div className="text-4xl font-bold text-primary">
            {product.price}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          <CardDescription className="text-base">
            {product.description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-3">
          {getFeatures().map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handlePurchase}
          disabled={loading || isCurrentPlan}
          variant={getButtonVariant()}
          className={`w-full ${featured ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            `Subscribe to ${product.name}`
          )}
        </Button>
        
        {!isCurrentPlan && (
          <p className="text-xs text-muted-foreground text-center">
            Cancel anytime. No hidden fees.
          </p>
        )}
      </CardContent>
    </Card>
  );
}