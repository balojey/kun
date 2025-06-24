'use client';

import { AppHeader } from '@/components/app-header';
import { ProductCard } from '@/components/stripe/product-card';
import { SubscriptionStatus } from '@/components/stripe/subscription-status';
import { useSubscription } from '@/hooks/use-subscription';
import { STRIPE_PRODUCTS } from '@/src/stripe-config';

export default function PricingPage() {
  const { subscription, getProductName } = useSubscription();
  const currentProductName = getProductName();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
            <p className="text-muted-foreground text-lg">
              Choose the plan that works best for you
            </p>
          </div>

          {/* Current Subscription Status */}
          <SubscriptionStatus />

          {/* Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STRIPE_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isCurrentPlan={currentProductName === product.name}
              />
            ))}
          </div>

          {/* Additional Information */}
          <div className="text-center space-y-4 pt-8 border-t">
            <h2 className="text-xl font-semibold">Need help choosing?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All plans include access to our AI voice assistant, email management features, 
              and tool integrations. Subscriptions can be canceled at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}