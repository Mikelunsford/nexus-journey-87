// Role-Based Access Control
import type { Role } from './types';

export function canView(route: string, role: Role): boolean {
  const permissions: Record<string, Role[]> = {
    '/dashboard': ['admin', 'manager', 'developer', 'internal', 'employee', 'production', 'shipping_receiving', 'customer'],
    '/dashboard/projects': ['admin', 'manager', 'developer', 'internal', 'employee'],
    '/dashboard/messages': ['admin', 'manager', 'developer', 'internal', 'employee', 'customer'],
    '/dashboard/production': ['admin', 'manager', 'developer', 'internal', 'production'],
    '/dashboard/shipping': ['admin', 'manager', 'developer', 'internal', 'shipping_receiving'],
    '/dashboard/documents': ['admin', 'manager', 'developer', 'internal', 'employee', 'production', 'shipping_receiving', 'customer'],
    '/dashboard/customers': ['admin', 'manager', 'developer', 'internal', 'employee'],
    '/dashboard/customers/new': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/customers/labels': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/carriers': ['admin', 'manager', 'developer', 'internal', 'shipping_receiving'],
    '/dashboard/accounting': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/analytics': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/settings': ['admin', 'manager', 'developer', 'internal', 'employee', 'customer'],
    '/dashboard/admin/users': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/admin/users/invite': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/admin/users/labels': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/admin/organizations': ['admin', 'manager', 'developer', 'internal'],
    '/dashboard/admin/organizations/labels': ['admin', 'manager', 'developer', 'internal'],
    '/dev/bridge': ['admin', 'manager', 'developer', 'internal'],
  };

  return permissions[route]?.includes(role) ?? false;
}

export function can(action: string, resource: string, role: Role): boolean {
  const key = `${action}:${resource}`;
  
  const permissions: Record<string, Role[]> = {
    'read:projects': ['admin', 'manager', 'developer', 'internal', 'employee', 'customer'],
    'write:projects': ['admin', 'manager', 'developer', 'internal', 'employee'],
    'read:production': ['admin', 'manager', 'developer', 'internal', 'production'],
    'write:production': ['admin', 'manager', 'developer', 'internal', 'production'],
    'read:shipping': ['admin', 'manager', 'developer', 'internal', 'shipping_receiving'],
    'write:shipping': ['admin', 'manager', 'developer', 'internal', 'shipping_receiving'],
    'read:users': ['admin', 'manager', 'developer', 'internal'],
    'write:users': ['admin', 'manager', 'developer', 'internal'],
    'read:labels': ['admin', 'manager', 'developer', 'internal'],
    'write:labels': ['admin', 'manager', 'developer', 'internal'],
    'read:customers': ['admin', 'manager', 'developer', 'internal', 'employee'],
    'write:customers': ['admin', 'manager', 'developer', 'internal'],
    'read:settings': ['admin', 'manager', 'developer', 'internal', 'employee', 'customer'],
    'write:settings': ['admin', 'manager', 'developer', 'internal'],
  };

  return permissions[key]?.includes(role) ?? false;
}

export function getDefaultRoute(role: Role): string {
  const defaultRoutes: Record<Role, string> = {
    admin: '/dashboard',
    manager: '/dashboard',
    developer: '/dashboard',
    internal: '/dashboard',
    employee: '/dashboard',
    production: '/dashboard/production',
    shipping_receiving: '/dashboard/shipping',
    customer: '/dashboard',
  };

  return defaultRoutes[role] ?? '/dashboard';
}