import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

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

  const generateTestEntity = async (type: TestEntityType): Promise<TestActionResult | null> => {
    if (!testSeedsEnabled) {
      toast.error('Test tools are disabled');
      return null;
    }

    setIsGenerating(true);
    try {
      // Simulate API call for now - will be replaced with actual Edge Function
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults: Record<TestEntityType, TestActionResult> = {
        project: {
          id: crypto.randomUUID(),
          type: 'project',
          name: 'Test Project (Demo)',
          navigateTo: '/dashboard/projects'
        },
        quote: {
          id: crypto.randomUUID(),
          type: 'quote',
          name: 'Test Quote (Demo)',
          navigateTo: '/dashboard/quotes'
        },
        shipment: {
          id: crypto.randomUUID(),
          type: 'shipment',
          name: 'Test Shipment (Demo)',
          navigateTo: '/dashboard/shipments'
        },
        message: {
          id: crypto.randomUUID(),
          type: 'message',
          name: 'Test Message Thread (Demo)',
          navigateTo: '/dashboard/messages'
        },
        document: {
          id: crypto.randomUUID(),
          type: 'document',
          name: 'Test Document (Demo)',
          navigateTo: '/dashboard/documents'
        }
      };

      const result = mockResults[type];
      toast.success(`Generated ${result.name}`);
      
      if (result.navigateTo) {
        navigate(result.navigateTo);
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to generate test ${type}`);
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