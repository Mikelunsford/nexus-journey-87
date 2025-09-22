export type AuditAction = 
  | 'user.created' | 'user.updated' | 'user.deleted' | 'user.role_changed'
  | 'group.assigned' | 'group.removed' 
  | 'permission.granted' | 'permission.revoked'
  | 'data.imported' | 'data.exported' | 'data.rolled_back'
  | 'security.access_denied' | 'security.threat_detected'
  | 'admin.login' | 'admin.logout' | 'admin.escalation';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  changes: Record<string, any>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    requestId?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxEntries = 10000; // Keep last 10k entries in memory

  logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(logEntry);
    
    // Keep only recent entries to prevent memory issues
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(0, this.maxEntries);
    }

    // In production, this would also write to external log service
    console.log('AUDIT:', logEntry);

    return logEntry;
  }

  getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    severity?: AuditLogEntry['severity'];
    since?: Date;
    limit?: number;
  }): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        filtered = filtered.filter(log => log.resource === filters.resource);
      }
      if (filters.severity) {
        filtered = filtered.filter(log => log.severity === filters.severity);
      }
      if (filters.since) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filters.since!);
      }
    }

    return filtered.slice(0, filters?.limit || 100);
  }

  getSecurityEvents(timeRange: 'hour' | 'day' | 'week' = 'day'): AuditLogEntry[] {
    const now = new Date();
    const since = new Date();
    
    switch (timeRange) {
      case 'hour':
        since.setHours(now.getHours() - 1);
        break;
      case 'day':
        since.setDate(now.getDate() - 1);
        break;
      case 'week':
        since.setDate(now.getDate() - 7);
        break;
    }

    return this.getLogs({
      since,
      limit: 500
    }).filter(log => 
      log.action.startsWith('security.') || 
      log.severity === 'high' || 
      log.severity === 'critical'
    );
  }

  exportLogs(format: 'json' | 'csv' = 'json', filters?: Parameters<AuditLogger['getLogs']>[0]): string {
    const logs = this.getLogs(filters);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV export
    if (logs.length === 0) return 'No logs found';
    
    const headers = ['timestamp', 'userId', 'userRole', 'action', 'resource', 'resourceId', 'severity'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.userId,
        log.userRole,
        log.action,
        log.resource,
        log.resourceId || '',
        log.severity
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  // Helper methods for common audit patterns
  logUserAction(userId: string, userRole: string, action: AuditAction, details: Partial<AuditLogEntry>) {
    return this.logAction({
      userId,
      userRole,
      action,
      resource: 'user',
      changes: {},
      metadata: {},
      severity: 'medium',
      ...details
    });
  }

  logSecurityEvent(userId: string, userRole: string, action: AuditAction, severity: AuditLogEntry['severity'], metadata: Record<string, any>) {
    return this.logAction({
      userId,
      userRole,
      action,
      resource: 'security',
      changes: {},
      metadata: {
        ...metadata,
        userAgent: navigator?.userAgent
      },
      severity
    });
  }

  logDataOperation(userId: string, userRole: string, operation: 'import' | 'export' | 'rollback', resourceType: string, count: number) {
    return this.logAction({
      userId,
      userRole,
      action: `data.${operation}` as AuditAction,
      resource: resourceType,
      changes: { recordCount: count },
      metadata: {},
      severity: operation === 'rollback' ? 'high' : 'medium'
    });
  }
}

export const auditLogger = new AuditLogger();
