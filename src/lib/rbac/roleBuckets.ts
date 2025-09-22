export type RoleBucket = 'admin' | 'management' | 'operational' | 'external';

export interface RoleHierarchy {
  bucket: RoleBucket;
  level: number;
  inherits: RoleBucket[];
}

export const ROLE_BUCKETS: Record<RoleBucket, RoleHierarchy> = {
  admin: {
    bucket: 'admin',
    level: 4,
    inherits: ['management', 'operational', 'external']
  },
  management: {
    bucket: 'management', 
    level: 3,
    inherits: ['operational', 'external']
  },
  operational: {
    bucket: 'operational',
    level: 2,
    inherits: ['external']
  },
  external: {
    bucket: 'external',
    level: 1,
    inherits: []
  }
};

export function hasPermissionLevel(userBucket: RoleBucket, requiredBucket: RoleBucket): boolean {
  const userLevel = ROLE_BUCKETS[userBucket].level;
  const requiredLevel = ROLE_BUCKETS[requiredBucket].level;
  return userLevel >= requiredLevel;
}

export function getInheritedBuckets(bucket: RoleBucket): RoleBucket[] {
  return [bucket, ...ROLE_BUCKETS[bucket].inherits];
}

// Role to bucket mapping
export function getRoleBucket(role: string): RoleBucket {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'super_admin':
      return 'admin';
    case 'manager':
    case 'supervisor': 
    case 'director':
      return 'management';
    case 'employee':
    case 'operator':
    case 'staff':
      return 'operational';
    case 'client':
    case 'vendor':
    case 'contractor':
      return 'external';
    default:
      return 'external'; // Default to lowest privilege
  }
}