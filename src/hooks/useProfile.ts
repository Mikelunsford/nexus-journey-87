import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  org_id: string;
  settings?: Record<string, any>;
}

interface Membership {
  id: string;
  user_id: string;
  org_id: string;
  department_id?: string;
  team_id?: string;
  role_bucket: 'admin' | 'management' | 'operational' | 'external';
  assigned_by: string;
  expires_at?: string;
}

export function useProfile() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setMemberships([]);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch memberships
        const { data: membershipsData, error: membershipsError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null);

        if (membershipsError) {
          console.error('Error fetching memberships:', membershipsError);
        } else {
          setMemberships(membershipsData || []);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated]);

  const getEffectiveRole = (): 'admin' | 'management' | 'operational' | 'external' => {
    if (!memberships.length) return 'external';
    
    // Return the highest privilege role
    const roleHierarchy = {
      admin: 4,
      management: 3,
      operational: 2,
      external: 1
    };

    const highestRole = memberships.reduce((highest, membership) => {
      if (membership.expires_at && new Date(membership.expires_at) < new Date()) {
        return highest; // Skip expired memberships
      }
      
      return roleHierarchy[membership.role_bucket] > roleHierarchy[highest] 
        ? membership.role_bucket 
        : highest;
    }, 'external' as const);

    return highestRole;
  };

  return {
    profile,
    memberships,
    loading,
    effectiveRole: getEffectiveRole(),
    hasRole: (role: string) => memberships.some(m => 
      m.role_bucket === role && (!m.expires_at || new Date(m.expires_at) > new Date())
    ),
  };
}