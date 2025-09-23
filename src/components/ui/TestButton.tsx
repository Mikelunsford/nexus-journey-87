import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube, Loader2 } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useTestData } from '@/hooks/useTestData';
import { useNavigate } from 'react-router-dom';

interface TestButtonProps {
  type: 'project' | 'quote' | 'shipment' | 'message' | 'document';
  customerId?: string;
  projectId?: string;
  navigateTo?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TestButton({ 
  type, 
  customerId, 
  projectId, 
  navigateTo,
  variant = 'outline',
  size = 'sm',
  className 
}: TestButtonProps) {
  const [testSeedsEnabled] = useFeatureFlag('ui.enable_test_seeds');
  const { generateTestData, isGenerating } = useTestData();
  const navigate = useNavigate();

  if (!testSeedsEnabled) {
    return null;
  }

  const handleGenerateTest = async () => {
    try {
      const result = await generateTestData(type, { customerId, projectId });
      
      if (result && navigateTo) {
        // If a specific navigation path is provided, use it
        navigate(navigateTo);
      } else if (result) {
        // Navigate to the created item's detail page
        const itemId = result[type]?.id;
        if (itemId) {
          switch (type) {
            case 'project':
              navigate(`/dashboard/projects/${itemId}`);
              break;
            case 'quote':
              navigate(`/dashboard/quotes/${itemId}`);
              break;
            case 'shipment':
              navigate(`/dashboard/shipments/${itemId}`);
              break;
            case 'message':
              navigate(`/dashboard/messages`);
              break;
            case 'document':
              navigate(`/dashboard/documents`);
              break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate test data:', error);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleGenerateTest}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <TestTube className="h-4 w-4" />
      )}
      {size !== 'sm' && (
        <span className="ml-2">
          {isGenerating ? 'Generating...' : 'Test'}
        </span>
      )}
    </Button>
  );
}