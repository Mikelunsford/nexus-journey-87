import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff, Search, Shield, Server, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnvVariable {
  key: string;
  value: string;
  category: 'app' | 'database' | 'api' | 'feature' | 'security';
  sensitive: boolean;
  description?: string;
}

// Mock environment variables
const mockEnvVars: EnvVariable[] = [
  {
    key: 'NODE_ENV',
    value: 'development',
    category: 'app',
    sensitive: false,
    description: 'Application environment mode'
  },
  {
    key: 'VITE_SUPABASE_URL',
    value: 'https://kjweuajrmyohatweqdts.supabase.co',
    category: 'database',
    sensitive: false,
    description: 'Supabase project URL'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd2V1YWpybXlvaGF0d2VxZHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDk2MjUsImV4cCI6MjA3NDA4NTYyNX0.37zOUBLqS3_FtUqboRW2VMdVMSjC-AQ56RBgdkHrsFI',
    category: 'api',
    sensitive: false,
    description: 'Supabase anonymous key (public)'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: '••••••••••••••••••••••••••••••••••••••••',
    category: 'security',
    sensitive: true,
    description: 'Supabase service role key (private)'
  },
  {
    key: 'DATABASE_URL',
    value: '••••••••••••••••••••••••••••••••••••••••',
    category: 'database',
    sensitive: true,
    description: 'Direct database connection URL'
  },
  {
    key: 'VITE_APP_VERSION',
    value: '1.0.0',
    category: 'app',
    sensitive: false,
    description: 'Application version number'
  },
  {
    key: 'VITE_API_BASE_URL',
    value: 'https://api.example.com/v1',
    category: 'api',
    sensitive: false,
    description: 'Base URL for API endpoints'
  },
  {
    key: 'FEATURE_FLAG_ADMIN_PANEL',
    value: 'true',
    category: 'feature',
    sensitive: false,
    description: 'Enable admin panel features'
  },
  {
    key: 'FEATURE_FLAG_ANALYTICS',
    value: 'true',
    category: 'feature',
    sensitive: false,
    description: 'Enable analytics dashboard'
  },
  {
    key: 'JWT_SECRET',
    value: '••••••••••••••••••••••••••••••••••••••••',
    category: 'security',
    sensitive: true,
    description: 'JWT signing secret'
  }
];

export default function EnvViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = {
    all: { label: 'All Variables', icon: Globe, color: 'bg-gray-100 text-gray-800' },
    app: { label: 'Application', icon: Server, color: 'bg-blue-100 text-blue-800' },
    database: { label: 'Database', icon: Server, color: 'bg-green-100 text-green-800' },
    api: { label: 'API Keys', icon: Globe, color: 'bg-purple-100 text-purple-800' },
    feature: { label: 'Feature Flags', icon: Eye, color: 'bg-orange-100 text-orange-800' },
    security: { label: 'Security', icon: Shield, color: 'bg-red-100 text-red-800' }
  };

  const filteredVars = mockEnvVars.filter(envVar => {
    const matchesSearch = envVar.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         envVar.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || envVar.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `Environment variable ${key} copied to clipboard.`
    });
  };

  const getValueDisplay = (envVar: EnvVariable): string => {
    if (envVar.sensitive && !showSensitive) {
      return '••••••••••••••••••••••••••••••••••••••••';
    }
    return envVar.value;
  };

  const stats = {
    total: mockEnvVars.length,
    sensitive: mockEnvVars.filter(v => v.sensitive).length,
    public: mockEnvVars.filter(v => !v.sensitive).length,
    byCategory: Object.keys(categories).reduce((acc, cat) => {
      if (cat !== 'all') {
        acc[cat] = mockEnvVars.filter(v => v.category === cat).length;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search environment variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          size="sm"
          onClick={() => setShowSensitive(!showSensitive)}
          className={showSensitive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
        >
          {showSensitive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showSensitive ? 'Hide' : 'Show'} Sensitive
        </Button>
      </div>

      {/* Security Warning */}
      {showSensitive && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Sensitive values are now visible. Ensure no one is watching your screen.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge>{stats.total} total variables</Badge>
        <Badge className="text-red-600">
          {stats.sensitive} sensitive
        </Badge>
        <Badge className="text-green-600">
          {stats.public} public
        </Badge>
      </div>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment Configuration
          </CardTitle>
          <CardDescription>
            Application environment variables and configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-6 w-full">
              {Object.entries(categories).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <category.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredVars.map((envVar) => (
                    <Card key={envVar.key} className="transition-colors hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {envVar.key}
                              </code>
                              <Badge 
                                className={categories[envVar.category].color}
                              >
                                {categories[envVar.category].label}
                              </Badge>
                              {envVar.sensitive && (
                                <Badge className="text-xs bg-red-100 text-red-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Sensitive
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="font-mono text-sm break-all bg-muted p-2 rounded">
                                {getValueDisplay(envVar)}
                              </div>
                              {envVar.description && (
                                <p className="text-sm text-muted-foreground">
                                  {envVar.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(envVar.value, envVar.key)}
                            disabled={envVar.sensitive && !showSensitive}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Environment Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.byCategory).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {React.createElement(categories[category as keyof typeof categories].icon, { 
                  className: "h-6 w-6" 
                })}
              </div>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">
                {categories[category as keyof typeof categories].label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}