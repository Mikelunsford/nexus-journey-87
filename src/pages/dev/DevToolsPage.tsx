import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getRoleBucket, hasPermissionLevel } from '@/lib/rbac/roleBuckets';
import { canAccess } from '@/lib/rbac/permissions';
import PageSection from '@/components/layout/PageSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Terminal, Settings, Activity, TestTube, Zap } from 'lucide-react';
import SchemaViewer from '@/components/dev/SchemaViewer';
import LogsPanel from '@/components/dev/LogsPanel';
import EnvViewer from '@/components/dev/EnvViewer';
import CacheControl from '@/components/dev/CacheControl';
import ApiTester from '@/components/dev/ApiTester';
import SeedScenarios from '@/components/dev/SeedScenarios';

export default function DevToolsPage() {
  const { user, effectiveRole } = useAuth();
  const [activeTab, setActiveTab] = useState('schema');

  // Check permissions
  if (!user) {
    return (
      <PageSection title="Dev Tools" subtitle="Development utilities and debugging tools">
        <Alert>
          <AlertDescription>Please log in to access dev tools.</AlertDescription>
        </Alert>
      </PageSection>
    );
  }

  const hasAccess = canAccess(effectiveRole, '/dashboard/dev/tools');

  if (!hasAccess) {
    return (
      <PageSection title="Dev Tools" subtitle="Development utilities and debugging tools">
        <Alert>
          <AlertDescription>
            Access restricted. Dev tools require Manager or Admin privileges.
          </AlertDescription>
        </Alert>
      </PageSection>
    );
  }

  const tools = [
    {
      id: 'schema',
      title: 'Schema Browser',
      description: 'Explore database structure and relationships',
      icon: Database,
      component: SchemaViewer
    },
    {
      id: 'logs',
      title: 'Application Logs',
      description: 'View and filter application logs',
      icon: Activity,
      component: LogsPanel
    },
    {
      id: 'env',
      title: 'Environment',
      description: 'View environment configuration',
      icon: Settings,
      component: EnvViewer
    },
    {
      id: 'cache',
      title: 'Cache Control',
      description: 'Manage application cache and storage',
      icon: Zap,
      component: CacheControl
    },
    {
      id: 'api',
      title: 'API Tester',
      description: 'Test internal API endpoints',
      icon: Terminal,
      component: ApiTester
    },
    {
      id: 'seed',
      title: 'Data Seeding',
      description: 'Load test data scenarios',
      icon: TestTube,
      component: SeedScenarios
    }
  ];

  return (
    <PageSection 
      title="Dev Tools" 
      subtitle="Development utilities and debugging tools"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Development Tools Dashboard
                </CardTitle>
                <CardDescription>
                  Comprehensive development and debugging utilities
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {effectiveRole} access
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                {tools.map(tool => (
                  <TabsTrigger 
                    key={tool.id} 
                    value={tool.id}
                    className="flex items-center gap-2"
                  >
                    <tool.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tool.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tools.map(tool => (
                <TabsContent key={tool.id} value={tool.id} className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <tool.icon className="h-5 w-5" />
                        {tool.title}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <tool.component />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}