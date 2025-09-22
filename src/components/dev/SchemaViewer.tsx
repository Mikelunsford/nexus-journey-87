import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Database, Table, Key, Link, ChevronDown, ChevronRight } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  description?: string;
}

interface TableInfo {
  name: string;
  schema: string;
  columns: Column[];
  rowCount?: number;
  description?: string;
  relationships?: {
    type: 'one-to-many' | 'many-to-one' | 'many-to-many';
    table: string;
    column: string;
  }[];
}

// Mock database schema
const mockTables: TableInfo[] = [
  {
    name: 'users',
    schema: 'public',
    rowCount: 1250,
    description: 'Application users and authentication data',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique user identifier' },
      { name: 'email', type: 'text', nullable: false, primaryKey: false, description: 'User email address' },
      { name: 'name', type: 'text', nullable: true, primaryKey: false, description: 'User display name' },
      { name: 'role', type: 'text', nullable: false, primaryKey: false, description: 'User role (admin, user, etc.)' },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Account creation timestamp' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Last profile update' },
    ],
    relationships: [
      { type: 'one-to-many', table: 'projects', column: 'user_id' },
      { type: 'one-to-many', table: 'tasks', column: 'assigned_to' }
    ]
  },
  {
    name: 'projects',
    schema: 'public',
    rowCount: 89,
    description: 'Project management data',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique project identifier' },
      { name: 'name', type: 'text', nullable: false, primaryKey: false, description: 'Project name' },
      { name: 'description', type: 'text', nullable: true, primaryKey: false, description: 'Project description' },
      { name: 'user_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'users', column: 'id' }, description: 'Project owner' },
      { name: 'status', type: 'text', nullable: false, primaryKey: false, description: 'Project status (active, completed, etc.)' },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Project creation timestamp' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Last project update' },
    ],
    relationships: [
      { type: 'many-to-one', table: 'users', column: 'user_id' },
      { type: 'one-to-many', table: 'tasks', column: 'project_id' }
    ]
  },
  {
    name: 'tasks',
    schema: 'public',
    rowCount: 1847,
    description: 'Individual tasks and assignments',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique task identifier' },
      { name: 'title', type: 'text', nullable: false, primaryKey: false, description: 'Task title' },
      { name: 'description', type: 'text', nullable: true, primaryKey: false, description: 'Detailed task description' },
      { name: 'project_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'projects', column: 'id' }, description: 'Parent project' },
      { name: 'assigned_to', type: 'uuid', nullable: true, primaryKey: false, foreignKey: { table: 'users', column: 'id' }, description: 'Assigned user' },
      { name: 'status', type: 'text', nullable: false, primaryKey: false, description: 'Task status (todo, in_progress, done)' },
      { name: 'priority', type: 'text', nullable: false, primaryKey: false, description: 'Task priority (low, medium, high, urgent)' },
      { name: 'due_date', type: 'date', nullable: true, primaryKey: false, description: 'Task due date' },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Task creation timestamp' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Last task update' },
    ],
    relationships: [
      { type: 'many-to-one', table: 'projects', column: 'project_id' },
      { type: 'many-to-one', table: 'users', column: 'assigned_to' }
    ]
  },
  {
    name: 'customers',
    schema: 'public',
    rowCount: 324,
    description: 'Customer information and contacts',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique customer identifier' },
      { name: 'name', type: 'text', nullable: false, primaryKey: false, description: 'Customer or company name' },
      { name: 'email', type: 'text', nullable: true, primaryKey: false, description: 'Primary contact email' },
      { name: 'phone', type: 'text', nullable: true, primaryKey: false, description: 'Primary contact phone' },
      { name: 'address', type: 'text', nullable: true, primaryKey: false, description: 'Customer address' },
      { name: 'industry', type: 'text', nullable: true, primaryKey: false, description: 'Customer industry' },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Customer record creation' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, primaryKey: false, description: 'Last customer update' },
    ]
  }
];

export default function SchemaViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('public');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const filteredTables = mockTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns.some(col => 
      col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const getTypeColor = (type: string): string => {
    if (type.includes('uuid') || type.includes('id')) return 'bg-blue-100 text-blue-800';
    if (type.includes('text') || type.includes('varchar')) return 'bg-green-100 text-green-800';
    if (type.includes('int') || type.includes('number')) return 'bg-orange-100 text-orange-800';
    if (type.includes('timestamp') || type.includes('date')) return 'bg-purple-100 text-purple-800';
    if (type.includes('bool')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables, columns, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800">
          <Database className="h-3 w-3" />
          {mockTables.length} tables
        </Badge>
      </div>

      {/* Schema Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema: {selectedSchema}
          </CardTitle>
          <CardDescription>
            Interactive database schema browser with table relationships and column details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tables">
            <TabsList>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tables
              </TabsTrigger>
              <TabsTrigger value="relationships" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Relationships
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredTables.map((table) => {
                    const isExpanded = expandedTables.has(table.name);
                    const columns = table.columns;
                    
                    return (
                      <Card key={table.name}>
                        <Collapsible>
                          <CollapsibleTrigger 
                            className="w-full"
                            onClick={() => toggleTableExpansion(table.name)}
                          >
                            <CardHeader className="hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <div className="text-left">
                                    <CardTitle className="text-base font-mono">
                                      {table.schema}.{table.name}
                                    </CardTitle>
                                    <CardDescription>
                                      {table.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-purple-100 text-purple-800">{columns.length} columns</Badge>
                                  {table.rowCount !== undefined && (
                                    <Badge>{table.rowCount.toLocaleString()} rows</Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="text-sm font-semibold text-muted-foreground mb-2">
                                  Columns
                                </div>
                                {columns.map((column) => (
                                  <div key={column.name} className="border rounded-lg p-3 bg-muted/20">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono font-semibold">
                                          {column.name}
                                        </code>
                                        {column.primaryKey && (
                                          <Badge className="text-xs bg-red-100 text-red-800">
                                            <Key className="h-3 w-3 mr-1" />
                                            PK
                                          </Badge>
                                        )}
                                        {column.foreignKey && (
                                          <Badge className="text-xs bg-blue-100 text-blue-800">
                                            <Link className="h-3 w-3 mr-1" />
                                            FK
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          className={getTypeColor(column.type)}
                                        >
                                          {column.type}
                                        </Badge>
                                        {!column.nullable && (
                                          <Badge className="text-xs">
                                            NOT NULL
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {column.description && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {column.description}
                                      </p>
                                    )}
                                    
                                    {column.foreignKey && (
                                      <div className="text-xs text-muted-foreground">
                                        References: <code>{column.foreignKey.table}.{column.foreignKey.column}</code>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="relationships" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredTables.filter(table => table.relationships?.length).map((table) => (
                    <Card key={table.name}>
                      <CardHeader>
                        <CardTitle className="text-base font-mono">
                          {table.schema}.{table.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {table.relationships?.map((rel, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 border rounded">
                              <Badge className="bg-green-100 text-green-800">{rel.type}</Badge>
                              <code className="text-sm">{rel.table}.{rel.column}</code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Schema Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Table className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{mockTables.length}</div>
            <div className="text-sm text-muted-foreground">Tables</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Key className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {mockTables.reduce((sum, table) => sum + table.columns.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Columns</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Link className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {mockTables.reduce((sum, table) => sum + (table.relationships?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Relationships</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {mockTables.reduce((sum, table) => sum + (table.rowCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Rows</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}