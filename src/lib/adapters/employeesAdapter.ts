import type { User, Role } from '../types';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'active' | 'inactive' | 'away';
  avatar?: string;
  lastSeen?: string;
  joinedAt: string;
}

const DEPARTMENT_MAP: Record<Role, string> = {
  'admin': 'Leadership',
  'manager': 'Management',
  'developer': 'Engineering',
  'internal': 'Operations',
  'employee': 'General',
  'production': 'Manufacturing',
  'shipping_receiving': 'Logistics',
  'customer': 'External'
};

const ROLE_COLORS: Record<Role, string> = {
  'admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'developer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'internal': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'employee': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  'production': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'shipping_receiving': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'customer': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
};

export function transformUsersToEmployees(users: User[]): Employee[] {
  // Filter out customers as they shouldn't appear in employee directory
  return users
    .filter(user => user.role !== 'customer')
    .map(user => ({
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      department: DEPARTMENT_MAP[user.role],
      status: (Math.random() > 0.7 ? 'away' : Math.random() > 0.1 ? 'active' : 'inactive') as Employee['status'],
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getRoleColor(role: Role): string {
  return ROLE_COLORS[role] || ROLE_COLORS.employee;
}

export function getDepartmentEmployees(employees: Employee[], department: string): Employee[] {
  return employees.filter(emp => emp.department === department);
}

export function getEmployeesByStatus(employees: Employee[], status: Employee['status']): Employee[] {
  return employees.filter(emp => emp.status === status);
}

export function searchEmployees(employees: Employee[], query: string): Employee[] {
  const searchTerm = query.toLowerCase();
  return employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm) ||
    emp.email.toLowerCase().includes(searchTerm) ||
    emp.role.toLowerCase().includes(searchTerm) ||
    emp.department.toLowerCase().includes(searchTerm)
  );
}

export function getEmployeeInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}