'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/auth-provider';

export function useGmailConnection() {
  const { user } = useAuthContext();
  const [hasGmailConnection, setHasGmailConnection] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const checkGmailConnection = async () => {
    if (!user) {
      setHasGmailConnection(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', 'gmail')
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      setHasGmailConnection(data && data.length > 0);
    } catch (err) {
      console.error('Failed to check Gmail connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to check Gmail connection');
      setHasGmailConnection(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkGmailConnection();
  }, [user]);

  // Set up real-time subscription for connections changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('gmail_connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkGmailConnection();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    hasGmailConnection,
    loading,
    error,
    refetch: checkGmailConnection,
  };
}