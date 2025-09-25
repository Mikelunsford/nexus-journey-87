import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface RouteInfo {
  path: string;
  component: string;
  isLazy: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export default function RouteValidator() {
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [testPath, setTestPath] = useState('');
  const [testResult, setTestResult] = useState<{
    isValid: boolean;
    matchedRoute?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    // Extract route information from the router
    const extractRoutes = async () => {
      try {
        // This would normally parse the actual router configuration
        // For now, we'll simulate the route extraction
        const mockRoutes: RouteInfo[] = [
          { path: '/', component: 'Dashboard', isLazy: true, hasError: false },
          { path: '/dashboard', component: 'Dashboard', isLazy: true, hasError: false },
          { path: '/dashboard/customers', component: 'CustomersPage', isLazy: true, hasError: false },
          { path: '/dashboard/projects', component: 'ProjectsPage', isLazy: true, hasError: false },
          { path: '/dashboard/quotes', component: 'QuotesPage', isLazy: true, hasError: false },
          { path: '/dashboard/shipments', component: 'ShipmentsPage', isLazy: true, hasError: false },
          { path: '/dashboard/team', component: 'EmployeesPage', isLazy: true, hasError: false },
          { path: '/dashboard/analytics', component: 'AnalyticsPage', isLazy: true, hasError: false },
          { path: '/dashboard/messages', component: 'MessagesPage', isLazy: true, hasError: false },
          { path: '/dashboard/settings', component: 'SettingsPage', isLazy: true, hasError: false },
          { path: '/dashboard/dev/tools', component: 'DevToolsPage', isLazy: true, hasError: false },
          { path: '/dashboard/dev/bridge', component: 'BridgePanel', isLazy: true, hasError: false },
          { path: '/auth', component: 'AuthPage', isLazy: true, hasError: false },
          { path: '*', component: 'NotFoundPage', isLazy: true, hasError: false },
        ];
        
        setRoutes(mockRoutes);
      } catch (error) {
        console.error('Error extracting routes:', error);
      }
    };

    extractRoutes();
  }, []);

  const validatePath = (path: string) => {
    if (!path) {
      setTestResult({ isValid: false, error: 'Please enter a path to test' });
      return;
    }

    // Simple route matching logic
    const matchedRoute = routes.find(route => {
      if (route.path === '*') return true; // Catch-all route
      if (route.path === path) return true; // Exact match
      
      // Handle dynamic routes (e.g., /projects/:id)
      const routePattern = route.path.replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(path);
    });

    if (matchedRoute) {
      setTestResult({
        isValid: true,
        matchedRoute: matchedRoute.path
      });
    } else {
      setTestResult({
        isValid: false,
        error: 'No matching route found'
      });
    }
  };

  const getStatusIcon = (route: RouteInfo) => {
    if (route.hasError) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (route: RouteInfo) => {
    if (route.hasError) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="secondary">OK</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Route Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Route Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-path">Test Path</Label>
              <Input
                id="test-path"
                placeholder="/dashboard/customers"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && validatePath(testPath)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => validatePath(testPath)}>
                Test Route
              </Button>
            </div>
          </div>

          {testResult && (
            <Alert className={testResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {testResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {testResult.isValid ? (
                  <span className="text-green-800">
                    ✅ Route is valid! Matches: <code className="bg-green-100 px-1 rounded">{testResult.matchedRoute}</code>
                  </span>
                ) : (
                  <span className="text-red-800">
                    ❌ {testResult.error}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Route Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Route Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {routes.map((route, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(route)}
                  <div>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {route.path}
                    </code>
                    <div className="text-xs text-muted-foreground mt-1">
                      Component: {route.component}
                      {route.isLazy && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Lazy
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(route)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Route Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{routes.length}</div>
              <div className="text-sm text-muted-foreground">Total Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {routes.filter(r => !r.hasError).length}
              </div>
              <div className="text-sm text-muted-foreground">Valid Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {routes.filter(r => r.hasError).length}
              </div>
              <div className="text-sm text-muted-foreground">Error Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routes.filter(r => r.isLazy).length}
              </div>
              <div className="text-sm text-muted-foreground">Lazy Routes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

