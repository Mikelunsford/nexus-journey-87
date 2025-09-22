import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface User {
  id: string;
  name: string;
  email: string;
  role_bucket: string;
  created_at: string;
  avatar_url?: string;
  last_sign_in_at?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchUsers = async () => {
    if (!profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch profiles with their memberships using LEFT JOIN
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          created_at,
          memberships (
            role_bucket,
            expires_at,
            deleted_at
          )
        `)
        .eq('org_id', profile.org_id)
        .or('memberships.deleted_at.is.null,memberships.id.is.null');

      if (queryError) {
        console.error('Error fetching users:', queryError);
        setError(queryError.message);
        return;
      }

      // Transform the data to match our User interface
      const transformedUsers: User[] = data?.map((profile: any) => ({
        id: profile.id,
        name: profile.name || profile.email,
        email: profile.email,
        role_bucket: profile.memberships?.[0]?.role_bucket || 'external',
        created_at: profile.created_at,
        avatar_url: profile.avatar_url,
        // Note: last_sign_in_at would need to come from auth metadata, not available in profiles
      })) || [];

      console.log('Fetched users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (err: any) {
      console.error('Error in useUsers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription for user changes
    if (profile?.org_id) {
      const channelName = `users-org-${profile.org_id}-${Date.now()}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `org_id=eq.${profile.org_id}`
          },
          (payload) => {
            console.log('Profile change detected:', payload.eventType, payload);
            fetchUsers();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'memberships',
            filter: `org_id=eq.${profile.org_id}`
          },
          (payload) => {
            console.log('Membership change detected:', payload.eventType, payload);
            fetchUsers();
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to real-time updates, status:', status);
            if (status === 'CLOSED' || status === 'TIMED_OUT') {
              setError('Failed to connect to real-time updates');
            }
          }
        });

      return () => {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.org_id]);

  const refreshUsers = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refreshUsers
  };
}