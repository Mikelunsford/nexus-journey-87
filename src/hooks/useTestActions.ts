import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export type TestEntityType = 'project' | 'quote' | 'shipment' | 'message' | 'document';

export interface TestActionResult {
  id: string;
  type: TestEntityType;
  name: string;
  navigateTo?: string;
}

export function useTestActions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testSeedsEnabled] = useFeatureFlag('ui.enable_test_seeds');
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const generateTestEntity = async (type: TestEntityType): Promise<TestActionResult | null> => {
    if (!testSeedsEnabled) {
      toast.error('Test tools are disabled');
      return null;
    }

    if (!user || !profile?.org_id) {
      toast.error('Authentication required');
      return null;
    }

    setIsGenerating(true);
    try {
      let result: TestActionResult;

      switch (type) {
        case 'project':
          // First get a customer to associate with the project
          const { data: customers } = await supabase
            .from('customers')
            .select('id')
            .eq('org_id', profile.org_id)
            .limit(1);

          if (!customers?.length) {
            toast.error('No customers found - create a customer first');
            return null;
          }

          const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
              org_id: profile.org_id,
              customer_id: customers[0].id,
              title: 'Test Project (Demo)',
              description: 'This is a test project created for demonstration purposes',
              status: 'draft',
              priority: 'medium',
              is_test: true
            })
            .select()
            .single();

          if (projectError) throw projectError;

          result = {
            id: project.id,
            type: 'project',
            name: 'Test Project (Demo)',
            navigateTo: '/dashboard/projects'
          };
          break;

        case 'quote':
          const { data: quoteCustomers } = await supabase
            .from('customers')
            .select('id')
            .eq('org_id', profile.org_id)
            .limit(1);

          if (!quoteCustomers?.length) {
            toast.error('No customers found - create a customer first');
            return null;
          }

          const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .insert({
              org_id: profile.org_id,
              customer_id: quoteCustomers[0].id,
              total: 15750.00,
              status: 'draft',
              line_items: [
                { description: 'Industrial Equipment', quantity: 2, rate: 5000.00, amount: 10000.00 },
                { description: 'Installation Service', quantity: 1, rate: 3750.00, amount: 3750.00 },
                { description: 'Training & Documentation', quantity: 1, rate: 2000.00, amount: 2000.00 }
              ],
              notes: 'Test quote created for demonstration purposes',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              is_test: true
            })
            .select()
            .single();

          if (quoteError) throw quoteError;

          result = {
            id: quote.id,
            type: 'quote',
            name: 'Test Quote (Demo)',
            navigateTo: '/dashboard/quotes'
          };
          break;

        case 'shipment':
          const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .insert({
              org_id: profile.org_id,
              status: 'created',
              carrier: 'FedEx',
              tracking_number: `TEST-${Date.now()}`,
              address: 'Little Rock, AR, USA',
              items: [
                { description: 'Test Package 1', weight: 25.5, dimensions: '12x8x6' },
                { description: 'Test Package 2', weight: 18.2, dimensions: '10x10x4' }
              ],
              metadata: { origin: 'Memphis, TN, USA', notes: 'Test shipment for demo' },
              is_test: true
            })
            .select()
            .single();

          if (shipmentError) throw shipmentError;

          result = {
            id: shipment.id,
            type: 'shipment', 
            name: 'Test Shipment (Demo)',
            navigateTo: '/dashboard/shipments'
          };
          break;

        case 'message':
          const { data: message, error: messageError } = await supabase
            .from('messages')
            .insert({
              org_id: profile.org_id,
              subject: 'Test Message Thread (Demo)',
              body: 'This is a test message created for demonstration purposes.',
              from_email: profile.email || 'test@example.com',
              to_emails: [profile.email || 'test@example.com'],
              type: 'email',
              status: 'sent',
              sent_at: new Date().toISOString(),
              is_test: true
            })
            .select()
            .single();

          if (messageError) throw messageError;

          result = {
            id: message.id,
            type: 'message',
            name: 'Test Message Thread (Demo)',
            navigateTo: '/dashboard/messages'
          };
          break;

        case 'document':
          const { data: document, error: documentError } = await supabase
            .from('documents')
            .insert({
              org_id: profile.org_id,
              name: 'Test Document (Demo).pdf',
              original_name: 'Test Document (Demo).pdf',
              mime_type: 'application/pdf',
              size_bytes: 1024000,
              url: '/placeholder-document.pdf',
              storage_path: 'test/demo-document.pdf',
              entity_type: 'general',
              entity_id: crypto.randomUUID(),
              tags: ['demo', 'test'],
              metadata: { description: 'Test document for demonstration purposes' },
              is_test: true
            })
            .select()
            .single();

          if (documentError) throw documentError;

          result = {
            id: document.id,
            type: 'document',
            name: 'Test Document (Demo)',
            navigateTo: '/dashboard/documents'
          };
          break;

        default:
          throw new Error(`Unsupported test entity type: ${type}`);
      }

      toast.success(`Generated ${result.name}`);
      
      if (result.navigateTo) {
        navigate(result.navigateTo);
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to generate test ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Test generation error:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTestEntity,
    isGenerating,
    testSeedsEnabled
  };
}