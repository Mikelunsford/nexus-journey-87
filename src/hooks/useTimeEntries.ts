import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { 
  getTimeEntries,
  createTimeEntry as createTimeEntryService,
  updateTimeEntry as updateTimeEntryService,
  deleteTimeEntry as deleteTimeEntryService,
  getTimeEntryStats,
  getTimeEntriesByProject,
  getTimeEntriesByUser
} from '@/services/timeEntryService';
import { Database } from '@/integrations/supabase/types';

type DbTimeEntry = Database['public']['Tables']['time_entries']['Row'];

interface TimeEntryStats {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalRevenue: number;
  entryCount: number;
}

export function useTimeEntries(includeTest = false, userId?: string, dateRange?: { start: string; end: string }) {
  const [timeEntries, setTimeEntries] = useState<DbTimeEntry[]>([]);
  const [stats, setStats] = useState<TimeEntryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTimeEntries = async () => {
    if (!user?.org_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [entriesData, statsData] = await Promise.all([
        getTimeEntries(user.org_id, userId, dateRange, includeTest),
        getTimeEntryStats(user.org_id, userId, dateRange)
      ]);

      setTimeEntries(entriesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries';
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

  const createTimeEntry = async (timeEntryData: Omit<DbTimeEntry, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (!user?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await createTimeEntryService(user.org_id, timeEntryData);
      setTimeEntries(prev => [data, ...prev]);
      
      // Refresh stats
      const statsData = await getTimeEntryStats(user.org_id, userId, dateRange);
      setStats(statsData);

      toast({
        title: 'Success',
        description: 'Time entry created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create time entry';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<DbTimeEntry>) => {
    if (!user?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await updateTimeEntryService(user.org_id, id, updates);
      setTimeEntries(prev => prev.map(entry => 
        entry.id === id ? data : entry
      ));

      // Refresh stats
      const statsData = await getTimeEntryStats(user.org_id, userId, dateRange);
      setStats(statsData);

      toast({
        title: 'Success',
        description: 'Time entry updated successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update time entry';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteTimeEntry = async (id: string) => {
    if (!user?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      await deleteTimeEntryService(user.org_id, id);
      setTimeEntries(prev => prev.filter(entry => entry.id !== id));
      
      // Refresh stats
      const statsData = await getTimeEntryStats(user.org_id, userId, dateRange);
      setStats(statsData);

      toast({
        title: 'Success',
        description: 'Time entry deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete time entry';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user?.org_id) return;

    const channel = supabase
      .channel('time-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `org_id=eq.${user.org_id}`
        },
        () => {
          fetchTimeEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchTimeEntries();
  }, [user, includeTest, userId, dateRange]);

  return {
    timeEntries,
    stats,
    loading,
    error,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    refetch: fetchTimeEntries,
  };
}

// Specialized hooks for specific use cases
export function useTimeEntriesByProject(projectId: string, dateRange?: { start: string; end: string }) {
  const [timeEntries, setTimeEntries] = useState<DbTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTimeEntries = async () => {
    if (!user?.org_id || !projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getTimeEntriesByProject(user.org_id, projectId, dateRange);
      setTimeEntries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [user, projectId, dateRange]);

  return {
    timeEntries,
    loading,
    error,
    refetch: fetchTimeEntries,
  };
}

export function useTimeEntriesByUser(userId: string, dateRange?: { start: string; end: string }) {
  const [timeEntries, setTimeEntries] = useState<DbTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTimeEntries = async () => {
    if (!user?.org_id || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getTimeEntriesByUser(user.org_id, userId, dateRange);
      setTimeEntries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [user, userId, dateRange]);

  return {
    timeEntries,
    loading,
    error,
    refetch: fetchTimeEntries,
  };
}

