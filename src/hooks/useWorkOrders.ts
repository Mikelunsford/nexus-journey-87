import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface WorkOrder {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'queued' | 'wip' | 'paused' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  quantity?: number;
  due_date?: string;
  completed_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    title: string;
    customer?: {
      id: string;
      name: string;
    };
  };
  assignee?: {
    id: string;
    name: string;
  };
}

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchWorkOrders = async () => {
    if (!user || !profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('work_orders')
        .select(`
          *,
          project:projects(
            id,
            title,
            customer:customers(id, name)
          ),
          assignee:profiles!work_orders_assigned_to_fkey(id, name)
        `)
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setWorkOrders(data || []);
    } catch (err) {
      console.error('Error fetching work orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  };

  const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.org_id) throw new Error('No organization ID');

    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert({
          ...workOrderData,
          org_id: profile.org_id,
        })
        .select(`
          *,
          project:projects(
            id,
            title,
            customer:customers(id, name)
          ),
          assignee:profiles!work_orders_assigned_to_fkey(id, name)
        `)
        .single();

      if (error) throw error;

      setWorkOrders(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating work order:', err);
      throw err;
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          project:projects(
            id,
            title,
            customer:customers(id, name)
          ),
          assignee:profiles!work_orders_assigned_to_fkey(id, name)
        `)
        .single();

      if (error) throw error;

      setWorkOrders(prev =>
        prev.map(workOrder => (workOrder.id === id ? data : workOrder))
      );
      return data;
    } catch (err) {
      console.error('Error updating work order:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders',
          filter: `org_id=eq.${profile?.org_id}`
        },
        () => {
          fetchWorkOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.org_id]);

  return {
    workOrders,
    loading,
    error,
    createWorkOrder,
    updateWorkOrder,
    refetch: fetchWorkOrders,
  };
}