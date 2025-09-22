import React from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

export interface Column {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

interface ColumnSelectorProps {
  columns: Column[];
  onColumnToggle: (key: string, visible: boolean) => void;
  onResetColumns: () => void;
}

export function ColumnSelector({
  columns,
  onColumnToggle,
  onResetColumns
}: ColumnSelectorProps) {
  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Columns</span>
          <span className="text-xs t-dim">({visibleCount}/{totalCount})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            className="flex items-center gap-3 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              if (!column.required) {
                onColumnToggle(column.key, !column.visible);
              }
            }}
          >
            <Checkbox
              checked={column.visible}
              disabled={column.required}
              onCheckedChange={(checked) => onColumnToggle(column.key, checked as boolean)}
            />
            <div className="flex items-center gap-2 flex-1">
              {column.visible ? (
                <Eye className="w-4 h-4 t-dim" />
              ) : (
                <EyeOff className="w-4 h-4 t-dim" />
              )}
              <span className={column.required ? 't-dim' : ''}>{column.label}</span>
              {column.required && (
                <span className="text-xs t-dim">(required)</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onResetColumns}>
          Reset to Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}