import type { User, Role } from '../types';

// Import TeamMember type for the new adapter function
interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  memberships?: {
    role_bucket: string;
    department_id: string | null;
    expires_at: string | null;
  }[];
}

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

export function transformTeamMembersToEmployees(teamMembers: TeamMember[]): Employee[] {
  // Convert team members to employees, using role_bucket for role mapping
  return teamMembers
    .filter(member => member.memberships && member.memberships.length > 0)
    .map(member => {
      const membership = member.memberships![0]; // Get primary membership
      const roleBucket = membership.role_bucket as 'admin' | 'management' | 'operational' | 'external';
      
      // Map role_bucket to Role type
      const roleMap: Record<string, Role> = {
        'admin': 'admin',
        'management': 'manager', 
        'operational': 'employee',
        'external': 'customer'
      };

      const role = roleMap[roleBucket] || 'employee';
      
      return {
        id: member.id,
        name: member.name || member.email.split('@')[0],
        email: member.email,
        role,
        department: DEPARTMENT_MAP[role],
        status: (Math.random() > 0.7 ? 'away' : Math.random() > 0.1 ? 'active' : 'inactive') as Employee['status'],
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        joinedAt: member.created_at
      };
    })
    .filter(emp => emp.role !== 'customer') // Filter out external/customer roles
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