'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthKit } from "@picahq/authkit";
import { getAppTypeFromProvider, normalizeProvider } from '@/lib/pica';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();

  const handleConnect = async () => {
    if (!user) {
      toast.error('Please sign in to connect tools');
      return;
    }

    setIsLoading(true);

    try {
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication required');
        setIsLoading(false);
        return;
      }

      const { open } = useAuthKit({
        token: {
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/authkit-token`,
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        },
        onSuccess: (connection) => {handleAuthKitSuccess(connection.key, connection.platform);},
        onError: (error) => {handleAuthKitError(error);},
        onClose: () => {handleAuthKitClose()},
        appTheme: theme === 'dark' ? 'dark' : 'light',
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
    try {
      const normalizedProvider = normalizeProvider(provider);
      const appType = getAppTypeFromProvider(normalizedProvider);

      // Check for existing connection of the same app type
      const { data: existingConnections, error: checkError } = await supabase
        .from('connections')
        .select('id, provider, app_type')
        .eq('user_id', user!.id)
        .eq('app_type', appType);

      if (checkError) {
        console.error('Failed to check existing connections:', checkError);
        toast.error('Failed to check existing connections');
        return;
      }

      // If there's an existing connection of the same app type, delete it
      if (existingConnections && existingConnections.length > 0) {
        const existingConnection = existingConnections[0];
        
        const { error: deleteError } = await supabase
          .from('connections')
          .delete()
          .eq('id', existingConnection.id)
          .eq('user_id', user!.id);

        if (deleteError) {
          console.error('Failed to delete existing connection:', deleteError);
          toast.error('Failed to replace existing connection');
          return;
        }

        toast.info(`Replaced existing ${existingConnection.provider} connection`);
      }

      // Store the new connection
      const { error: insertError } = await supabase
        .from('connections')
        .insert({
          user_id: user!.id,
          connection_id: connectionId,
          provider: normalizedProvider,
          app_type: appType,
        });

      if (insertError) {
        console.error('Failed to store connection:', insertError);
        toast.error('Failed to save connection');
        return;
      }

      toast.success(`Successfully connected ${normalizedProvider}!`);
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