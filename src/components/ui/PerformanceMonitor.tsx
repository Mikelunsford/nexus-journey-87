import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  lastUpdate: Date;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    lastUpdate: new Date(),
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [performanceEnabled] = useFeatureFlag('performance.memoization');

  useEffect(() => {
    if (!performanceEnabled) return;

    const updateMetrics = () => {
      const startTime = performance.now();
      
      // Simulate render time measurement
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Get memory usage if available
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
        
        // Count React components (approximation)
        const componentCount = document.querySelectorAll('[data-reactroot]').length;
        
        setMetrics({
          renderTime,
          memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
          componentCount,
          lastUpdate: new Date(),
        });
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial measurement

    return () => clearInterval(interval);
  }, [performanceEnabled]);

  if (!performanceEnabled || !isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        📊 Perf
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Render Time:</span>
          <Badge variant={metrics.renderTime > 16 ? 'destructive' : 'secondary'}>
            {metrics.renderTime.toFixed(2)}ms
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Memory:</span>
          <Badge variant={metrics.memoryUsage > 100 ? 'destructive' : 'secondary'}>
            {metrics.memoryUsage}MB
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Components:</span>
          <Badge variant="outline">
            {metrics.componentCount}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last update: {metrics.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

