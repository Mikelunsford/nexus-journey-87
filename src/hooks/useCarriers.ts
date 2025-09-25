import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { 
  getCarriers,
  createCarrier as createCarrierService,
  updateCarrier as updateCarrierService,
  deleteCarrier as deleteCarrierService,
  getUpcomingCarriers
} from '@/services/carrierService';
import { Database } from '@/integrations/supabase/types';

type DbCarrierAppointment = Database['public']['Tables']['carrier_appointments']['Row'];

export function useCarriers(includeTest = false) {
  const [carriers, setCarriers] = useState<DbCarrierAppointment[]>([]);
  const [upcomingCarriers, setUpcomingCarriers] = useState<DbCarrierAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCarriers = async () => {
    if (!user?.org_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [carriersData, upcomingData] = await Promise.all([
        getCarriers(user.org_id, includeTest),
        getUpcomingCarriers(user.org_id)
      ]);

      setCarriers(carriersData);
      setUpcomingCarriers(upcomingData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch carriers';
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

  const createCarrier = async (carrierData: Omit<DbCarrierAppointment, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (!user?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await createCarrierService(user.org_id, carrierData);
      setCarriers(prev => [data, ...prev]);
      
      // Update upcoming carriers if this is a future appointment
      if (new Date(data.window_start) > new Date()) {
        setUpcomingCarriers(prev => [data, ...prev].sort((a, b) => 
          new Date(a.window_start).getTime() - new Date(b.window_start).getTime()
        ));
      }

      toast({
        title: 'Success',
        description: 'Carrier appointment created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create carrier appointment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateCarrier = async (id: string, updates: Partial<DbCarrierAppointment>) => {
    if (!user?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const data = await updateCarrierService(user.org_id, id, updates);
      setCarriers(prev => prev.map(carrier => 
        carrier.id === id ? data : carrier
      ));

      // Update upcoming carriers
      setUpcomingCarriers(prev => prev.map(carrier => 
        carrier.id === id ? data : carrier
      ));

      toast({
        title: 'Success',
        description: 'Carrier appointment updated successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update carrier appointment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteCarrier = async (id: string) => {
    if (!user?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      await deleteCarrierService(user.org_id, id);
      setCarriers(prev => prev.filter(carrier => carrier.id !== id));
      setUpcomingCarriers(prev => prev.filter(carrier => carrier.id !== id));
      
      toast({
        title: 'Success',
        description: 'Carrier appointment deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete carrier appointment';
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
      .channel('carriers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'carrier_appointments',
          filter: `org_id=eq.${user.org_id}`
        },
        () => {
          fetchCarriers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchCarriers();
  }, [user, includeTest]);

  return {
    carriers,
    upcomingCarriers,
    loading,
    error,
    createCarrier,
    updateCarrier,
    deleteCarrier,
    refetch: fetchCarriers,
  };
}

