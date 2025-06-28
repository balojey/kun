'use client';

import { ProductCard } from '@/components/stripe/product-card';
import { useSubscription } from '@/hooks/use-subscription';
import { STRIPE_PRODUCTS, getProductsSortedByPrice } from '@/src/stripe-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Clock, Star } from 'lucide-react';

export default function PricingPage() {
  const subscriptionHook = useSubscription();
  const currentProductName = subscriptionHook.getProductName();
  const sortedProducts = getProductsSortedByPrice();

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header - Mobile Optimized */}
      <div className="text-center space-y-3 sm:space-y-4">
        <Badge variant="secondary" className="mb-3 sm:mb-4 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
          <Zap className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Token-Based Pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Token Package</h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
          Purchase tokens to power your AI personal assistant. Pay once, use anytime. 
          Lower rates per token with larger packages.
        </p>
      </div>

      {/* Products Grid - Mobile Responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
        {sortedProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            isCurrentPlan={currentProductName === product.name}
            featured={product.name === 'Delta'}
          />
        ))}
      </div>

      {/* Value Proposition - Mobile Optimized */}
      <div className="text-center space-y-4 sm:space-y-6 pt-8 sm:pt-12 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-semibold">Why Choose Token-Based Pricing?</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Pay As You Use</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Only pay for what you actually use. No monthly subscriptions or hidden fees.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Better Value</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Larger packages offer better rates per token. Save more with bulk purchases.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">No Expiration</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your tokens never expire. Use them at your own pace whenever you need them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Token Usage Info - Mobile Optimized */}
      <Card className="max-w-4xl mx-auto mx-4 sm:mx-auto">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">How Tokens Work</CardTitle>
          <CardDescription className="text-sm">
            Understanding token consumption for different AI operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm sm:text-base">Voice Processing</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Speech-to-Text (per minute)</span>
                  <span>~270 tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Text-to-Speech (per minute)</span>
                  <span>~270 tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Voice conversation</span>
                  <span>~270 tokens/min</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm sm:text-base">AI Operations</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Email analysis</span>
                  <span>~120 tokens/min</span>
                </div>
                <div className="flex justify-between">
                  <span>Document processing</span>
                  <span>~120 tokens/min</span>
                </div>
                <div className="flex justify-between">
                  <span>Complex automation</span>
                  <span>~240 tokens/min</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <strong>Example:</strong> With the Beta package (50,000 tokens), you could have approximately 
              185 minutes of voice conversations or 416 minutes of tool automation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section - Mobile Optimized */}
      <div className="text-center space-y-4 sm:space-y-6 pt-12 sm:pt-16 border-t px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto text-left">
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Do tokens expire?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              No, your tokens never expire. Use them at your own pace whenever you need AI assistance.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Can I buy more tokens later?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Yes, you can purchase additional token packages anytime. They'll be added to your existing balance.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">What happens if I run out of tokens?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              You'll be notified when your balance is low. Simply purchase more tokens to continue using Aven.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Which package should I choose?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start with Beta for light usage, or choose Delta for the best value if you plan to use Aven regularly.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Are there any hidden fees?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              No hidden fees. You only pay for the tokens you purchase. No monthly subscriptions or recurring charges.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Can I get a refund?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee if you're not satisfied with your token purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}