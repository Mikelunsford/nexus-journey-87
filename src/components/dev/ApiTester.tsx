import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

export default function ApiTester() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            API Testing Interface
          </CardTitle>
          <CardDescription>
            Test internal API endpoints with authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">API testing interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}