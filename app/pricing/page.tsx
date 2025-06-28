'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/stripe/product-card';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuthContext } from '@/components/auth/auth-provider';
import { STRIPE_PRODUCTS, getProductsSortedByPrice } from '@/src/stripe-config';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function PublicPricingPage() {
  const { user } = useAuthContext();
  const { subscription, getProductName } = useSubscription();
  const currentProductName = getProductName();
  const sortedProducts = getProductsSortedByPrice();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo width={32} height={32} priority />
              <span className="font-semibold text-xl">Aven</span>
            </Link>
            
            {/* Bolt Logo - Subtle placement */}
            <div className="flex items-center">
              <div className="w-px h-6 bg-border/50 mx-3" />
              <Link 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent/50 transition-colors group"
                title="Powered by Bolt"
              >
                <Image
                  src="/bolt.png"
                  alt="Bolt"
                  width={16}
                  height={16}
                  className="opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  bolt
                </span>
              </Link>
            </div>
          </div>
          
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
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              Token-Based Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Choose Your Token Package</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Purchase tokens to power your AI personal assistant. Pay once, use anytime. 
              Lower rates per token with larger packages.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isCurrentPlan={user ? currentProductName === product.name : false}
                featured={product.name === 'Delta'}
              />
            ))}
          </div>

          {/* Value Proposition */}
          <div className="text-center space-y-6 pt-12">
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold">Pay As You Use</h3>
                <p className="text-sm text-muted-foreground">
                  No monthly subscriptions. Only pay for the AI processing you actually use.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold">Instant Access</h3>
                <p className="text-sm text-muted-foreground">
                  Tokens are credited immediately. Start using your AI personal assistant right away.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold">Never Expire</h3>
                <p className="text-sm text-muted-foreground">
                  Your tokens never expire. Use them at your own pace whenever you need them.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 pt-8">
            <h2 className="text-xl font-semibold">Ready to supercharge your productivity?</h2>
            <p className="text-muted-foreground">
              Join thousands of professionals using AI to manage their digital workspace and workflows.
            </p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">Get Started Free</Button>
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