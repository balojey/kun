'use client';

import { useAuthContext } from '@/components/auth/auth-provider';
import { SubscriptionStatus } from '@/components/stripe/subscription-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { User, Mail, Calendar, Shield, Palette } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-0">
      {/* Header - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card - Mobile Optimized */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
              <CardDescription className="text-sm">
                Your Aven account details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">Verified</Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all">{user.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Preferences Card - Mobile Optimized */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
            Preferences
          </CardTitle>
          <CardDescription className="text-sm">
            Customize your Aven experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Security Card - Mobile Optimized */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Security</CardTitle>
          <CardDescription className="text-sm">
            Your account security information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">
                Secured with Supabase Auth
              </p>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 w-fit">
              Secure
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}