import React from 'react';
import { LabelsTable } from '@/components/ui/LabelsTable';
import { Label } from '@/lib/types';

export default function UserLabelsPage() {
  // Sample labels data - in real app this would come from state/API
  const labels: Label[] = [
    { id: '4', scope: 'user', name: 'Team Lead', color: '#F59E0B', slug: 'team-lead', createdAt: '2024-01-01' },
    { id: '5', scope: 'user', name: 'Contractor', color: '#6B7280', slug: 'contractor', createdAt: '2024-01-01' },
  ];

  const handleAddLabel = () => {
    // TODO: Implement add label functionality
    console.log('Add user label');
  };

  const handleEditLabel = (label: Label) => {
    // TODO: Implement edit label functionality
    console.log('Edit user label:', label);
  };

  const handleDeleteLabel = (labelId: string) => {
    // TODO: Implement delete label functionality
    console.log('Delete user label:', labelId);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Labels</h1>
        <p className="text-muted-foreground mt-2">
          Manage labels for organizing and categorizing users.
        </p>
      </div>

      <LabelsTable
        scope="user"
        labels={labels}
        onAdd={handleAddLabel}
        onEdit={handleEditLabel}
        onDelete={handleDeleteLabel}
      />
    </div>
  );
}