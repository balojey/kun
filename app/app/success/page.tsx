'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);

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

  const handleContinue = () => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          <Card className="text-center">
            <CardHeader className="space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Thank you for your purchase. Your payment has been processed successfully.
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Setting up your account...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your account has been updated and you now have access to all features.
                  </p>
                  
                  {sessionId && (
                    <div className="text-xs text-muted-foreground">
                      Session ID: {sessionId}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleContinue} size="lg" className="flex items-center gap-2">
                  Continue to App
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/app/pricing')} 
                  size="lg"
                >
                  View Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Connect Your Tools</h3>
                    <p className="text-sm text-muted-foreground">
                      Link your Gmail, Calendar, and other productivity tools to get started.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Start Using Voice Commands</h3>
                    <p className="text-sm text-muted-foreground">
                      Try speaking to your AI assistant to manage emails and tasks.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Explore Features</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover all the ways Aven can help boost your productivity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}