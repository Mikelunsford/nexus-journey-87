export interface ImportTransaction {
  id: string;
  timestamp: string;
  entityType: string;
  userId: string;
  summary: {
    creates: number;
    updates: number;
    deletes: number;
    total: number;
  };
  operations: ImportOperation[];
  status: 'completed' | 'failed' | 'rolled_back';
  rollbackId?: string;
}

export interface ImportOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  timestamp: string;
}

export interface RollbackResult {
  success: boolean;
  rollbackId: string;
  operationsRolledBack: number;
  errors: string[];
  timestamp: string;
}

export class RollbackManager {
  private transactions: Map<string, ImportTransaction> = new Map();
  private maxTransactionHistory = 100; // Keep last 100 transactions

  recordTransaction(
    entityType: string,
    userId: string,
    operations: Omit<ImportOperation, 'id' | 'timestamp'>[]
  ): ImportTransaction {
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const fullOperations: ImportOperation[] = operations.map(op => ({
      ...op,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp
    }));

    const summary = {
      creates: fullOperations.filter(op => op.operation === 'create').length,
      updates: fullOperations.filter(op => op.operation === 'update').length,
      deletes: fullOperations.filter(op => op.operation === 'delete').length,
      total: fullOperations.length
    };

    const transaction: ImportTransaction = {
      id: transactionId,
      timestamp,
      entityType,
      userId,
      summary,
      operations: fullOperations,
      status: 'completed'
    };

    this.transactions.set(transactionId, transaction);
    this.cleanupOldTransactions();

    return transaction;
  }

  async rollback(transactionId: string, userId: string): Promise<RollbackResult> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        rollbackId: '',
        operationsRolledBack: 0,
        errors: ['Transaction not found'],
        timestamp: new Date().toISOString()
      };
    }

    if (transaction.status === 'rolled_back') {
      return {
        success: false,
        rollbackId: '',
        operationsRolledBack: 0,
        errors: ['Transaction has already been rolled back'],
        timestamp: new Date().toISOString()
      };
    }

    const rollbackId = `rb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const errors: string[] = [];
    let operationsRolledBack = 0;

    // Process operations in reverse order
    const reversedOps = [...transaction.operations].reverse();

    for (const operation of reversedOps) {
      try {
        await this.rollbackOperation(operation);
        operationsRolledBack++;
      } catch (error) {
        errors.push(`Failed to rollback ${operation.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update transaction status
    transaction.status = 'rolled_back';
    transaction.rollbackId = rollbackId;

    // Record the rollback as a new transaction
    const rollbackOperations = reversedOps.map(op => this.createReverseOperation(op));
    this.recordTransaction(`rollback_${transaction.entityType}`, userId, rollbackOperations);

    return {
      success: errors.length === 0,
      rollbackId,
      operationsRolledBack,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  private async rollbackOperation(operation: ImportOperation): Promise<void> {
    // This would integrate with the actual database/storage layer
    // For now, we'll simulate the rollback operations
    
    switch (operation.operation) {
      case 'create':
        // Delete the created entity
        await this.simulateDelete(operation.entityType, operation.entityId);
        break;
        
      case 'update':
        // Restore the previous data
        if (operation.beforeData) {
          await this.simulateUpdate(operation.entityType, operation.entityId, operation.beforeData);
        }
        break;
        
      case 'delete':
        // Recreate the deleted entity
        if (operation.beforeData) {
          await this.simulateCreate(operation.entityType, operation.beforeData);
        }
        break;
    }
  }

  private createReverseOperation(original: ImportOperation): Omit<ImportOperation, 'id' | 'timestamp'> {
    switch (original.operation) {
      case 'create':
        return {
          operation: 'delete',
          entityType: original.entityType,
          entityId: original.entityId,
          beforeData: original.afterData
        };
        
      case 'update':
        return {
          operation: 'update',
          entityType: original.entityType,
          entityId: original.entityId,
          beforeData: original.afterData,
          afterData: original.beforeData
        };
        
      case 'delete':
        return {
          operation: 'create',
          entityType: original.entityType,
          entityId: original.entityId,
          afterData: original.beforeData
        };
        
      default:
        throw new Error(`Unknown operation type: ${original.operation}`);
    }
  }

  // Simulation methods (in real implementation, these would interact with the database)
  private async simulateCreate(entityType: string, data: Record<string, any>): Promise<void> {
    console.log(`[ROLLBACK] Creating ${entityType}:`, data);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private async simulateUpdate(entityType: string, entityId: string, data: Record<string, any>): Promise<void> {
    console.log(`[ROLLBACK] Updating ${entityType} ${entityId}:`, data);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private async simulateDelete(entityType: string, entityId: string): Promise<void> {
    console.log(`[ROLLBACK] Deleting ${entityType} ${entityId}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  getTransaction(transactionId: string): ImportTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  getTransactionHistory(entityType?: string, limit = 50): ImportTransaction[] {
    const allTransactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (entityType) {
      return allTransactions
        .filter(tx => tx.entityType === entityType || tx.entityType.startsWith(`rollback_${entityType}`))
        .slice(0, limit);
    }

    return allTransactions.slice(0, limit);
  }

  canRollback(transactionId: string): { canRollback: boolean; reason?: string } {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return { canRollback: false, reason: 'Transaction not found' };
    }

    if (transaction.status === 'rolled_back') {
      return { canRollback: false, reason: 'Already rolled back' };
    }

    if (transaction.status === 'failed') {
      return { canRollback: false, reason: 'Cannot rollback failed transaction' };
    }

    // Check if transaction is too old (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (new Date(transaction.timestamp) < thirtyDaysAgo) {
      return { canRollback: false, reason: 'Transaction is too old to rollback (>30 days)' };
    }

    // Check if there are newer transactions that might conflict
    const newerTransactions = this.getTransactionHistory(transaction.entityType)
      .filter(tx => 
        new Date(tx.timestamp) > new Date(transaction.timestamp) && 
        tx.status === 'completed'
      );

    if (newerTransactions.length > 0) {
      return { 
        canRollback: false, 
        reason: `Newer imports exist for ${transaction.entityType}. Rollback may cause conflicts.` 
      };
    }

    return { canRollback: true };
  }

  private cleanupOldTransactions(): void {
    const transactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (transactions.length > this.maxTransactionHistory) {
      const toRemove = transactions.slice(this.maxTransactionHistory);
      toRemove.forEach(tx => this.transactions.delete(tx.id));
    }
  }

  exportTransactionLog(transactionId?: string): string {
    const transactions = transactionId 
      ? [this.transactions.get(transactionId)].filter(Boolean) as ImportTransaction[]
      : Array.from(this.transactions.values());

    const exportData = {
      exported_at: new Date().toISOString(),
      transaction_count: transactions.length,
      transactions: transactions.map(tx => ({
        ...tx,
        operations: tx.operations.length // Don't export full operations for size
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  getStatistics(): {
    totalTransactions: number;
    completedTransactions: number;
    rolledBackTransactions: number;
    failedTransactions: number;
    totalOperations: number;
    operationsByType: Record<string, number>;
  } {
    const transactions = Array.from(this.transactions.values());
    
    const stats = {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
      rolledBackTransactions: transactions.filter(tx => tx.status === 'rolled_back').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
      totalOperations: 0,
      operationsByType: {} as Record<string, number>
    };

    transactions.forEach(tx => {
      stats.totalOperations += tx.operations.length;
      tx.operations.forEach(op => {
        stats.operationsByType[op.operation] = (stats.operationsByType[op.operation] || 0) + 1;
      });
    });

    return stats;
  }
}

export const rollbackManager = new RollbackManager();