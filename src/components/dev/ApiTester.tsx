import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Play, Copy, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface ApiResponse {
  status: number;
  data: any;
  error?: string;
}

export default function ApiTester() {
  const { user } = useAuth();
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/test');
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test APIs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        toast({
          title: 'Error',
          description: 'Invalid JSON in headers',
          variant: 'destructive',
        });
        return;
      }

      let parsedBody = null;
      if (body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          toast({
            title: 'Error',
            description: 'Invalid JSON in body',
            variant: 'destructive',
          });
          return;
        }
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          ...parsedHeaders,
        },
      };

      if (parsedBody && method !== 'GET') {
        options.body = JSON.stringify(parsedBody);
      }

      const res = await fetch(endpoint, options);
      const data = await res.json();

      setResponse({
        status: res.status,
        data,
        error: res.ok ? undefined : data.message || 'Request failed',
      });
    } catch (error) {
      setResponse({
        status: 0,
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const presetEndpoints = [
    { label: 'Test Endpoint', value: '/api/test' },
    { label: 'Health Check', value: '/api/health' },
    { label: 'User Profile', value: '/api/user/profile' },
    { label: 'Organization Data', value: '/api/org/data' },
  ];

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Select value={endpoint} onValueChange={setEndpoint}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presetEndpoints.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint-custom">Custom Endpoint</Label>
            <Input
              id="endpoint-custom"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/endpoint"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              rows={3}
            />
          </div>

          {method !== 'GET' && (
            <div className="space-y-2">
              <Label htmlFor="body">Request Body (JSON)</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
          )}

          <Button onClick={handleTest} disabled={loading} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Test API'}
          </Button>

          {response && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Response</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResponse}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status}
                  </span>
                </div>
                <pre className="text-sm overflow-auto max-h-64">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
                {response.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {response.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}