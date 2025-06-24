'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckout } from '@/hooks/use-checkout';
import { StripeProduct } from '@/src/stripe-config';
import { Loader2, Check, Zap } from 'lucide-react';

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
      return 'ring-2 ring-blue-500 border-blue-500/50 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 relative scale-105 shadow-xl';
    }
    return 'hover:shadow-lg transition-all duration-200 hover:scale-102';
  };

  const getFeatures = () => {
    return [
      'AI Voice Assistant',
      'Natural Language Email Management',
      'Gmail Integration',
      'Google Calendar Sync',
      'Smart Email Replies',
      'Voice-to-Text Commands',
      'Inbox Zero Automation',
      'Priority Support',
      'Enterprise Security',
      '99.9% Uptime SLA',
    ];
  };

  return (
    <Card className={getCardStyles()}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Check className="h-3 w-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold mb-2">{product.name}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            What's Included
          </h4>
          {getFeatures().map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            onClick={handlePurchase}
            disabled={loading || isCurrentPlan}
            className="w-full"
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
              `Get ${product.name}`
            )}
          </Button>
          
          {!isCurrentPlan && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Start your free trial • Cancel anytime • No hidden fees
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}