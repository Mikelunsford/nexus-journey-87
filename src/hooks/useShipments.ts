import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getShipments,
  createShipment as createShipmentService,
  updateShipment as updateShipmentService
} from '@/services/shipmentService';
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
    if (!user?.org_id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getShipments(user.org_id, includeTest);
      setShipments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipmentData: ShipmentInsert) => {
    if (!user?.org_id) {
      return { data: null, error: new Error('Organization not found') };
    }

    try {
      const data = await createShipmentService(user.org_id, shipmentData);
      setShipments(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating shipment:', err);
      return { data: null, error: err };
    }
  };

  const updateShipment = async (id: string, updates: ShipmentUpdate) => {
    if (!user?.org_id) {
      return { data: null, error: new Error('Organization not found') };
    }

    try {
      const data = await updateShipmentService(user.org_id, id, updates);
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