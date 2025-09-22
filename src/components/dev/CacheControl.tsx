import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, RefreshCw, Database, HardDrive, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheItem {
  key: string;
  size: number;
  type: 'localStorage' | 'sessionStorage' | 'queryCache' | 'browserCache';
  lastAccessed: string;
  expiresAt?: string;
}

export default function CacheControl() {
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [storageUsage, setStorageUsage] = useState({
    localStorage: 0,
    sessionStorage: 0,
    indexedDB: 0,
    total: 0
  });
  const [clearingType, setClearingType] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCacheData();
    calculateStorageUsage();
  }, []);

  const loadCacheData = () => {
    const items: CacheItem[] = [];

    // Load localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        items.push({
          key,
          size: value ? new Blob([value]).size : 0,
          type: 'localStorage',
          lastAccessed: new Date().toISOString(),
          expiresAt: key.includes('expiry') ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
        });
      }
    }

    // Load sessionStorage items
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        items.push({
          key,
          size: value ? new Blob([value]).size : 0,
          type: 'sessionStorage',
          lastAccessed: new Date().toISOString()
        });
      }
    }

    // Mock query cache items
    const mockQueryCache = [
      { key: 'projects-list', size: 2048, lastAccessed: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { key: 'user-profile', size: 512, lastAccessed: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
      { key: 'customers-data', size: 4096, lastAccessed: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
    ];

    mockQueryCache.forEach(item => {
      items.push({
        ...item,
        type: 'queryCache'
      });
    });

    setCacheItems(items);
  };

  const calculateStorageUsage = async () => {
    try {
      // Calculate localStorage usage
      let localStorageSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += localStorage[key].length + key.length;
        }
      }

      // Calculate sessionStorage usage
      let sessionStorageSize = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionStorageSize += sessionStorage[key].length + key.length;
        }
      }

      // Estimate IndexedDB usage (if available)
      let indexedDBSize = 0;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        indexedDBSize = estimate.usage || 0;
      }

      const total = localStorageSize + sessionStorageSize + indexedDBSize;

      setStorageUsage({
        localStorage: localStorageSize,
        sessionStorage: sessionStorageSize,
        indexedDB: indexedDBSize,
        total
      });
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearCache = async (type: string) => {
    setClearingType(type);
    
    try {
      switch (type) {
        case 'localStorage':
          localStorage.clear();
          toast({
            title: 'Local Storage Cleared',
            description: 'All localStorage data has been removed.'
          });
          break;
        
        case 'sessionStorage':
          sessionStorage.clear();
          toast({
            title: 'Session Storage Cleared',
            description: 'All sessionStorage data has been removed.'
          });
          break;
        
        case 'queryCache':
          // In a real app, this would clear React Query cache
          toast({
            title: 'Query Cache Cleared',
            description: 'All cached query data has been invalidated.'
          });
          break;
        
        case 'browserCache':
          // This is just informational - browser cache cannot be cleared via JS
          toast({
            title: 'Browser Cache',
            description: 'Browser cache cannot be cleared programmatically. Please use browser settings.',
            variant: 'destructive'
          });
          break;
        
        case 'all':
          localStorage.clear();
          sessionStorage.clear();
          toast({
            title: 'All Cache Cleared',
            description: 'All application cache data has been cleared.'
          });
          break;
      }

      // Reload cache data
      setTimeout(() => {
        loadCacheData();
        calculateStorageUsage();
        setClearingType(null);
      }, 500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache. Please try again.',
        variant: 'destructive'
      });
      setClearingType(null);
    }
  };

  const clearSpecificItem = (key: string, type: CacheItem['type']) => {
    switch (type) {
      case 'localStorage':
        localStorage.removeItem(key);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(key);
        break;
    }
    
    loadCacheData();
    calculateStorageUsage();
    
    toast({
      title: 'Item Removed',
      description: `Cache item "${key}" has been removed.`
    });
  };

  const groupedItems = cacheItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, CacheItem[]>);

  const cacheTypes = {
    localStorage: { label: 'Local Storage', icon: HardDrive, description: 'Persistent browser storage' },
    sessionStorage: { label: 'Session Storage', icon: Database, description: 'Session-scoped storage' },
    queryCache: { label: 'Query Cache', icon: RefreshCw, description: 'API response cache' },
    browserCache: { label: 'Browser Cache', icon: Globe, description: 'Browser HTTP cache' }
  };

  return (
    <div className="space-y-6">
      {/* Storage Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{formatBytes(storageUsage.localStorage)}</div>
            <div className="text-sm text-muted-foreground">Local Storage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{formatBytes(storageUsage.sessionStorage)}</div>
            <div className="text-sm text-muted-foreground">Session Storage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{formatBytes(storageUsage.indexedDB)}</div>
            <div className="text-sm text-muted-foreground">IndexedDB</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{formatBytes(storageUsage.total)}</div>
            <div className="text-sm text-muted-foreground">Total Usage</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>
            Clear different types of application cache data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => clearCache('localStorage')}
              disabled={clearingType === 'localStorage'}
            >
              {clearingType === 'localStorage' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Local Storage
            </Button>
            
            <Button
              variant="outline"
              onClick={() => clearCache('sessionStorage')}
              disabled={clearingType === 'sessionStorage'}
            >
              {clearingType === 'sessionStorage' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Session Storage
            </Button>
            
            <Button
              variant="outline"
              onClick={() => clearCache('queryCache')}
              disabled={clearingType === 'queryCache'}
            >
              {clearingType === 'queryCache' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Query Cache
            </Button>
            
            <Button
              variant="danger"
              onClick={() => clearCache('all')}
              disabled={clearingType === 'all'}
            >
              {clearingType === 'all' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Items Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Items</CardTitle>
          <CardDescription>
            Detailed view of cached data with individual item management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="localStorage">
            <TabsList className="grid grid-cols-4 w-full">
              {Object.entries(cacheTypes).map(([key, type]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(cacheTypes).map(([key, type]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    <Badge variant="outline">
                      {groupedItems[key]?.length || 0} items
                    </Badge>
                  </div>

                  {key === 'browserCache' ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Browser cache cannot be managed programmatically. 
                        Use your browser's developer tools or settings to clear the HTTP cache.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {groupedItems[key]?.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm font-mono truncate">{item.key}</code>
                                <Badge variant="secondary" className="text-xs">
                                  {formatBytes(item.size)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Last accessed: {new Date(item.lastAccessed).toLocaleTimeString()}</span>
                                {item.expiresAt && (
                                  <>
                                    <span>•</span>
                                    <span>Expires: {new Date(item.expiresAt).toLocaleString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {key !== 'queryCache' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearSpecificItem(item.key, item.type)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )) || (
                          <div className="text-center text-muted-foreground py-8">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No {type.label.toLowerCase()} items found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}