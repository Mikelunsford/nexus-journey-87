import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import type { DbCustomer } from '@/lib/types';

export function useCustomers() {
  const [customers, setCustomers] = useState<DbCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }

    fetchCustomers();
  }, [profile?.org_id]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCustomers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
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

  const createCustomer = async (customerData: Omit<DbCustomer, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (!profile?.org_id) {
      throw new Error('Organization not found');
    }

    try {
      const { data, error: createError } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (createError) throw createError;

      setCustomers(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<DbCustomer>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCustomers(prev => prev.map(customer => 
        customer.id === id ? data : customer
      ));

      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}