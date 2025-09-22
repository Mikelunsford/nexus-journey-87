import { RoleBucket } from './roleBuckets';

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  description?: string;
  defaultBucket: RoleBucket;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  leaderId?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserGroupAssignment {
  id: string;
  userId: string;
  departmentId?: string;
  teamId?: string;
  roleBucket: RoleBucket;
  assignedBy: string;
  assigned_at: string;
  expires_at?: string;
}

// Default department structure
export const DEFAULT_DEPARTMENTS: Omit<Department, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development and technical operations',
    defaultBucket: 'operational'
  },
  {
    name: 'Frontend Team',
    code: 'FE',
    parentId: 'eng-parent-id',
    description: 'Frontend development team',
    defaultBucket: 'operational'
  },
  {
    name: 'Backend Team', 
    code: 'BE',
    parentId: 'eng-parent-id',
    description: 'Backend development team',
    defaultBucket: 'operational'
  },
  {
    name: 'Operations',
    code: 'OPS',
    description: 'Business operations and production',
    defaultBucket: 'operational'
  },
  {
    name: 'Production',
    code: 'PROD',
    parentId: 'ops-parent-id',
    description: 'Manufacturing and production',
    defaultBucket: 'operational'
  },
  {
    name: 'Shipping',
    code: 'SHIP',
    parentId: 'ops-parent-id', 
    description: 'Logistics and shipping',
    defaultBucket: 'operational'
  },
  {
    name: 'Sales',
    code: 'SALES',
    description: 'Sales and customer relations',
    defaultBucket: 'operational'
  },
  {
    name: 'Management',
    code: 'MGMT',
    description: 'Executive and management team',
    defaultBucket: 'management'
  }
];

export class GroupAssignmentManager {
  private assignments: Map<string, UserGroupAssignment[]> = new Map();

  assignUserToGroup(assignment: Omit<UserGroupAssignment, 'id' | 'assigned_at'>): UserGroupAssignment {
    const newAssignment: UserGroupAssignment = {
      ...assignment,
      id: crypto.randomUUID(),
      assigned_at: new Date().toISOString()
    };

    const userAssignments = this.assignments.get(assignment.userId) || [];
    userAssignments.push(newAssignment);
    this.assignments.set(assignment.userId, userAssignments);

    return newAssignment;
  }

  removeUserFromGroup(userId: string, groupId: string, groupType: 'department' | 'team'): boolean {
    const userAssignments = this.assignments.get(userId) || [];
    const field = groupType === 'department' ? 'departmentId' : 'teamId';
    
    const initialLength = userAssignments.length;
    const filtered = userAssignments.filter(a => a[field] !== groupId);
    
    this.assignments.set(userId, filtered);
    return filtered.length < initialLength;
  }

  getUserAssignments(userId: string): UserGroupAssignment[] {
    return this.assignments.get(userId) || [];
  }

  getUserEffectiveBucket(userId: string): RoleBucket {
    const assignments = this.getUserAssignments(userId);
    
    if (assignments.length === 0) {
      return 'external'; // Default to lowest privilege
    }

    // Return the highest privilege bucket from all assignments
    const bucketLevels = { external: 1, operational: 2, management: 3, admin: 4 };
    const highest = assignments.reduce((max, assignment) => {
      const current = bucketLevels[assignment.roleBucket];
      const maxLevel = bucketLevels[max];
      return current > maxLevel ? assignment.roleBucket : max;
    }, 'external' as RoleBucket);

    return highest;
  }

  bulkAssignDepartment(userIds: string[], departmentId: string, roleBucket: RoleBucket, assignedBy: string): UserGroupAssignment[] {
    return userIds.map(userId => 
      this.assignUserToGroup({
        userId,
        departmentId,
        roleBucket,
        assignedBy
      })
    );
  }

  getGroupMembers(groupId: string, groupType: 'department' | 'team'): string[] {
    const field = groupType === 'department' ? 'departmentId' : 'teamId';
    const members: string[] = [];

    for (const [userId, assignments] of this.assignments.entries()) {
      if (assignments.some(a => a[field] === groupId)) {
        members.push(userId);
      }
    }

    return members;
  }
}

export const groupAssignmentManager = new GroupAssignmentManager();