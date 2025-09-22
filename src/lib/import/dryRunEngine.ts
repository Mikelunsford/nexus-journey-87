import { ParsedCSVRow } from './csvParser';

export interface DryRunChange {
  operation: 'create' | 'update' | 'delete' | 'skip';
  entityType: string;
  entityId?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  reason?: string;
}

export interface DryRunResult {
  changes: DryRunChange[];
  summary: {
    creates: number;
    updates: number;
    deletes: number;
    skips: number;
    errors: number;
  };
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, any>;
  }>;
  warnings: Array<{
    row: number;
    warning: string;
    data: Record<string, any>;
  }>;
}

export interface ImportOptions {
  updateExisting: boolean;
  skipDuplicates: boolean;
  deleteMode: boolean;
  batchSize: number;
}

export class DryRunEngine {
  private existingData: Map<string, Map<string, Record<string, any>>> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock existing users
    const users = new Map();
    users.set('john.doe@example.com', {
      id: 'user-1',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'employee',
      status: 'active'
    });
    users.set('jane.smith@example.com', {
      id: 'user-2', 
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'manager',
      status: 'active'
    });
    this.existingData.set('users', users);

    // Mock existing customers
    const customers = new Map();
    customers.set('ACME Corp', {
      id: 'cust-1',
      name: 'ACME Corp',
      email: 'contact@acme.com',
      type: 'business'
    });
    this.existingData.set('customers', customers);

    // Mock existing projects
    const projects = new Map();
    projects.set('Project Alpha', {
      id: 'proj-1',
      title: 'Project Alpha',
      customer_id: 'cust-1',
      status: 'active'
    });
    this.existingData.set('projects', projects);
  }

  performDryRun(
    entityType: string,
    rows: ParsedCSVRow[],
    options: ImportOptions
  ): DryRunResult {
    const changes: DryRunChange[] = [];
    const errors: DryRunResult['errors'] = [];
    const warnings: DryRunResult['warnings'] = [];
    
    const summary = {
      creates: 0,
      updates: 0,
      deletes: 0,
      skips: 0,
      errors: 0
    };

    const existingEntities = this.existingData.get(entityType) || new Map();

    for (const row of rows) {
      if (row.errors.length > 0) {
        errors.push({
          row: row.lineNumber,
          error: row.errors.join('; '),
          data: row.data
        });
        summary.errors++;
        continue;
      }

      try {
        const change = this.planRowOperation(entityType, row.data, existingEntities, options);
        changes.push(change);
        
        switch (change.operation) {
          case 'create':
            summary.creates++;
            break;
          case 'update':
            summary.updates++;
            break;
          case 'delete':
            summary.deletes++;
            break;
          case 'skip':
            summary.skips++;
            break;
        }

        if (change.reason) {
          warnings.push({
            row: row.lineNumber,
            warning: change.reason,
            data: row.data
          });
        }
      } catch (error) {
        errors.push({
          row: row.lineNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row.data
        });
        summary.errors++;
      }
    }

    return {
      changes,
      summary,
      errors,
      warnings
    };
  }

  private planRowOperation(
    entityType: string,
    data: Record<string, any>,
    existingEntities: Map<string, Record<string, any>>,
    options: ImportOptions
  ): DryRunChange {
    const lookupKey = this.getLookupKey(entityType, data);
    const existing = existingEntities.get(lookupKey);

    // Handle delete mode
    if (options.deleteMode) {
      if (existing) {
        return {
          operation: 'delete',
          entityType,
          entityId: existing.id,
          before: existing,
          reason: 'Marked for deletion'
        };
      } else {
        return {
          operation: 'skip',
          entityType,
          reason: 'Entity not found for deletion'
        };
      }
    }

    // Handle create/update logic
    if (existing) {
      if (options.skipDuplicates) {
        return {
          operation: 'skip',
          entityType,
          entityId: existing.id,
          reason: 'Skipped duplicate'
        };
      }
      
      if (options.updateExisting) {
        const hasChanges = this.detectChanges(existing, data);
        if (hasChanges) {
          return {
            operation: 'update',
            entityType,
            entityId: existing.id,
            before: existing,
            after: { ...existing, ...data },
            reason: 'Data differs from existing record'
          };
        } else {
          return {
            operation: 'skip',
            entityType,
            entityId: existing.id,
            reason: 'No changes detected'
          };
        }
      } else {
        return {
          operation: 'skip',
          entityType,
          reason: 'Duplicate found but updates disabled'
        };
      }
    } else {
      return {
        operation: 'create',
        entityType,
        after: { ...data, id: this.generateId() }
      };
    }
  }

  private getLookupKey(entityType: string, data: Record<string, any>): string {
    // Define how to identify existing records for each entity type
    switch (entityType) {
      case 'users':
        return data.email;
      case 'customers':
        return data.name || data.email;
      case 'projects':
        return data.title;
      default:
        return data.name || data.title || data.id || JSON.stringify(data);
    }
  }

  private detectChanges(existing: Record<string, any>, incoming: Record<string, any>): boolean {
    for (const key in incoming) {
      if (existing[key] !== incoming[key]) {
        return true;
      }
    }
    return false;
  }

  private generateId(): string {
    return `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simulate execution time and potential issues
  estimateExecutionTime(changes: DryRunChange[]): {
    estimatedSeconds: number;
    batchCount: number;
    potentialIssues: string[];
  } {
    const batchSize = 100;
    const batchCount = Math.ceil(changes.length / batchSize);
    const estimatedSeconds = Math.max(1, Math.ceil(changes.length / 50)); // ~50 operations per second
    
    const potentialIssues: string[] = [];
    
    if (changes.length > 1000) {
      potentialIssues.push('Large import may take several minutes');
    }
    
    const updateCount = changes.filter(c => c.operation === 'update').length;
    if (updateCount > changes.length * 0.8) {
      potentialIssues.push('High update ratio may slow down import');
    }
    
    const deleteCount = changes.filter(c => c.operation === 'delete').length;
    if (deleteCount > 0) {
      potentialIssues.push('Delete operations cannot be easily undone');
    }

    return {
      estimatedSeconds,
      batchCount,
      potentialIssues
    };
  }

  generateDiff(before: Record<string, any>, after: Record<string, any>): Array<{
    field: string;
    oldValue: any;
    newValue: any;
    type: 'added' | 'modified' | 'removed';
  }> {
    const diff: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      type: 'added' | 'modified' | 'removed';
    }> = [];

    // Check for modified and removed fields
    for (const key in before) {
      if (!(key in after)) {
        diff.push({
          field: key,
          oldValue: before[key],
          newValue: undefined,
          type: 'removed'
        });
      } else if (before[key] !== after[key]) {
        diff.push({
          field: key,
          oldValue: before[key],
          newValue: after[key],
          type: 'modified'
        });
      }
    }

    // Check for added fields
    for (const key in after) {
      if (!(key in before)) {
        diff.push({
          field: key,
          oldValue: undefined,
          newValue: after[key],
          type: 'added'
        });
      }
    }

    return diff;
  }
}

export const dryRunEngine = new DryRunEngine();