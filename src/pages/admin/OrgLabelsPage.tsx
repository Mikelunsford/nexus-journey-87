import React, { useState } from 'react';
import { LabelsTable } from '@/components/ui/LabelsTable';
import { LabelForm } from '@/components/ui/LabelForm';
import { useLabels } from '@/hooks/useLabels';
import { Label } from '@/lib/types';

export default function OrgLabelsPage() {
  const { labels, loading, error, createLabel, updateLabel, deleteLabel } = useLabels('org');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const handleAddLabel = () => {
    setEditingLabel(null);
    setFormOpen(true);
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabel(label);
    setFormOpen(true);
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      await deleteLabel(labelId);
    }
  };

  const handleFormSubmit = async (data: Omit<Label, 'id' | 'createdAt'>) => {
    if (editingLabel) {
      await updateLabel(editingLabel.id, data);
    } else {
      await createLabel(data);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organization Labels</h1>
          <p className="text-muted-foreground mt-2">
            Manage labels for organizing and categorizing organizations.
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organization Labels</h1>
          <p className="text-muted-foreground mt-2">
            Manage labels for organizing and categorizing organizations.
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

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

      <LabelForm
        open={formOpen}
        onOpenChange={setFormOpen}
        label={editingLabel}
        scope="org"
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}