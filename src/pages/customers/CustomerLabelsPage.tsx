import React from 'react';
import { LabelsTable } from '@/components/ui/LabelsTable';
import { Label } from '@/lib/types';

export default function CustomerLabelsPage() {
  // Sample labels data - in real app this would come from state/API
  const labels: Label[] = [
    { id: '1', scope: 'customer', name: 'VIP', color: '#E02525', slug: 'vip', createdAt: '2024-01-01' },
    { id: '2', scope: 'customer', name: 'New Customer', color: '#2B8AF7', slug: 'new-customer', createdAt: '2024-01-01' },
    { id: '3', scope: 'customer', name: 'Large Volume', color: '#16A34A', slug: 'large-volume', createdAt: '2024-01-01' },
  ];

  const handleAddLabel = () => {
    // TODO: Implement add label functionality
    console.log('Add label');
  };

  const handleEditLabel = (label: Label) => {
    // TODO: Implement edit label functionality
    console.log('Edit label:', label);
  };

  const handleDeleteLabel = (labelId: string) => {
    // TODO: Implement delete label functionality
    console.log('Delete label:', labelId);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customer Labels</h1>
        <p className="text-muted-foreground mt-2">
          Manage labels for organizing and categorizing customers.
        </p>
      </div>

      <LabelsTable
        scope="customer"
        labels={labels}
        onAdd={handleAddLabel}
        onEdit={handleEditLabel}
        onDelete={handleDeleteLabel}
      />
    </div>
  );
}