import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';

export default function SeedScenarios() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Data Seeding Scenarios
          </CardTitle>
          <CardDescription>
            Load test data scenarios for development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Data seeding interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}