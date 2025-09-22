import React, { useState } from 'react';
import { Calendar, Download, FileText, Filter, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { ReportExporter, REPORT_CONFIGS, ExportRequest } from '@/lib/export/reportExporter';
import { format, subDays } from 'date-fns';

interface ExportDialogProps {
  trigger?: React.ReactNode;
  reportType: string;
  data: any[];
  currentFilters?: Record<string, any>;
  onExport?: (request: ExportRequest) => void;
}

const DATE_PRESETS = [
  { label: 'Last 7 days', value: '7d', getDates: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 days', value: '30d', getDates: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 90 days', value: '90d', getDates: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: 'This month', value: 'month', getDates: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date() };
  }},
  { label: 'This year', value: 'year', getDates: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date() };
  }}
];

export function ExportDialog({ 
  trigger, 
  reportType, 
  data, 
  currentFilters = {}, 
  onExport 
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [selectedPreset, setSelectedPreset] = useState('30d');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const config = REPORT_CONFIGS[reportType];
  const preset = DATE_PRESETS.find(p => p.value === selectedPreset);
  const dateRange = preset?.getDates() || { start: subDays(new Date(), 30), end: new Date() };

  // Initialize selected columns with all default columns
  React.useEffect(() => {
    if (config && selectedColumns.length === 0) {
      setSelectedColumns(config.defaultColumns.map(col => col.key));
    }
  }, [config, selectedColumns.length]);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleExport = async () => {
    if (!config) return;

    setIsExporting(true);
    
    try {
      const request: ExportRequest = {
        reportType,
        dateRange,
        filters: includeFilters ? currentFilters : {},
        columns: selectedColumns,
        format: selectedFormat
      };

      if (onExport) {
        onExport(request);
      } else {
        await ReportExporter.exportReport(reportType, data, request);
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredData = data.slice(0, 100); // Preview first 100 rows
  const activeFilterCount = Object.values(currentFilters).filter(v => v !== null && v !== undefined && v !== '').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export {config?.title || 'Report'}
          </DialogTitle>
          <DialogDescription>
            {config?.description || 'Export your data in various formats with customizable options.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
            <Select value={selectedFormat} onValueChange={(value: 'csv' | 'json' | 'excel') => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                <SelectItem value="excel">Excel Workbook (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map(preset => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
            </p>
          </div>

          {/* Filters */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Current Filters
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-filters"
                    checked={includeFilters}
                    onCheckedChange={(checked) => setIncludeFilters(checked === true)}
                  />
                  <Label htmlFor="include-filters" className="text-sm">Include in export</Label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentFilters)
                  .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                  .map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Column Selection */}
          {config && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Columns to Export
              </Label>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Available Columns</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedColumns(config.defaultColumns.map(col => col.key))}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedColumns([])}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {selectedColumns.length} of {config.defaultColumns.length} columns selected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {config.defaultColumns.map((column) => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.key}
                          checked={selectedColumns.includes(column.key)}
                          onCheckedChange={() => handleColumnToggle(column.key)}
                        />
                        <Label htmlFor={column.key} className="text-sm font-normal cursor-pointer">
                          {column.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Preview</Label>
            <Card>
              <CardContent className="p-3">
                <div className="text-sm text-muted-foreground">
                  <p>{data.length} total records</p>
                  <p>Showing first {Math.min(100, data.length)} rows in preview</p>
                  {selectedColumns.length > 0 && (
                    <p>{selectedColumns.length} columns will be exported</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Export Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || selectedColumns.length === 0}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}