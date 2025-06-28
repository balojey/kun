'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/auth-provider';

export function useGmailConnection() {
  const { user } = useAuthContext();
  const [hasAnyConnection, setHasAnyConnection] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const checkAnyConnection = async () => {
    if (!user) {
      setHasAnyConnection(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check for any connection
      const { data, error: fetchError } = await supabase
        .from('connections')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      setHasAnyConnection(data && data.length > 0);
    } catch (err) {
      console.error('Failed to check connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to check connections');
      setHasAnyConnection(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAnyConnection();
  }, [user]);

  // Set up real-time subscription for connections changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('any_connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkAnyConnection();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    hasGmailConnection: hasAnyConnection, // Keep the same interface for compatibility
    loading,
    error,
    refetch: checkAnyConnection,
  };
}