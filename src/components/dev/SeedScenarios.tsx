import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Database, Users, Package, FileText } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface SeedScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  entities: string[];
  estimatedTime: string;
}

const scenarios: SeedScenario[] = [
  {
    id: 'basic',
    name: 'Basic Data',
    description: 'Create basic customers, projects, and quotes for testing',
    icon: Database,
    entities: ['5 customers', '3 projects', '8 quotes'],
    estimatedTime: '30 seconds',
  },
  {
    id: 'team',
    name: 'Team Setup',
    description: 'Create team members with different roles and permissions',
    icon: Users,
    entities: ['10 users', '5 roles', '20 assignments'],
    estimatedTime: '45 seconds',
  },
  {
    id: 'production',
    name: 'Production Data',
    description: 'Create work orders, shipments, and production data',
    icon: Package,
    entities: ['15 work orders', '12 shipments', '25 documents'],
    estimatedTime: '60 seconds',
  },
  {
    id: 'full',
    name: 'Full Dataset',
    description: 'Create comprehensive test data across all modules',
    icon: TestTube,
    entities: ['50+ entities', 'All modules', 'Complex relationships'],
    estimatedTime: '2 minutes',
  },
];

export default function SeedScenarios() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSeed = async (scenarioId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to seed data',
        variant: 'destructive',
      });
      return;
    }

    setLoading(scenarioId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: `Successfully seeded ${scenarios.find(s => s.id === scenarioId)?.name} data`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to seed data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleClearData = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to clear data',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
      return;
    }

    setLoading('clear');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'All test data has been cleared',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Data Seeding Scenarios
          </CardTitle>
          <CardDescription>
            Load test data scenarios for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isLoading = loading === scenario.id;
              
              return (
                <Card key={scenario.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Entities:</p>
                        <div className="flex flex-wrap gap-1">
                          {scenario.entities.map((entity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Est. time: {scenario.estimatedTime}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleSeed(scenario.id)}
                          disabled={isLoading || loading !== null}
                        >
                          {isLoading ? 'Seeding...' : 'Seed Data'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Clear Test Data</h3>
                <p className="text-sm text-muted-foreground">
                  Remove all test data from the database
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearData}
                disabled={loading !== null}
              >
                {loading === 'clear' ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}