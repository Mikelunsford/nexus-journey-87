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

      // Fetch profiles with their memberships - simplified query
      console.log('Fetching users for org:', profile.org_id);
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          created_at,
          memberships:memberships!memberships_user_id_fkey (
            role_bucket,
            expires_at,
            deleted_at
          )
        `)
        .eq('org_id', profile.org_id);

      if (queryError) {
        console.error('Error fetching users:', queryError);
        console.error('Query error details:', queryError.details, queryError.hint, queryError.code);
        setError(`Failed to load users: ${queryError.message}`);
        return;
      }

      if (!data) {
        console.warn('No data returned from profiles query');
        setError('No data returned from server');
        return;
      }

      console.log('Raw profiles data:', data);

      // Transform the data to match our User interface - filter out deleted memberships
      const transformedUsers: User[] = data?.map((profile: any) => {
        // Filter active memberships (not deleted and not expired)
        const activeMemberships = profile.memberships?.filter((m: any) => 
          !m.deleted_at && (!m.expires_at || new Date(m.expires_at) > new Date())
        ) || [];

        return {
          id: profile.id,
          name: profile.name || profile.email,
          email: profile.email,
          role_bucket: activeMemberships[0]?.role_bucket || 'external',
          created_at: profile.created_at,
          avatar_url: profile.avatar_url,
          // Note: last_sign_in_at would need to come from auth metadata, not available in profiles
        };
      }) || [];

      console.log('Transformed users:', transformedUsers);
      console.log('Setting users count:', transformedUsers.length);
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
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates');
          } else {
            console.error('Failed to subscribe to real-time updates, status:', status);
            if (status === 'CLOSED' || status === 'TIMED_OUT') {
              console.warn('Real-time connection lost, will attempt to reconnect on next component mount');
              // Don't set error state, just log warning
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