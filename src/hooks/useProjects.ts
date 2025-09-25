import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { 
  getProjects,
  createProject as createProjectService,
  updateProject as updateProjectService
} from '@/services/projectService';
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
    if (!profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getProjects(profile.org_id);
      setProjects(data);
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
      const data = await createProjectService(profile.org_id, projectData);
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
    if (!profile?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await updateProjectService(profile.org_id, id, updates);
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