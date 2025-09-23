import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Shipment {
  id: string;
  project_id?: string;
  status: 'created' | 'in_transit' | 'delivered';
  carrier?: string;
  tracking_number?: string;
  address: string;
  shipped_at?: string;
  delivered_at?: string;
  items: any;
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
}

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchShipments = async () => {
    if (!user || !profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shipments')
        .select(`
          *,
          project:projects(
            id,
            title,
            customer:customers(id, name)
          )
        `)
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setShipments(data || []);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipmentData: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.org_id) throw new Error('No organization ID');

    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          ...shipmentData,
          org_id: profile.org_id,
        })
        .select(`
          *,
          project:projects(
            id,
            title,
            customer:customers(id, name)
          )
        `)
        .single();

      if (error) throw error;

      setShipments(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating shipment:', err);
      throw err;
    }
  };

  const updateShipment = async (id: string, updates: Partial<Shipment>) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          project:projects(
            id,
            title,
            customer:customers(id, name)
          )
        `)
        .single();

      if (error) throw error;

      setShipments(prev =>
        prev.map(shipment => (shipment.id === id ? data : shipment))
      );
      return data;
    } catch (err) {
      console.error('Error updating shipment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchShipments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('shipments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
          filter: `org_id=eq.${profile?.org_id}`
        },
        () => {
          fetchShipments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.org_id]);

  return {
    shipments,
    loading,
    error,
    createShipment,
    updateShipment,
    refetch: fetchShipments,
  };
}