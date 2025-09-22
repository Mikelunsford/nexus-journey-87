import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Table, Key, Link, Database } from 'lucide-react';

interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    foreignKey?: {
      table: string;
      column: string;
    };
    defaultValue?: string;
  }>;
  indexes: Array<{
    name: string;
    columns: string[];
    unique: boolean;
  }>;
  relationships: Array<{
    type: 'one-to-many' | 'many-to-one' | 'many-to-many';
    table: string;
    foreignKey: string;
  }>;
}

// Mock schema data - in real implementation this would come from Supabase
const mockSchema: TableSchema[] = [
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'email', type: 'text', nullable: false, primaryKey: false },
      { name: 'first_name', type: 'text', nullable: true, primaryKey: false },
      { name: 'last_name', type: 'text', nullable: true, primaryKey: false },
      { name: 'role', type: 'text', nullable: false, primaryKey: false, defaultValue: 'employee' },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    indexes: [
      { name: 'users_email_key', columns: ['email'], unique: true },
      { name: 'users_role_idx', columns: ['role'], unique: false }
    ],
    relationships: [
      { type: 'one-to-many', table: 'projects', foreignKey: 'created_by' },
      { type: 'one-to-many', table: 'user_roles', foreignKey: 'user_id' }
    ]
  },
  {
    name: 'customers',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'name', type: 'text', nullable: false, primaryKey: false },
      { name: 'email', type: 'text', nullable: false, primaryKey: false },
      { name: 'type', type: 'text', nullable: false, primaryKey: false },
      { name: 'phone', type: 'text', nullable: true, primaryKey: false },
      { name: 'address', type: 'text', nullable: true, primaryKey: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    indexes: [
      { name: 'customers_email_key', columns: ['email'], unique: true },
      { name: 'customers_name_idx', columns: ['name'], unique: false }
    ],
    relationships: [
      { type: 'one-to-many', table: 'projects', foreignKey: 'customer_id' }
    ]
  },
  {
    name: 'projects',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'customer_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'customers', column: 'id' } },
      { name: 'title', type: 'text', nullable: false, primaryKey: false },
      { name: 'description', type: 'text', nullable: true, primaryKey: false },
      { name: 'status', type: 'text', nullable: false, primaryKey: false, defaultValue: 'planning' },
      { name: 'created_by', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'users', column: 'id' } },
      { name: 'created_at', type: 'timestamptz', nullable: false, primaryKey: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    indexes: [
      { name: 'projects_customer_id_idx', columns: ['customer_id'], unique: false },
      { name: 'projects_status_idx', columns: ['status'], unique: false },
      { name: 'projects_created_by_idx', columns: ['created_by'], unique: false }
    ],
    relationships: [
      { type: 'many-to-one', table: 'customers', foreignKey: 'customer_id' },
      { type: 'many-to-one', table: 'users', foreignKey: 'created_by' }
    ]
  }
];

export default function SchemaViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);

  const filteredTables = mockSchema.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns.some(col => col.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeColor = (type: string) => {
    if (type.includes('uuid')) return 'bg-purple-100 text-purple-800';
    if (type.includes('text') || type.includes('varchar')) return 'bg-blue-100 text-blue-800';
    if (type.includes('int') || type.includes('numeric')) return 'bg-green-100 text-green-800';
    if (type.includes('timestamp') || type.includes('date')) return 'bg-orange-100 text-orange-800';
    if (type.includes('boolean')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables and columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          {filteredTables.length} tables
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Database Tables</CardTitle>
            <CardDescription>
              Click on a table to view its detailed structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredTables.map((table) => (
                  <Card
                    key={table.name}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTable?.name === table.name ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          <span className="font-medium">{table.name}</span>
                        </div>
                        <Badge variant="secondary">
                          {table.columns.length} cols
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {table.relationships.length} relationships
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Table Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedTable ? selectedTable.name : 'Select a Table'}
            </CardTitle>
            <CardDescription>
              {selectedTable ? 'Detailed table structure and relationships' : 'Choose a table from the list to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTable ? (
              <Tabs defaultValue="columns">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="indexes">Indexes</TabsTrigger>
                  <TabsTrigger value="relationships">Relations</TabsTrigger>
                </TabsList>

                <TabsContent value="columns" className="mt-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {selectedTable.columns.map((column) => (
                        <div key={column.name} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{column.name}</span>
                              {column.primaryKey && (
                                <Key className="h-3 w-3 text-yellow-600" />
                              )}
                              {column.foreignKey && (
                                <Link className="h-3 w-3 text-blue-600" />
                              )}
                            </div>
                            <Badge className={getTypeColor(column.type)}>
                              {column.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Nullable: {column.nullable ? 'Yes' : 'No'}</div>
                            {column.defaultValue && (
                              <div>Default: {column.defaultValue}</div>
                            )}
                            {column.foreignKey && (
                              <div>
                                References: {column.foreignKey.table}.{column.foreignKey.column}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="indexes" className="mt-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {selectedTable.indexes.map((index) => (
                        <div key={index.name} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{index.name}</span>
                            {index.unique && (
                              <Badge variant="secondary">Unique</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Columns: {index.columns.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="relationships" className="mt-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {selectedTable.relationships.map((rel, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rel.table}</span>
                            <Badge variant="outline">{rel.type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Foreign Key: {rel.foreignKey}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a table to view its structure</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}