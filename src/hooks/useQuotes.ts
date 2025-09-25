import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getQuotes,
  createQuote as createQuoteService,
  updateQuote as updateQuoteService
} from '@/services/quoteService';
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
    if (!user?.org_id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getQuotes(user.org_id, includeTest);
      setQuotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: QuoteInsert) => {
    if (!user?.org_id) {
      return { data: null, error: new Error('Organization not found') };
    }

    try {
      const data = await createQuoteService(user.org_id, quoteData);
      setQuotes(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating quote:', err);
      return { data: null, error: err };
    }
  };

  const updateQuote = async (id: string, updates: QuoteUpdate) => {
    if (!user?.org_id) {
      return { data: null, error: new Error('Organization not found') };
    }

    try {
      const data = await updateQuoteService(user.org_id, id, updates);
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