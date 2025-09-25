import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './table';
import { cn } from '@/lib/utils';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render: (item: T) => React.ReactNode;
    width?: number;
  }[];
  height?: number;
  className?: string;
  fallbackComponent?: React.ComponentType<{ data: T[]; columns: any[] }>;
}

export function VirtualizedTable<T>({
  data,
  columns,
  height = 400,
  className,
  fallbackComponent: FallbackComponent
}: VirtualizedTableProps<T>) {
  const [virtualizationEnabled] = useFeatureFlag('performance.virtualization');
  
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });

  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + (col.width || 150), 0),
    [columns]
  );

  // If virtualization is disabled or data is small, use fallback component
  if (!virtualizationEnabled || data.length < 50) {
    if (FallbackComponent) {
      return <FallbackComponent data={data} columns={columns} />;
    }
    
    // Default fallback - regular table
    return (
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2">
                    {column.render(item)}
                  </td>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} style={{ width: column.width }}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height, width: totalWidth }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = data[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <TableRow className="flex">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-2 flex-1"
                      style={{ width: column.width }}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </TableRow>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

