export interface ParsedCSVRow {
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  lineNumber: number;
}

export interface CSVParseResult {
  headers: string[];
  rows: ParsedCSVRow[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  warnings: string[];
}

export interface FieldValidator {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'date' | 'boolean';
  format?: RegExp;
  min?: number;
  max?: number;
  enum?: string[];
  transform?: (value: string) => any;
}

export interface CSVSchema {
  name: string;
  requiredHeaders: string[];
  optionalHeaders?: string[];
  validators: FieldValidator[];
}

// Pre-defined schemas for common import types
export const CSV_SCHEMAS: Record<string, CSVSchema> = {
  users: {
    name: 'Users',
    requiredHeaders: ['email', 'first_name', 'last_name', 'role'],
    optionalHeaders: ['phone', 'department', 'team', 'status'],
    validators: [
      { field: 'email', required: true, type: 'email' },
      { field: 'first_name', required: true, type: 'string', min: 1, max: 50 },
      { field: 'last_name', required: true, type: 'string', min: 1, max: 50 },
      { field: 'role', required: true, enum: ['admin', 'manager', 'employee', 'client'] },
      { field: 'phone', type: 'string', format: /^[\+]?[1-9][\d]{0,15}$/ },
      { field: 'status', enum: ['active', 'inactive', 'pending'], transform: (v) => v || 'active' }
    ]
  },
  customers: {
    name: 'Customers',
    requiredHeaders: ['name', 'email', 'type'],
    optionalHeaders: ['phone', 'address', 'city', 'state', 'zip', 'contact_person'],
    validators: [
      { field: 'name', required: true, type: 'string', min: 1, max: 100 },
      { field: 'email', required: true, type: 'email' },
      { field: 'type', required: true, enum: ['individual', 'business', 'enterprise'] },
      { field: 'phone', type: 'string', format: /^[\+]?[1-9][\d]{0,15}$/ },
      { field: 'zip', type: 'string', format: /^\d{5}(-\d{4})?$/ }
    ]
  },
  projects: {
    name: 'Projects',
    requiredHeaders: ['title', 'customer_id', 'status'],
    optionalHeaders: ['description', 'start_date', 'due_date', 'priority', 'budget'],
    validators: [
      { field: 'title', required: true, type: 'string', min: 1, max: 200 },
      { field: 'customer_id', required: true, type: 'string' },
      { field: 'status', required: true, enum: ['planning', 'active', 'completed', 'cancelled'] },
      { field: 'start_date', type: 'date' },
      { field: 'due_date', type: 'date' },
      { field: 'priority', enum: ['low', 'medium', 'high', 'urgent'] },
      { field: 'budget', type: 'number', min: 0 }
    ]
  }
};

export class CSVParser {
  parseCSV(csvContent: string, schema: CSVSchema): CSVParseResult {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows: ParsedCSVRow[] = [];
    const warnings: string[] = [];

    // Validate headers
    this.validateHeaders(headers, schema, warnings);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();
      
      if (!line) continue; // Skip empty lines

      try {
        const values = this.parseCSVLine(line);
        const rowData = this.createRowObject(headers, values);
        const parsed = this.validateRow(rowData, schema, lineNumber);
        rows.push(parsed);
      } catch (error) {
        rows.push({
          data: {},
          errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: [],
          lineNumber
        });
      }
    }

    const validRows = rows.filter(row => row.errors.length === 0).length;
    
    return {
      headers,
      rows,
      totalRows: rows.length,
      validRows,
      errorRows: rows.length - validRows,
      warnings
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim());
    return result;
  }

  private createRowObject(headers: string[], values: string[]): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  }

  private validateHeaders(headers: string[], schema: CSVSchema, warnings: string[]) {
    // Check for required headers
    for (const required of schema.requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Required header '${required}' is missing`);
      }
    }

    // Check for unknown headers
    const allowedHeaders = [...schema.requiredHeaders, ...(schema.optionalHeaders || [])];
    const unknownHeaders = headers.filter(h => !allowedHeaders.includes(h));
    
    if (unknownHeaders.length > 0) {
      warnings.push(`Unknown headers will be ignored: ${unknownHeaders.join(', ')}`);
    }
  }

  private validateRow(data: Record<string, string>, schema: CSVSchema, lineNumber: number): ParsedCSVRow {
    const errors: string[] = [];
    const warnings: string[] = [];
    const processedData: Record<string, any> = {};

    for (const validator of schema.validators) {
      const value = data[validator.field];
      const result = this.validateField(value, validator);
      
      if (result.error) {
        errors.push(`${validator.field}: ${result.error}`);
      }
      
      if (result.warning) {
        warnings.push(`${validator.field}: ${result.warning}`);
      }
      
      if (result.value !== undefined) {
        processedData[validator.field] = result.value;
      }
    }

    return {
      data: processedData,
      errors,
      warnings,
      lineNumber
    };
  }

  private validateField(value: string, validator: FieldValidator): { 
    value?: any; 
    error?: string; 
    warning?: string; 
  } {
    const trimmed = value?.trim() || '';
    
    // Check required
    if (validator.required && !trimmed) {
      return { error: 'Required field is empty' };
    }

    if (!trimmed && !validator.required) {
      return { value: validator.transform ? validator.transform(trimmed) : null };
    }

    // Type validation
    switch (validator.type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          return { error: 'Invalid email format' };
        }
        break;
      
      case 'number':
        const num = parseFloat(trimmed);
        if (isNaN(num)) {
          return { error: 'Must be a valid number' };
        }
        if (validator.min !== undefined && num < validator.min) {
          return { error: `Must be at least ${validator.min}` };
        }
        if (validator.max !== undefined && num > validator.max) {
          return { error: `Must be at most ${validator.max}` };
        }
        return { value: num };
      
      case 'date':
        const date = new Date(trimmed);
        if (isNaN(date.getTime())) {
          return { error: 'Invalid date format' };
        }
        return { value: date.toISOString() };
      
      case 'boolean':
        const lower = trimmed.toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(lower)) {
          return { value: true };
        } else if (['false', '0', 'no', 'n'].includes(lower)) {
          return { value: false };
        } else {
          return { error: 'Must be true/false, yes/no, or 1/0' };
        }
    }

    // Format validation
    if (validator.format && !validator.format.test(trimmed)) {
      return { error: 'Invalid format' };
    }

    // Enum validation
    if (validator.enum && !validator.enum.includes(trimmed)) {
      return { error: `Must be one of: ${validator.enum.join(', ')}` };
    }

    // Length validation
    if (validator.min !== undefined && trimmed.length < validator.min) {
      return { error: `Must be at least ${validator.min} characters` };
    }
    if (validator.max !== undefined && trimmed.length > validator.max) {
      return { error: `Must be at most ${validator.max} characters` };
    }

    // Transform if needed
    const finalValue = validator.transform ? validator.transform(trimmed) : trimmed;
    return { value: finalValue };
  }

  generateTemplate(schemaName: string): string {
    const schema = CSV_SCHEMAS[schemaName];
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const allHeaders = [...schema.requiredHeaders, ...(schema.optionalHeaders || [])];
    return allHeaders.join(',');
  }

  getAvailableSchemas(): Array<{ key: string; name: string; description: string }> {
    return Object.entries(CSV_SCHEMAS).map(([key, schema]) => ({
      key,
      name: schema.name,
      description: `Required: ${schema.requiredHeaders.join(', ')}`
    }));
  }
}

export const csvParser = new CSVParser();