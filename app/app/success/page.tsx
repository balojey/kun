'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2, Mail, Calendar, Mic } from 'lucide-react';
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
                <CardTitle className="text-2xl">Welcome to Aven!</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Your subscription is now active. Let's get you started with your AI email assistant.
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
                    Your Aven Shit subscription is now active! You have access to all premium features.
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
                  Start Using Aven
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
              <CardTitle>Get Started with Aven</CardTitle>
              <CardDescription>
                Follow these steps to maximize your email productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Connect Your Gmail</h3>
                    <p className="text-sm text-muted-foreground">
                      Link your Gmail account so Aven can help manage your emails with voice commands.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Add Calendar Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect Google Calendar to schedule meetings and manage your time with voice.
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
                      Start with simple commands like "show me unread emails" or "archive all newsletters."
                    </p>
                  </div>
                </div>
              </div>
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
      </main>
    </div>
  );
}