'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/stripe/product-card';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuthContext } from '@/components/auth/auth-provider';
import { STRIPE_PRODUCTS } from '@/src/stripe-config';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PublicPricingPage() {
  const { user } = useAuthContext();
  const { subscription, getProductName } = useSubscription();
  const currentProductName = getProductName();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6 w-full max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-xl">Aven</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            {user ? (
              <Link href="/app">
                <Button>Open App</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
            <p className="text-muted-foreground text-lg">
              Choose the plan that works best for you
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STRIPE_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isCurrentPlan={user ? currentProductName === product.name : false}
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