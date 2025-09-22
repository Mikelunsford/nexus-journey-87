// Role-Based Access Control - Updated for Database Role Buckets
import type { RoleBucket } from './rbac/roleBuckets';
import { hasPermissionLevel } from './rbac/roleBuckets';

export function canView(route: string, roleBucket: RoleBucket): boolean {
  const routePermissions: Record<string, RoleBucket> = {
    '/dashboard': 'external',
    '/dashboard/projects': 'operational',
    '/dashboard/tasks': 'operational',
    '/dashboard/employees': 'management',
    '/dashboard/messages': 'external',
    '/dashboard/production': 'operational',
    '/dashboard/shipping': 'operational',
    '/dashboard/documents': 'external',
    '/dashboard/customers': 'operational',
    '/dashboard/carriers': 'operational',
    '/dashboard/accounting': 'management',
    '/dashboard/analytics': 'management',
    '/dashboard/settings': 'external',
    '/dashboard/admin/users': 'management',
    '/dashboard/admin/organizations': 'admin',
    '/dev/bridge': 'admin',
  };

  // Check if route has specific permission requirement
  const requiredLevel = routePermissions[route];
  if (requiredLevel) {
    return hasPermissionLevel(roleBucket, requiredLevel);
  }

  // Check for route patterns (like /dashboard/customers/new)
  for (const [pattern, required] of Object.entries(routePermissions)) {
    if (route.startsWith(pattern)) {
      return hasPermissionLevel(roleBucket, required);
    }
  }

  // Default to external level access
  return hasPermissionLevel(roleBucket, 'external');
}

export function can(action: string, resource: string, roleBucket: RoleBucket): boolean {
  const permissions: Record<string, RoleBucket> = {
    'read:projects': 'external',
    'write:projects': 'operational',
    'read:production': 'operational',
    'write:production': 'operational',
    'read:shipping': 'operational',
    'write:shipping': 'operational',
    'read:users': 'management',
    'write:users': 'management',
    'read:labels': 'management',
    'write:labels': 'management',
    'read:customers': 'operational',
    'write:customers': 'management',
    'read:settings': 'external',
    'write:settings': 'management',
    'read:organizations': 'management',
    'write:organizations': 'admin',
  };

  const key = `${action}:${resource}`;
  const requiredLevel = permissions[key];
  
  if (!requiredLevel) {
    return false;
  }

  return hasPermissionLevel(roleBucket, requiredLevel);
}

export function getDefaultRoute(roleBucket: RoleBucket): string {
  const defaultRoutes: Record<RoleBucket, string> = {
    admin: '/dashboard',
    management: '/dashboard',
    operational: '/dashboard',
    external: '/dashboard',
  };

  return defaultRoutes[roleBucket] ?? '/dashboard';
}