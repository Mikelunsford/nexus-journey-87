import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters: FilterOption[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className
}: FilterBarProps) {
  const hasActiveFilters = Object.values(activeFilters).some(values => values.length > 0);
  const activeFilterCount = Object.values(activeFilters).reduce((sum, values) => sum + values.length, 0);

  const handleFilterSelect = (filterKey: string, value: string) => {
    const currentValues = activeFilters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange(filterKey, newValues);
  };

  const removeFilter = (filterKey: string, value: string) => {
    const currentValues = activeFilters[filterKey] || [];
    const newValues = currentValues.filter(v => v !== value);
    onFilterChange(filterKey, newValues);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 t-dim" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value=""
              onValueChange={(value) => handleFilterSelect(filter.key, value)}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>{filter.label}</span>
                  {(activeFilters[filter.key]?.length || 0) > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {activeFilters[filter.key].length}
                    </Badge>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs t-dim ml-2">({option.count})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterKey, values]) =>
            values.map((value) => {
              const filter = filters.find(f => f.key === filterKey);
              const option = filter?.options.find(o => o.value === value);
              
              return (
                <Badge
                  key={`${filterKey}-${value}`}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="text-xs t-dim">{filter?.label}:</span>
                  <span>{option?.label || value}</span>
                  <button
                    onClick={() => removeFilter(filterKey, value)}
                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}