import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/lib/types';

interface LabelsTableProps {
  scope: 'customer' | 'user' | 'org';
  labels: Label[];
  onAdd?: () => void;
  onEdit?: (label: Label) => void;
  onDelete?: (labelId: string) => void;
}

export function LabelsTable({ scope, labels, onAdd, onEdit, onDelete }: LabelsTableProps) {
  const scopeLabels = labels.filter(label => label.scope === scope);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {scope === 'customer' ? 'Customer' : scope === 'user' ? 'User' : 'Organization'} Labels
        </CardTitle>
        <Button onClick={onAdd} size="sm">
          Add Label
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scopeLabels.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No labels found</p>
          ) : (
            scopeLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <div>
                    <span className="font-medium">{label.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({label.slug})
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(label)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(label.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}