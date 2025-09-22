import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RefreshCw, Search, Database, HardDrive, Globe, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StorageItem {
  key: string;
  value: string;
  size: number;
  type: 'string' | 'object' | 'array' | 'number' | 'boolean';
}

interface CacheStats {
  localStorage: {
    items: number;
    size: number;
    itemsList: StorageItem[];
  };
  sessionStorage: {
    items: number;
    size: number;
    itemsList: StorageItem[];
  };
  indexedDB: {
    databases: number;
    estimatedSize: number;
  };
  cacheAPI: {
    caches: number;
    estimatedSize: number;
  };
}

export default function CacheControl() {
  const [stats, setStats] = useState<CacheStats>({
    localStorage: { items: 0, size: 0, itemsList: [] },
    sessionStorage: { items: 0, size: 0, itemsList: [] },
    indexedDB: { databases: 0, estimatedSize: 0 },
    cacheAPI: { caches: 0, estimatedSize: 0 }
  });
  
  const [clearingStates, setClearingStates] = useState({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    cacheAPI: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const getStorageSize = (storage: Storage): number => {
    let size = 0;
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        size += storage[key].length + key.length;
      }
    }
    return size;
  };

  const getStorageItems = (storage: Storage): StorageItem[] => {
    const items: StorageItem[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key) || '';
        const size = key.length + value.length;
        
        let type: StorageItem['type'] = 'string';
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) type = 'array';
          else if (typeof parsed === 'object' && parsed !== null) type = 'object';
          else if (typeof parsed === 'number') type = 'number';
          else if (typeof parsed === 'boolean') type = 'boolean';
        } catch {
          type = 'string';
        }
        
        items.push({ key, value, size, type });
      }
    }
    return items.sort((a, b) => b.size - a.size);
  };

  const calculateStats = async (): Promise<CacheStats> => {
    // LocalStorage
    const localItems = getStorageItems(localStorage);
    const localSize = getStorageSize(localStorage);
    
    // SessionStorage
    const sessionItems = getStorageItems(sessionStorage);
    const sessionSize = getStorageSize(sessionStorage);
    
    // IndexedDB (simplified)
    let indexedDBSize = 0;
    let indexedDBCount = 0;
    
    if ('indexedDB' in window) {
      try {
        // This is a simplified estimation
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          indexedDBSize = estimate.usage || 0;
        }
        indexedDBCount = 1; // Simplified - would need more complex logic to count actual DBs
      } catch (error) {
        console.log('IndexedDB info not available:', error);
      }
    }
    
    // Cache API
    let cacheCount = 0;
    let cacheSize = 0;
    
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        cacheCount = cacheNames.length;
        // Cache size estimation would require iterating through all caches
        cacheSize = cacheCount * 1024; // Rough estimate
      } catch (error) {
        console.log('Cache API info not available:', error);
      }
    }
    
    return {
      localStorage: {
        items: localItems.length,
        size: localSize,
        itemsList: localItems
      },
      sessionStorage: {
        items: sessionItems.length,
        size: sessionSize,
        itemsList: sessionItems
      },
      indexedDB: {
        databases: indexedDBCount,
        estimatedSize: indexedDBSize
      },
      cacheAPI: {
        caches: cacheCount,
        estimatedSize: cacheSize
      }
    };
  };

  const refreshStats = async () => {
    const newStats = await calculateStats();
    setStats(newStats);
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearLocalStorage = async () => {
    setClearingStates(prev => ({ ...prev, localStorage: true }));
    try {
      localStorage.clear();
      await refreshStats();
      toast({
        title: 'Local Storage Cleared',
        description: 'All local storage data has been removed.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear local storage.',
      });
    }
    setClearingStates(prev => ({ ...prev, localStorage: false }));
  };

  const clearSessionStorage = async () => {
    setClearingStates(prev => ({ ...prev, sessionStorage: true }));
    try {
      sessionStorage.clear();
      await refreshStats();
      toast({
        title: 'Session Storage Cleared',
        description: 'All session storage data has been removed.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear session storage.',
      });
    }
    setClearingStates(prev => ({ ...prev, sessionStorage: false }));
  };

  const clearIndexedDB = async () => {
    setClearingStates(prev => ({ ...prev, indexedDB: true }));
    try {
      if ('indexedDB' in window) {
        // This is a simplified approach - in a real app you'd want to enumerate and delete specific databases
        const databases = await indexedDB.databases?.() || [];
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }
      await refreshStats();
      toast({
        title: 'IndexedDB Cleared',
        description: 'IndexedDB data has been cleared.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear IndexedDB.',
      });
    }
    setClearingStates(prev => ({ ...prev, indexedDB: false }));
  };

  const clearAllCaches = async () => {
    await Promise.all([
      clearLocalStorage(),
      clearSessionStorage(),
      clearIndexedDB()
    ]);
  };

  const removeItem = async (storageType: 'localStorage' | 'sessionStorage', key: string) => {
    try {
      if (storageType === 'localStorage') {
        localStorage.removeItem(key);
      } else {
        sessionStorage.removeItem(key);
      }
      await refreshStats();
      toast({
        title: 'Item Removed',
        description: `Removed ${key} from ${storageType}.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to remove ${key}.`,
      });
    }
  };

  const filteredLocalItems = stats.localStorage.itemsList.filter(item =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessionItems = stats.sessionStorage.itemsList.filter(item =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search storage items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button size="sm" onClick={refreshStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Button
              className="bg-red-600 text-white hover:bg-red-700 w-full"
              onClick={clearLocalStorage}
              disabled={clearingStates.localStorage}
            >
              {clearingStates.localStorage ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Local Storage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              className="bg-red-600 text-white hover:bg-red-700 w-full"
              onClick={clearSessionStorage}
              disabled={clearingStates.sessionStorage}
            >
              {clearingStates.sessionStorage ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Session Storage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              className="bg-red-600 text-white hover:bg-red-700 w-full"
              onClick={clearIndexedDB}
              disabled={clearingStates.indexedDB}
            >
              {clearingStates.indexedDB ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Clear IndexedDB
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              className="bg-red-600 text-white hover:bg-red-700 w-full"
              onClick={clearAllCaches}
              disabled={Object.values(clearingStates).some(Boolean)}
            >
              {Object.values(clearingStates).some(Boolean) ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.localStorage.items}</div>
            <div className="text-sm text-muted-foreground">Local Storage Items</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(stats.localStorage.size)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.sessionStorage.items}</div>
            <div className="text-sm text-muted-foreground">Session Storage Items</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(stats.sessionStorage.size)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.indexedDB.databases}</div>
            <div className="text-sm text-muted-foreground">IndexedDB</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(stats.indexedDB.estimatedSize)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats.cacheAPI.caches}</div>
            <div className="text-sm text-muted-foreground">Cache API</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(stats.cacheAPI.estimatedSize)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Storage View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Details
          </CardTitle>
          <CardDescription>
            Inspect and manage individual storage items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="localStorage">
            <TabsList>
              <TabsTrigger value="localStorage" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Local Storage
                <Badge className="bg-blue-100 text-blue-800">{stats.localStorage.items} items</Badge>
              </TabsTrigger>
              <TabsTrigger value="sessionStorage" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Session Storage
                <Badge className="bg-green-100 text-green-800">{stats.sessionStorage.items} items</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="localStorage" className="mt-4">
              {filteredLocalItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {stats.localStorage.items === 0 ? 'No items in local storage' : 'No items match your search'}
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredLocalItems.map((item, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {item.key}
                              </code>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                {item.type}
                              </Badge>
                              <Badge className="text-xs">
                                {formatBytes(item.size)}
                              </Badge>
                              {item.size > 1024 && (
                                <Badge className="text-xs text-yellow-600">
                                  Large Item
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded max-h-20 overflow-auto">
                              {item.value.substring(0, 200)}
                              {item.value.length > 200 && '...'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => removeItem('localStorage', item.key)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="sessionStorage" className="mt-4">
              {filteredSessionItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {stats.sessionStorage.items === 0 ? 'No items in session storage' : 'No items match your search'}
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredSessionItems.map((item, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {item.key}
                              </code>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                {item.type}
                              </Badge>
                              <Badge className="text-xs">
                                {formatBytes(item.size)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded max-h-20 overflow-auto">
                              {item.value.substring(0, 200)}
                              {item.value.length > 200 && '...'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => removeItem('sessionStorage', item.key)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Clearing storage will log you out and reset application preferences. This action cannot be undone.
        </AlertDescription>
      </Alert>
    </div>
  );
}