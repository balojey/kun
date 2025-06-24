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
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Transform your email productivity with Aven. Choose the plan that fits your needs and start your journey to inbox zero.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {STRIPE_PRODUCTS.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isCurrentPlan={user ? currentProductName === product.name : false}
                featured={index === 1} // Make Alpha (middle plan) featured
              />
            ))}
          </div>

          {/* Value Proposition */}
          <div className="text-center space-y-6 pt-12">
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold">Instant Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Get started in minutes with our simple onboarding process
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground">
                  Bank-level encryption and SOC 2 compliance for your peace of mind
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold">Proven Results</h3>
                <p className="text-sm text-muted-foreground">
                  Users save 2+ hours daily on email management
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center space-y-6 pt-16 border-t">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto text-left">
              <div className="space-y-2">
                <h3 className="font-medium">Can I change plans anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  All plans come with a 14-day free trial. No credit card required to start exploring Aven's features.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">What integrations are included?</h3>
                <p className="text-sm text-muted-foreground">
                  All plans include Gmail, Google Calendar, Docs, Sheets. Alpha adds more tools, Gamma includes custom integrations.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">How secure is my data?</h3>
                <p className="text-sm text-muted-foreground">
                  We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and never store your email content.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Do you offer refunds?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee if you're not completely satisfied with Aven.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely. Cancel your subscription anytime with no cancellation fees or hidden charges.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 pt-8">
            <h2 className="text-xl font-semibold">Ready to transform your email workflow?</h2>
            <p className="text-muted-foreground">
              Join thousands of professionals who've achieved inbox zero with Aven.
            </p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}