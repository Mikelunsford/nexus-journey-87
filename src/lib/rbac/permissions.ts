import { RoleBucket, hasPermissionLevel } from './roleBuckets';

export type Permission = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export' | 'import';
export type Resource = 'users' | 'projects' | 'customers' | 'invoices' | 'carriers' | 'documents' | 'analytics' | 'settings' | 'admin' | 'dev_tools';

export interface PermissionRule {
  resource: Resource;
  permission: Permission;
  requiredBucket: RoleBucket;
  conditions?: Record<string, any>;
}

// Default permission matrix - least privilege principle
export const PERMISSION_MATRIX: PermissionRule[] = [
  // Admin permissions
  { resource: 'admin', permission: 'manage', requiredBucket: 'admin' },
  { resource: 'dev_tools', permission: 'manage', requiredBucket: 'management' },
  { resource: 'users', permission: 'create', requiredBucket: 'admin' },
  { resource: 'users', permission: 'update', requiredBucket: 'admin' },
  { resource: 'users', permission: 'delete', requiredBucket: 'admin' },
  { resource: 'settings', permission: 'manage', requiredBucket: 'admin' },
  
  // Management permissions
  { resource: 'analytics', permission: 'export', requiredBucket: 'management' },
  { resource: 'projects', permission: 'manage', requiredBucket: 'management' },
  { resource: 'customers', permission: 'manage', requiredBucket: 'management' },
  { resource: 'invoices', permission: 'manage', requiredBucket: 'management' },
  
  // Operational permissions
  { resource: 'projects', permission: 'create', requiredBucket: 'operational' },
  { resource: 'projects', permission: 'read', requiredBucket: 'operational' },
  { resource: 'projects', permission: 'update', requiredBucket: 'operational' },
  { resource: 'customers', permission: 'read', requiredBucket: 'operational' },
  { resource: 'documents', permission: 'create', requiredBucket: 'operational' },
  { resource: 'documents', permission: 'read', requiredBucket: 'operational' },
  
  // External permissions (very limited)
  { resource: 'projects', permission: 'read', requiredBucket: 'external', conditions: { own_only: true } },
  { resource: 'documents', permission: 'read', requiredBucket: 'external', conditions: { own_only: true } }
];

export function hasPermission(
  userBucket: RoleBucket, 
  resource: Resource, 
  permission: Permission,
  context?: Record<string, any>
): boolean {
  const rule = PERMISSION_MATRIX.find(r => 
    r.resource === resource && r.permission === permission
  );
  
  if (!rule) {
    return false; // Default deny
  }
  
  if (!hasPermissionLevel(userBucket, rule.requiredBucket)) {
    return false;
  }
  
  // Check additional conditions if present
  if (rule.conditions && context) {
    if (rule.conditions.own_only && context.userId !== context.resourceOwnerId) {
      return false;
    }
  }
  
  return true;
}

export function getResourcePermissions(userBucket: RoleBucket, resource: Resource): Permission[] {
  return PERMISSION_MATRIX
    .filter(rule => rule.resource === resource && hasPermissionLevel(userBucket, rule.requiredBucket))
    .map(rule => rule.permission);
}

export function canAccess(userBucket: RoleBucket, route: string): boolean {
  // Route-based access control
  const routePermissions: Record<string, RoleBucket> = {
    '/dashboard/admin': 'admin',
    '/dashboard/admin/users': 'admin',
    '/dashboard/admin/organizations': 'admin',
    '/dashboard/admin/departments': 'admin',
    '/dashboard/admin/teams': 'management',
    '/dashboard/admin/feature-flags': 'admin',
    '/dashboard/admin/security': 'admin',
    '/dashboard/admin/import-export': 'management',
    '/dashboard/dev': 'management',
    '/dashboard/dev/tools': 'management',
    '/dashboard/analytics': 'operational',
    '/dashboard/analytics/export': 'management'
  };
  
  const requiredBucket = routePermissions[route];
  if (!requiredBucket) {
    return true; // No specific restriction
  }
  
  return hasPermissionLevel(userBucket, requiredBucket);
}