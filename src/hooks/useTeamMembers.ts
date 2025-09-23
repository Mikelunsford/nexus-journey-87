import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

import { Database } from '@/integrations/supabase/types';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbMembership = Database['public']['Tables']['memberships']['Row'];

interface TeamMember extends DbProfile {
  memberships?: {
    role_bucket: string;
    department_id: string | null;
    expires_at: string | null;
  }[];
}

export function useTeamMembers(includeTest = false) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTeamMembers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          memberships (
            role_bucket,
            department_id,
            expires_at
          )
        `)
        .eq('org_id', user.org_id)
        .is('deleted_at', null)
        .order('name', { ascending: true });

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setTeamMembers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `org_id=eq.${user.org_id}`
        },
        () => {
          fetchTeamMembers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memberships',
          filter: `org_id=eq.${user.org_id}`
        },
        () => {
          fetchTeamMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchTeamMembers();
  }, [user, includeTest]);

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers
  };
}