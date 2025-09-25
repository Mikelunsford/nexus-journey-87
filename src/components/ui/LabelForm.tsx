import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label as LabelType } from '@/lib/types';

interface LabelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: LabelType | null;
  scope: 'customer' | 'user' | 'org';
  onSubmit: (data: Omit<LabelType, 'id' | 'createdAt'>) => Promise<void>;
}

const COLOR_OPTIONS = [
  { value: '#E02525', label: 'Red' },
  { value: '#2B8AF7', label: 'Blue' },
  { value: '#16A34A', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
  { value: '#F97316', label: 'Orange' },
  { value: '#6B7280', label: 'Gray' },
];

export function LabelForm({ open, onOpenChange, label, scope, onSubmit }: LabelFormProps) {
  const [formData, setFormData] = useState({
    name: label?.name || '',
    color: label?.color || '#E02525',
    slug: label?.slug || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        scope,
        name: formData.name.trim(),
        color: formData.color,
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      });
      onOpenChange(false);
      setFormData({ name: '', color: '#E02525', slug: '' });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {label ? 'Edit Label' : 'Add Label'}
          </DialogTitle>
          <DialogDescription>
            {label ? 'Update the label details below.' : 'Create a new label for organizing and categorizing.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter label name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="Enter label slug"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={formData.color} onValueChange={(color) => setFormData(prev => ({ ...prev, color }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (label ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

