import { format } from 'date-fns';

export interface CSVColumn {
  key: string;
  label: string;
  formatter?: (value: any, row: any) => string;
  width?: number;
}

export interface CSVExportOptions {
  filename: string;
  columns: CSVColumn[];
  data: any[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  includeMetadata?: boolean;
}

export interface CSVMetadata {
  generatedAt: string;
  totalRows: number;
  dateRange?: string;
  appliedFilters?: string;
  version: string;
}

export class CSVExporter {
  private static readonly DELIMITER = ',';
  private static readonly LINE_BREAK = '\r\n';
  private static readonly QUOTE = '"';

  static escapeCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    
    let stringValue = String(value);
    
    // Check if value needs to be quoted
    const needsQuoting = stringValue.includes(this.DELIMITER) || 
                        stringValue.includes(this.LINE_BREAK) || 
                        stringValue.includes(this.QUOTE);
    
    if (needsQuoting) {
      // Escape existing quotes by doubling them
      stringValue = stringValue.replace(/"/g, '""');
      return `${this.QUOTE}${stringValue}${this.QUOTE}`;
    }
    
    return stringValue;
  }

  static formatValue(value: any, formatter?: (value: any, row: any) => string, row?: any): string {
    if (formatter && row) {
      return formatter(value, row);
    }
    
    // Default formatters for common types
    if (value instanceof Date) {
      return format(value, 'yyyy-MM-dd HH:mm:ss');
    }
    
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (Array.isArray(value)) {
      return value.join('; ');
    }
    
    return String(value || '');
  }

  static generateCSV(options: CSVExportOptions): string {
    const { columns, data, includeMetadata = true } = options;
    
    let csvContent = '';
    
    // Add metadata header if requested
    if (includeMetadata) {
      const metadata = this.generateMetadata(options);
      csvContent += this.generateMetadataHeader(metadata);
      csvContent += this.LINE_BREAK;
    }
    
    // Add column headers
    const headers = columns.map(col => this.escapeCSVValue(col.label));
    csvContent += headers.join(this.DELIMITER) + this.LINE_BREAK;
    
    // Add data rows
    data.forEach(row => {
      const values = columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        const formattedValue = this.formatValue(value, col.formatter, row);
        return this.escapeCSVValue(formattedValue);
      });
      
      csvContent += values.join(this.DELIMITER) + this.LINE_BREAK;
    });
    
    return csvContent;
  }

  static downloadCSV(options: CSVExportOptions): void {
    const csvContent = this.generateCSV(options);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', this.sanitizeFilename(options.filename));
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL object
    URL.revokeObjectURL(url);
  }

  static async exportToServer(options: CSVExportOptions, endpoint: string): Promise<Response> {
    const csvContent = this.generateCSV(options);
    
    const formData = new FormData();
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), options.filename);
    formData.append('metadata', JSON.stringify(this.generateMetadata(options)));
    
    return fetch(endpoint, {
      method: 'POST',
      body: formData
    });
  }

  private static generateMetadata(options: CSVExportOptions): CSVMetadata {
    const metadata: CSVMetadata = {
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      totalRows: options.data.length,
      version: '1.0'
    };
    
    if (options.dateRange) {
      metadata.dateRange = `${format(options.dateRange.start, 'yyyy-MM-dd')} to ${format(options.dateRange.end, 'yyyy-MM-dd')}`;
    }
    
    if (options.filters && Object.keys(options.filters).length > 0) {
      const filterStrings = Object.entries(options.filters)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${key}: ${value}`);
      
      if (filterStrings.length > 0) {
        metadata.appliedFilters = filterStrings.join(', ');
      }
    }
    
    return metadata;
  }

  private static generateMetadataHeader(metadata: CSVMetadata): string {
    let header = '';
    header += `# Generated: ${metadata.generatedAt}${this.LINE_BREAK}`;
    header += `# Total Rows: ${metadata.totalRows}${this.LINE_BREAK}`;
    
    if (metadata.dateRange) {
      header += `# Date Range: ${metadata.dateRange}${this.LINE_BREAK}`;
    }
    
    if (metadata.appliedFilters) {
      header += `# Filters: ${metadata.appliedFilters}${this.LINE_BREAK}`;
    }
    
    header += `# Version: ${metadata.version}${this.LINE_BREAK}`;
    
    return header;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private static sanitizeFilename(filename: string): string {
    // Remove or replace invalid filename characters
    let sanitized = filename.replace(/[<>:"/\\|?*]/g, '_');
    
    // Add .csv extension if not present
    if (!sanitized.toLowerCase().endsWith('.csv')) {
      sanitized += '.csv';
    }
    
    // Add timestamp to make filename unique
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    const nameWithoutExt = sanitized.replace(/\.csv$/i, '');
    
    return `${nameWithoutExt}_${timestamp}.csv`;
  }

  // Predefined column formatters for common data types
  static readonly FORMATTERS = {
    currency: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00',
    percentage: (value: number) => value ? `${value.toFixed(1)}%` : '0.0%',
    date: (value: Date) => value ? format(value, 'yyyy-MM-dd') : '',
    dateTime: (value: Date) => value ? format(value, 'yyyy-MM-dd HH:mm') : '',
    boolean: (value: boolean) => value ? 'Yes' : 'No',
    status: (value: string) => value ? value.toUpperCase() : '',
    phone: (value: string) => value ? value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '',
    email: (value: string) => value || '',
    integer: (value: number) => value ? value.toString() : '0',
    decimal: (value: number, precision: number = 2) => value ? value.toFixed(precision) : '0',
    list: (value: any[]) => Array.isArray(value) ? value.join('; ') : ''
  };
}