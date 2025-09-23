import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Quote {
  id: string;
  customer_id: string;
  project_id?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  total: number;
  line_items: any;
  expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
  };
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchQuotes = async () => {
    if (!user || !profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(id, name)
        `)
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.org_id) throw new Error('No organization ID');

    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          ...quoteData,
          org_id: profile.org_id,
        })
        .select(`
          *,
          customer:customers(id, name)
        `)
        .single();

      if (error) throw error;

      setQuotes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating quote:', err);
      throw err;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customer:customers(id, name)
        `)
        .single();

      if (error) throw error;

      setQuotes(prev =>
        prev.map(quote => (quote.id === id ? data : quote))
      );
      return data;
    } catch (err) {
      console.error('Error updating quote:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuotes();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('quotes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `org_id=eq.${profile?.org_id}`
        },
        () => {
          fetchQuotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.org_id]);

  return {
    quotes,
    loading,
    error,
    createQuote,
    updateQuote,
    refetch: fetchQuotes,
  };
}