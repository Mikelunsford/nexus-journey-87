import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface UserInvitation {
  id: string;
  email: string;
  name: string;
  role_bucket: string;
  status: string;
  expires_at: string;
  invited_by: string;
  created_at: string;
}

export function useInvitations() {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchInvitations = async () => {
    if (!profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('Error fetching invitations:', queryError);
        setError(queryError.message);
        return;
      }

      setInvitations(data || []);
    } catch (err: any) {
      console.error('Error in useInvitations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (userData: {
    email: string;
    name: string;
    role_bucket: string;
    department_id?: string;
  }) => {
    if (!profile?.org_id) {
      throw new Error('Organization ID not found');
    }

    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        ...userData,
        org_id: profile.org_id,
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Refresh invitations after successful invite
    await fetchInvitations();
    return data;
  };

  const cancelInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from('user_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    if (error) {
      throw new Error(error.message);
    }

    // Refresh invitations after cancellation
    await fetchInvitations();
  };

  useEffect(() => {
    fetchInvitations();

    // Set up real-time subscription for invitations
    const channel = supabase
      .channel('user-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_invitations',
          filter: `org_id=eq.${profile?.org_id}`
        },
        (payload) => {
          console.log('Invitation change:', payload);
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.org_id]);

  return {
    invitations,
    loading,
    error,
    inviteUser,
    cancelInvitation,
    refreshInvitations: fetchInvitations
  };
}