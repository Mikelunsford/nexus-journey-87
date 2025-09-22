import { Department, Team, DEFAULT_DEPARTMENTS } from '../rbac/groupAssignments';
import { RoleBucket } from '../rbac/roleBuckets';

export interface DepartmentNode extends Department {
  children: DepartmentNode[];
  teams: Team[];
  memberCount: number;
}

export class DepartmentManager {
  private departments: Map<string, Department> = new Map();
  private teams: Map<string, Team> = new Map();

  constructor() {
    this.initializeDefaultStructure();
  }

  private initializeDefaultStructure() {
    // Create default departments
    DEFAULT_DEPARTMENTS.forEach(dept => {
      const department: Department = {
        ...dept,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.departments.set(department.id, department);
    });

    // Create some default teams
    const engineering = Array.from(this.departments.values()).find(d => d.code === 'ENG');
    const operations = Array.from(this.departments.values()).find(d => d.code === 'OPS');

    if (engineering) {
      this.createTeam({
        name: 'Core Platform',
        departmentId: engineering.id,
        description: 'Core platform development'
      });
      
      this.createTeam({
        name: 'Mobile Team',
        departmentId: engineering.id,
        description: 'Mobile app development'
      });
    }

    if (operations) {
      this.createTeam({
        name: 'Quality Assurance',
        departmentId: operations.id,
        description: 'Product quality and testing'
      });
    }
  }

  createDepartment(data: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Department {
    const department: Department = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.departments.set(department.id, department);
    return department;
  }

  updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const existing = this.departments.get(id);
    if (!existing) return null;

    const updated: Department = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    this.departments.set(id, updated);
    return updated;
  }

  deleteDepartment(id: string): boolean {
    // Check if department has children or teams
    const hasChildren = Array.from(this.departments.values()).some(d => d.parentId === id);
    const hasTeams = Array.from(this.teams.values()).some(t => t.departmentId === id);
    
    if (hasChildren || hasTeams) {
      throw new Error('Cannot delete department with children or teams');
    }

    return this.departments.delete(id);
  }

  getDepartment(id: string): Department | undefined {
    return this.departments.get(id);
  }

  getAllDepartments(): Department[] {
    return Array.from(this.departments.values());
  }

  getDepartmentTree(): DepartmentNode[] {
    const departments = this.getAllDepartments();
    const rootDepartments = departments.filter(d => !d.parentId);
    
    return rootDepartments.map(dept => this.buildDepartmentNode(dept));
  }

  private buildDepartmentNode(department: Department): DepartmentNode {
    const children = this.getAllDepartments()
      .filter(d => d.parentId === department.id)
      .map(child => this.buildDepartmentNode(child));

    const teams = Array.from(this.teams.values())
      .filter(t => t.departmentId === department.id);

    return {
      ...department,
      children,
      teams,
      memberCount: this.getDepartmentMemberCount(department.id)
    };
  }

  private getDepartmentMemberCount(departmentId: string): number {
    // This would integrate with the user management system
    // For now, return a mock count
    return Math.floor(Math.random() * 20) + 1;
  }

  createTeam(data: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Team {
    const team: Team = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.teams.set(team.id, team);
    return team;
  }

  updateTeam(id: string, updates: Partial<Team>): Team | null {
    const existing = this.teams.get(id);
    if (!existing) return null;

    const updated: Team = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };

    this.teams.set(id, updated);
    return updated;
  }

  deleteTeam(id: string): boolean {
    return this.teams.delete(id);
  }

  getTeam(id: string): Team | undefined {
    return this.teams.get(id);
  }

  getTeamsByDepartment(departmentId: string): Team[] {
    return Array.from(this.teams.values())
      .filter(t => t.departmentId === departmentId);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  moveDepartment(departmentId: string, newParentId?: string): boolean {
    const department = this.departments.get(departmentId);
    if (!department) return false;

    // Prevent circular references
    if (newParentId && this.wouldCreateCircle(departmentId, newParentId)) {
      throw new Error('Cannot move department: would create circular reference');
    }

    const updated = { ...department, parentId: newParentId };
    this.departments.set(departmentId, updated);
    return true;
  }

  private wouldCreateCircle(departmentId: string, targetParentId: string): boolean {
    let currentId = targetParentId;
    while (currentId) {
      if (currentId === departmentId) return true;
      const current = this.departments.get(currentId);
      currentId = current?.parentId || '';
    }
    return false;
  }

  searchDepartments(query: string): Department[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllDepartments().filter(dept =>
      dept.name.toLowerCase().includes(lowercaseQuery) ||
      dept.code.toLowerCase().includes(lowercaseQuery) ||
      dept.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  getDepartmentPath(departmentId: string): Department[] {
    const path: Department[] = [];
    let currentId = departmentId;

    while (currentId) {
      const dept = this.departments.get(currentId);
      if (!dept) break;
      path.unshift(dept);
      currentId = dept.parentId || '';
    }

    return path;
  }
}

export const departmentManager = new DepartmentManager();