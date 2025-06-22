'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthKit } from "@picahq/authkit";

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
  const supabase = createClient();

  const handleConnect = async () => {
    if (!user) {
      toast.error('Please sign in to connect tools');
      return;
    }

    setIsLoading(true);

    try {
      const { open } = useAuthKit({
        token: {
          url: "http://localhost:3000/api/authkit-token",
          headers: {},
        },
        onSuccess: (connection) => {handleAuthKitSuccess(connection.key, connection.platform);},
        onError: (error) => {handleAuthKitError(error);},
        onClose: () => {handleAuthKitClose()},
        appTheme: 'dark',
      });
      open()

    } catch (error) {
      console.error('AuthKit error:', error);
      toast.error('Failed to initialize connection flow');
      setIsLoading(false);
    }
  };

  const handleAuthKitSuccess = async (connectionId: string, provider: string) => {
    console.log('Connection successful:', connectionId, provider);
    // Remove '|' and everything after it from connectionId
    connectionId = connectionId.split('|')[0];
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