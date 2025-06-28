'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2, Zap, Sparkles, Calendar, Mic } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { getProductByPriceId } from '@/src/stripe-config';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedProduct, setPurchasedProduct] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription data after successful payment
    const refreshData = async () => {
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refetch();
      setIsLoading(false);
    };

    refreshData();
  }, [refetch]);

  // Try to determine which product was purchased
  useEffect(() => {
    const priceId = searchParams.get('price_id');
    if (priceId) {
      const product = getProductByPriceId(priceId);
      setPurchasedProduct(product);
    }
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/app');
  };

  const getTokenAmount = () => {
    if (!purchasedProduct) return 'tokens';
    const rate = parseFloat(purchasedProduct.tokenRate.replace('$', ''));
    const tokens = Math.floor(purchasedProduct.price / rate);
    return tokens.toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <Card className="text-center">
        <CardHeader className="space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription className="text-lg mt-2">
              {purchasedProduct ? (
                <>Your {purchasedProduct.name} token package has been activated.</>
              ) : (
                <>Your token purchase has been completed successfully.</>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing your purchase...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {purchasedProduct && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      {purchasedProduct.name} Package Activated
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ~{getTokenAmount()} tokens added to your account
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Rate: {purchasedProduct.tokenRate} per token
                  </p>
                </div>
              )}
              
              {sessionId && (
                <div className="text-xs text-muted-foreground">
                  Transaction ID: {sessionId}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleContinue} size="lg" className="flex items-center gap-2">
              Start Using Aven
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/app/pricing')} 
              size="lg"
            >
              View Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Get Started with Your Tokens</CardTitle>
          <CardDescription>
            Here's how to make the most of your AI personal assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">Connect Your Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Link your Gmail, Calendar, Docs, and other tools so Aven can help manage your digital workspace.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Organize Your Workflow</h3>
                <p className="text-sm text-muted-foreground">
                  Set up integrations to schedule meetings, manage documents, and automate routine tasks.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mic className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium">Try Voice Commands</h3>
                <p className="text-sm text-muted-foreground">
                  Start with simple commands like "show me today's schedule" or "summarize my unread emails."
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Making Your Tokens Last</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Voice conversations</span>
              <span className="text-muted-foreground">~150 tokens/minute</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Email & document processing</span>
              <span className="text-muted-foreground">~50-100 tokens</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Text-only commands</span>
              <span className="text-muted-foreground">~25-75 tokens</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Tip: Use text commands when possible to conserve tokens for voice interactions.
          </p>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Our team is here to help you get the most out of Aven. Reach out anytime!
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              View Documentation
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}