'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/auth-provider';
import { PicaConnection } from '@/lib/pica';
import { toast } from 'sonner';

export function useConnections() {
  const { user } = useAuthContext();
  const [connections, setConnections] = useState<PicaConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const [supabaseToken, setSupabaseToken] = useState<string>('');

  const fetchConnections = useCallback(async () => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setConnections(data || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const disconnectTool = async (connection: PicaConnection) => {
    try {
      // Remove from our database
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connection.id)
        .eq('user_id', user!.id);

      if (error) {
        throw error;
      }

      // Update local state
      setConnections(prev => prev.filter(c => c.id !== connection.id));
      toast.success(`Disconnected ${connection.provider} successfully`);
      return true;
    } catch (err) {
      console.error('Failed to disconnect tool:', err);
      toast.error('Failed to disconnect tool');
      return false;
    }
  };

  const getConnectionByAppType = (appType: string): PicaConnection | null => {
    return connections.find(conn => conn.app_type === appType) || null;
  };

  const hasConnectionForAppType = (appType: string): boolean => {
    return connections.some(conn => conn.app_type === appType);
  };

  const refreshConnections = () => {
    fetchConnections();
  };

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections, user]);

  useEffect(() => {
    const getToken = async () => {
      if (!user) {
        setSupabaseToken('');
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSupabaseToken(session?.access_token || '');
    };
    getToken();
  }, [user]);

  // Set up real-time subscription for connections
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    connections,
    loading,
    error,
    supabaseToken,
    disconnectTool,
    refreshConnections,
    getConnectionByAppType,
    hasConnectionForAppType,
  };
}