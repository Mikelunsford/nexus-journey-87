import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export function useTestData() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile } = useAuth();

  const generateTestData = async (type: string, options?: { customerId?: string; projectId?: string }) => {
    if (!profile?.org_id) {
      toast({
        title: 'Error',
        description: 'No organization found',
        variant: 'destructive',
      });
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-test-data', {
        body: {
          type,
          customerId: options?.customerId,
          projectId: options?.projectId,
        },
      });

      if (error) throw error;

      toast({
        title: 'Test Data Generated',
        description: `Successfully created test ${type}`,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate test data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanupTestData = async () => {
    if (!profile?.org_id) {
      toast({
        title: 'Error',
        description: 'No organization found',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Delete test data from all tables
      await Promise.all([
        supabase.from('projects').delete().eq('org_id', profile.org_id).eq('is_test', true),
        supabase.from('quotes').delete().eq('org_id', profile.org_id).eq('is_test', true),
        supabase.from('shipments').delete().eq('org_id', profile.org_id).eq('is_test', true),
        supabase.from('messages').delete().eq('org_id', profile.org_id).eq('is_test', true),
        supabase.from('documents').delete().eq('org_id', profile.org_id).eq('is_test', true),
        supabase.from('work_orders').delete().eq('org_id', profile.org_id).eq('is_test', true),
      ]);

      toast({
        title: 'Test Data Cleaned',
        description: 'All test data has been removed',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cleanup test data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTestData,
    cleanupTestData,
    isGenerating,
  };
}