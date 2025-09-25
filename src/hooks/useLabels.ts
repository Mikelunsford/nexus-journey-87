import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { 
  getLabels,
  createLabel as createLabelData,
  updateLabel as updateLabelData,
  deleteLabel as deleteLabelData
} from '@/services/labelService';
import type { Label } from '@/lib/types';

export function useLabels(scope?: 'customer' | 'user' | 'org', includeTest = false) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }

    fetchLabels();
  }, [profile?.org_id, scope, includeTest]);

  const fetchLabels = async () => {
    if (!profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getLabels(profile.org_id, scope, includeTest);
      setLabels(data);
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Failed to fetch labels');
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (labelData: Omit<Label, 'id' | 'createdAt'>) => {
    if (!profile?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await createLabelData(profile.org_id, labelData);
      setLabels(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Label created successfully',
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create label';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateLabel = async (labelId: string, updates: Partial<Label>) => {
    if (!profile?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await updateLabelData(profile.org_id, labelId, updates);
      setLabels(prev => prev.map(label => 
        label.id === labelId ? data : label
      ));
      toast({
        title: 'Success',
        description: 'Label updated successfully',
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update label';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteLabel = async (labelId: string) => {
    if (!profile?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      await deleteLabelData(profile.org_id, labelId);
      setLabels(prev => prev.filter(label => label.id !== labelId));
      toast({
        title: 'Success',
        description: 'Label deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete label';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    labels,
    loading,
    error,
    createLabel,
    updateLabel,
    deleteLabel,
    refetch: fetchLabels,
  };
}
