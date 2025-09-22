import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import type { DbProject } from '@/lib/types';

export function useProjects() {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }

    fetchProjects();
  }, [profile?.org_id]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          customers!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProjects(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<DbProject, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (!profile?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (createError) throw createError;

      setProjects(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<DbProject>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProjects(prev => prev.map(project => 
        project.id === id ? data : project
      ));

      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    refetch: fetchProjects,
  };
}