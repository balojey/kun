'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuthContext } from '@/components/auth/auth-provider';
import { Separator } from '@/components/ui/separator';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { signInWithGoogle } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Account created! Please check your email to confirm.');
      router.push('/login');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Auth state will be handled by the auth provider
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Logo width={32} height={32} priority />
            <span className="font-bold text-xl">Aven</span>
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
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Start transforming your productivity with Aven
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google Sign Up Button */}
          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={isGoogleLoading}
            className="w-full mb-4 relative"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image 
                src="/google-logo.svg" 
                alt="Google" 
                width={18} 
                height={18} 
                className="mr-2"
              />
            )}
            {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH EMAIL
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account with Email'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}