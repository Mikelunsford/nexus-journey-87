import React from 'react';
import { LabelsTable } from '@/components/ui/LabelsTable';
import { Label } from '@/lib/types';

export default function OrgLabelsPage() {
  // Sample labels data - in real app this would come from state/API
  const labels: Label[] = [
    { id: '6', scope: 'org', name: 'Premium Tier', color: '#E02525', slug: 'premium-tier', createdAt: '2024-01-01' },
    { id: '7', scope: 'org', name: 'Partner', color: '#16A34A', slug: 'partner', createdAt: '2024-01-01' },
  ];

  const handleAddLabel = () => {
    // TODO: Implement add label functionality
    console.log('Add org label');
  };

  const handleEditLabel = (label: Label) => {
    // TODO: Implement edit label functionality
    console.log('Edit org label:', label);
  };

  const handleDeleteLabel = (labelId: string) => {
    // TODO: Implement delete label functionality
    console.log('Delete org label:', labelId);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organization Labels</h1>
        <p className="text-muted-foreground mt-2">
          Manage labels for organizing and categorizing organizations.
        </p>
      </div>

      <LabelsTable
        scope="org"
        labels={labels}
        onAdd={handleAddLabel}
        onEdit={handleEditLabel}
        onDelete={handleDeleteLabel}
      />
    </div>
  );
}