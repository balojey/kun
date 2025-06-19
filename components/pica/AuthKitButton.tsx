'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { generateAuthKitToken } from '@/lib/pica';

interface AuthKitButtonProps {
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function AuthKitButton({ 
  onSuccess, 
  variant = 'default', 
  size = 'default',
  className 
}: AuthKitButtonProps) {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (!user) {
      toast.error('Please sign in to connect tools');
      return;
    }

    setIsLoading(true);

    try {
      // Generate AuthKit token
      const token = await generateAuthKitToken(user.id);

      // For now, we'll simulate the AuthKit flow since we don't have the actual SDK
      // In a real implementation, you would use @picahq/authkit here
      
      // TODO: Replace with actual PicaOS AuthKit integration
      // const { AuthKit } = require('@picahq/authkit');
      // const authKit = new AuthKit({
      //   token,
      //   onSuccess: handleAuthKitSuccess,
      //   onError: handleAuthKitError,
      //   onClose: handleAuthKitClose,
      // });
      // authKit.open();

      // Simulate successful connection for demo purposes
      setTimeout(() => {
        handleAuthKitSuccess('mock_connection_123', 'gmail');
      }, 2000);

    } catch (error) {
      console.error('AuthKit error:', error);
      toast.error('Failed to initialize connection flow');
      setIsLoading(false);
    }
  };

  const handleAuthKitSuccess = async (connectionId: string, provider: string) => {
    try {
      // Store the connection in Supabase
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user!.id,
          connection_id: connectionId,
          provider: provider,
        });

      if (error) {
        console.error('Failed to store connection:', error);
        toast.error('Failed to save connection');
        return;
      }

      toast.success(`Successfully connected ${provider}!`);
      onSuccess?.();
    } catch (error) {
      console.error('Connection storage error:', error);
      toast.error('Failed to save connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthKitError = (error: string) => {
    console.error('AuthKit error:', error);
    toast.error(`Connection failed: ${error}`);
    setIsLoading(false);
  };

  const handleAuthKitClose = () => {
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading || !user}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Connect Tool
        </>
      )}
    </Button>
  );
}