import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { getDocuments } from '@/services/documentService';
import { Database } from '@/integrations/supabase/types';

type DbDocument = Database['public']['Tables']['documents']['Row'];

export function useDocuments(includeTest = false) {
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user?.org_id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getDocuments(user.org_id, includeTest);
      setDocuments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user || !user.org_id) return;

    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `org_id=eq.${user.org_id}`
        },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [user, includeTest]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments
  };
}