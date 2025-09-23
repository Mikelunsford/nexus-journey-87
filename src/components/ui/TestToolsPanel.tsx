import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestActions } from '@/hooks/useTestActions';
import { TestTube, FileText, Package, Truck, MessageCircle, FolderOpen } from 'lucide-react';

export default function TestToolsPanel() {
  const { generateTestEntity, isGenerating, testSeedsEnabled } = useTestActions();

  if (!testSeedsEnabled) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Tools
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate safe test data for demo and QA purposes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTestEntity('project')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Package className="h-4 w-4" />
            <span className="text-xs">Test Project</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTestEntity('quote')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs">Test Quote</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTestEntity('shipment')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Truck className="h-4 w-4" />
            <span className="text-xs">Test Shipment</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTestEntity('message')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">Test Message</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTestEntity('document')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs">Test Document</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}