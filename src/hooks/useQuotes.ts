import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

import { Database } from '@/integrations/supabase/types';

type DbQuote = Database['public']['Tables']['quotes']['Row'];
type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];
type QuoteUpdate = Database['public']['Tables']['quotes']['Update'];

interface Quote extends DbQuote {
  customers?: {
    name: string;
  };
}

export function useQuotes(includeTest = false) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, effectiveRole } = useAuth();

  const fetchQuotes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('quotes')
        .select(`
          *,
          customers (
            name
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

      setQuotes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: QuoteInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select(`
          *,
          customers (
            name
          )
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      setQuotes(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating quote:', err);
      return { data: null, error: err };
    }
  };

  const updateQuote = async (id: string, updates: QuoteUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customers (
            name
          )
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      setQuotes(prev => prev.map(quote => 
        quote.id === id ? data : quote
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating quote:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [user, includeTest]);

  return {
    quotes,
    loading,
    error,
    createQuote,
    updateQuote,
    refetch: fetchQuotes
  };
}