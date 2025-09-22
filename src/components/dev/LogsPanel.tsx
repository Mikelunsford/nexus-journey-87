import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, Download, Filter, AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source: string;
  data?: Record<string, any>;
}

// Mock log data
const generateMockLogs = (): LogEntry[] => {
  const levels: LogEntry['level'][] = ['error', 'warn', 'info', 'debug'];
  const sources = ['auth', 'api', 'ui', 'database', 'cache', 'export'];
  const messages = [
    'User authentication successful',
    'Database query executed',
    'Cache miss for key: user_profile_123',
    'Export process completed',
    'Invalid API request format',
    'Database connection timeout',
    'User session expired',
    'Memory usage threshold exceeded'
  ];

  return Array.from({ length: 100 }, (_, i) => {
    const timestamp = new Date(Date.now() - i * 60000 * Math.random()).toISOString();
    const level = levels[Math.floor(Math.random() * levels.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      id: `log-${i}`,
      timestamp,
      level,
      message,
      source,
      data: level === 'error' ? { stack: 'Error at line 123...' } : undefined
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    setLogs(generateMockLogs());
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, sourceFilter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new logs
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'warn' : 'info',
        message: `Real-time log entry ${new Date().toLocaleTimeString()}`,
        source: 'realtime'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadgeVariant = (level: LogEntry['level']): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
        return 'default';
      case 'debug':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const exportLogs = () => {
    const logsText = filteredLogs.map(log => 
      `${log.timestamp} [${log.level.toUpperCase()}] ${log.source}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const refreshLogs = () => {
    setLogs(generateMockLogs());
  };

  const sources = [...new Set(logs.map(log => log.source))].sort();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? 'bg-green-100' : ''}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Auto' : 'Manual'}
        </Button>

        <Button variant="outline" size="sm" onClick={refreshLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button variant="outline" size="sm" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" size="sm" onClick={clearLogs}>
          Clear
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="outline" className="flex items-center gap-1">
          <Filter className="h-3 w-3" />
          {filteredLogs.length} / {logs.length} logs
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-500" />
          {filteredLogs.filter(l => l.level === 'error').length} errors
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-yellow-500" />
          {filteredLogs.filter(l => l.level === 'warn').length} warnings
        </Badge>
      </div>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Logs</CardTitle>
          <CardDescription>
            Real-time application logs with filtering and export capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        </div>
                        <p className="text-sm truncate">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getLevelIcon(log.level)}
                          <Badge variant={getLevelBadgeVariant(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{log.source}</Badge>
                          <span className="text-sm font-mono text-muted-foreground ml-auto">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{log.message}</p>
                        {log.data && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Additional Data
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}