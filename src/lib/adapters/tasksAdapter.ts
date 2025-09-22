import type { WorkOrder, Project, User } from '../types';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  project?: string;
  projectId?: string;
  dueDate?: string;
  createdAt: string;
  source: 'work_order' | 'project' | 'message';
  sourceId: string;
}

const STATUS_MAP: Record<string, Task['status']> = {
  'queued': 'todo',
  'wip': 'in_progress',
  'paused': 'blocked',
  'done': 'completed',
  'draft': 'todo',
  'quoted': 'todo',
  'approved': 'in_progress',
  'in_progress': 'in_progress',
  'on_hold': 'blocked',
  'completed': 'completed',
  'archived': 'completed'
};

const PRIORITY_MAP: Record<string, Task['priority']> = {
  'draft': 'low',
  'quoted': 'medium',
  'approved': 'high',
  'in_progress': 'high',
  'on_hold': 'medium',
  'completed': 'low',
  'archived': 'low',
  'queued': 'medium',
  'wip': 'high',
  'paused': 'medium',
  'done': 'low'
};

export function transformWorkOrdersToTasks(
  workOrders: WorkOrder[],
  projects: Project[],
  users: User[]
): Task[] {
  return workOrders.map(wo => {
    const project = projects.find(p => p.id === wo.projectId);
    const assignee = users.find(u => u.role === 'production')?.name || 'Unassigned';
    
    return {
      id: wo.id,
      title: `Work Order ${wo.qty ? `(${wo.qty} units)` : ''}`,
      description: project ? `Production work for ${project.title}` : 'Production work order',
      status: STATUS_MAP[wo.status] || 'todo',
      priority: PRIORITY_MAP[wo.status] || 'medium',
      assignee,
      project: project?.title,
      projectId: project?.id,
      dueDate: project?.due,
      createdAt: wo.createdAt,
      source: 'work_order',
      sourceId: wo.id
    };
  });
}

export function transformProjectsToTasks(
  projects: Project[],
  users: User[]
): Task[] {
  return projects
    .filter(p => p.status !== 'archived' && p.status !== 'completed')
    .map(project => {
      const assignee = project.owner || users[0]?.name || 'Unassigned';
      
      return {
        id: `project-${project.id}`,
        title: project.title,
        description: `Project management task for ${project.title}`,
        status: STATUS_MAP[project.status] || 'todo',
        priority: PRIORITY_MAP[project.status] || 'medium',
        assignee,
        project: project.title,
        projectId: project.id,
        dueDate: project.due,
        createdAt: project.createdAt,
        source: 'project',
        sourceId: project.id
      };
    });
}

export function getAllTasks(
  workOrders: WorkOrder[],
  projects: Project[],
  users: User[]
): Task[] {
  const workOrderTasks = transformWorkOrdersToTasks(workOrders, projects, users);
  const projectTasks = transformProjectsToTasks(projects, users);
  
  return [...workOrderTasks, ...projectTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTasksByUser(
  workOrders: WorkOrder[],
  projects: Project[],
  users: User[],
  currentUser: User
): Task[] {
  const allTasks = getAllTasks(workOrders, projects, users);
  
  // Filter tasks for current user based on role
  switch (currentUser.role) {
    case 'production':
      return allTasks.filter(task => task.source === 'work_order');
    case 'manager':
    case 'admin':
      return allTasks; // Managers see all tasks
    default:
      return allTasks.filter(task => 
        task.assignee === currentUser.name || 
        task.source === 'project'
      );
  }
}