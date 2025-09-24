import React from 'react';
import { FileText, Upload, Download, Eye, FolderPlus, Search, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function DocumentsPage() {
  const [enableTestSeeds] = useFeatureFlag('ui.enable_test_seeds');
  const { documents, loading, error } = useDocuments(enableTestSeeds);
  
  const quickActions: QAItem[] = [
    {
      label: 'Upload Document',
      to: '/dashboard/documents/upload',
      caption: 'Add new documents',
      icon: <Upload className="w-5 h-5" />,
    },
    {
      label: 'Create Folder',
      to: '/dashboard/documents/folders/new',
      caption: 'Organize documents',
      icon: <FolderPlus className="w-5 h-5" />,
    },
    {
      label: 'Document Search',
      to: '/dashboard/documents/search',
      caption: 'Find documents quickly',
      icon: <Search className="w-5 h-5" />,
    },
    {
      label: 'Archive Files',
      to: '/dashboard/documents/archive',
      caption: 'Manage archived files',
      icon: <Archive className="w-5 h-5" />,
    },
  ];

  // Calculate real document statistics
  const totalDocuments = documents.length;
  const folders = [...new Set(documents.map(doc => doc.entity_type))].length;
  const storageUsed = documents.reduce((total, doc) => total + (doc.size_bytes || 0), 0);
  const sharedFiles = documents.filter(doc => doc.entity_type === 'shared' || doc.tags?.includes('shared')).length;

  // Format bytes to readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusVariant = (document: any): "default" | "secondary" | "destructive" | "outline" => {
    if (document.deleted_at) return 'secondary';
    return 'default';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'contract': 'text-blue-600',
      'invoice': 'text-green-600', 
      'report': 'text-purple-600',
      'image': 'text-orange-600',
      'document': 'text-gray-600',
      'project': 'text-indigo-600',
      'customer': 'text-pink-600'
    };
    return colors[category.toLowerCase()] || 'text-gray-600';
  };

  const getStatusBadge = (document: any) => {
    if (document.deleted_at) return 'Archived';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold t-primary">Documents</h1>
          <p className="t-dim mt-2">Loading documents...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold t-primary">Documents</h1>
          <p className="t-dim mt-2">Error loading documents</p>
        </div>
        <EmptyState
          title="Failed to load documents"
          description={error}
          icon={<FileText className="w-8 h-8" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">Documents</h1>
        <p className="t-dim mt-2">
          Store, organize, and manage your business documents with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Document Storage KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi">
          <div className="kpi-icon">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="kpi-value">{totalDocuments.toLocaleString()}</div>
            <div className="kpi-label">Total Documents</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="kpi-value">{folders}</div>
            <div className="kpi-label">Folders</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="kpi-value">{formatBytes(storageUsed)}</div>
            <div className="kpi-label">Storage Used</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="kpi-value">{sharedFiles}</div>
            <div className="kpi-label">Shared Files</div>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      {documents.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Get started by uploading your first document"
          icon={<FileText className="w-8 h-8" />}
          action={{
            label: 'Upload Document',
            onClick: () => window.location.href = '/dashboard/documents/upload',
            variant: 'primary'
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.slice(0, 10).map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getCategoryColor(document.entity_type || 'document')}>
                        {document.entity_type || 'Document'}
                      </span>
                    </TableCell>
                    <TableCell>{formatBytes(document.size_bytes || 0)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(document.updated_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(document)}>
                        {getStatusBadge(document)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}