import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

import { Database } from '@/integrations/supabase/types';

type DbShipment = Database['public']['Tables']['shipments']['Row'];
type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];
type ShipmentUpdate = Database['public']['Tables']['shipments']['Update'];

interface Shipment extends DbShipment {
  projects?: {
    title: string;
    customers?: {
      name: string;
    };
  };
}

export function useShipments(includeTest = false) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, effectiveRole } = useAuth();

  const fetchShipments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('shipments')
        .select(`
          *,
          projects (
            title,
            customers (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Filter out test data by default unless includeTest is true
      if (!includeTest) {
        query = query.or('is_test.is.null,is_test.eq.false');
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setShipments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipmentData: ShipmentInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select(`
          *,
          projects (
            title,
            customers (
              name
            )
          )
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      setShipments(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating shipment:', err);
      return { data: null, error: err };
    }
  };

  const updateShipment = async (id: string, updates: ShipmentUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          projects (
            title,
            customers (
              name
            )
          )
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      setShipments(prev => prev.map(shipment => 
        shipment.id === id ? data : shipment
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating shipment:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [user, includeTest]);

  return {
    shipments,
    loading,
    error,
    createShipment,
    updateShipment,
    refetch: fetchShipments
  };
}