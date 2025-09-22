import React, { useMemo, useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, Circle, Package, FolderOpen } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { SavedViews, SavedView } from '@/components/ui/SavedViews';
import { ColumnSelector, Column } from '@/components/ui/ColumnSelector';
import { useUrlState } from '@/hooks/useUrlState';
import { useAuth } from '@/components/auth/AuthProvider';
import { createMockData } from '@/lib/mock/seeds';
import { getAllTasks, getTasksByUser, Task } from '@/lib/adapters/tasksAdapter';
import { cn } from '@/lib/utils';

const PRIORITY_ICONS = {
  low: Circle,
  medium: AlertCircle,
  high: AlertCircle,
  urgent: AlertCircle
};

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-red-500'
};

const STATUS_ICONS = {
  todo: Circle,
  in_progress: Clock,
  blocked: AlertCircle,
  completed: CheckCircle2
};

const STATUS_COLORS = {
  todo: 'text-gray-500',
  in_progress: 'text-blue-500',
  blocked: 'text-red-500',
  completed: 'text-green-500'
};

const SOURCE_ICONS = {
  work_order: Package,
  project: FolderOpen,
  message: FolderOpen
};

interface TasksState {
  search: string;
  status: string[];
  priority: string[];
  source: string[];
  assignee: string[];
  view: string;
}

const defaultState: TasksState = {
  search: '',
  status: [],
  priority: [],
  source: [],
  assignee: [],
  view: ''
};

const defaultColumns: Column[] = [
  { key: 'title', label: 'Task', visible: true, required: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'priority', label: 'Priority', visible: true },
  { key: 'assignee', label: 'Assignee', visible: true },
  { key: 'project', label: 'Project', visible: true },
  { key: 'dueDate', label: 'Due Date', visible: true },
  { key: 'source', label: 'Source', visible: false }
];

export default function TasksPage() {
  const { user, profile } = useAuth();
  const [state, updateState] = useUrlState(defaultState);
  const [columns, setColumns] = useState(defaultColumns);

  // Mock data
  const mockData = useMemo(() => createMockData(), []);
  const allTasks = useMemo(() => 
    user ? getTasksByUser(mockData.workOrders, mockData.projects, mockData.users, user) : []
  , [mockData, user]);

  // Get unique values for filters
  const uniqueAssignees = useMemo(() => 
    [...new Set(allTasks.map(t => t.assignee))].sort()
  , [allTasks]);

  // Saved views
  const savedViews: SavedView[] = useMemo(() => [
    {
      id: 'my-tasks',
      name: 'My Tasks',
      description: 'Tasks assigned to me',
      filters: { assignee: [profile?.name || user?.email || ''] },
      count: allTasks.filter(t => t.assignee === (profile?.name || user?.email)).length
    },
    {
      id: 'high-priority',
      name: 'High Priority',
      filters: { priority: ['high', 'urgent'] },
      count: allTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length
    },
    {
      id: 'overdue',
      name: 'Overdue',
      filters: { 
        status: ['todo', 'in_progress'],
        // This would normally filter by due date < now, simplified for demo
      },
      count: allTasks.filter(t => 
        (t.status === 'todo' || t.status === 'in_progress') && 
        t.dueDate && 
        new Date(t.dueDate) < new Date()
      ).length
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      filters: { status: ['in_progress'] },
      count: allTasks.filter(t => t.status === 'in_progress').length
    }
  ], [allTasks, user, profile]);

  // Filter tasks based on current state
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      // Search filter
      if (state.search) {
        const searchLower = state.search.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description.toLowerCase().includes(searchLower) &&
            !(task.project?.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Status filter
      if (state.status.length > 0 && !state.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (state.priority.length > 0 && !state.priority.includes(task.priority)) {
        return false;
      }

      // Source filter
      if (state.source.length > 0 && !state.source.includes(task.source)) {
        return false;
      }

      // Assignee filter
      if (state.assignee.length > 0 && !state.assignee.includes(task.assignee)) {
        return false;
      }

      return true;
    });
  }, [allTasks, state]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'todo', label: 'To Do', count: allTasks.filter(t => t.status === 'todo').length },
        { value: 'in_progress', label: 'In Progress', count: allTasks.filter(t => t.status === 'in_progress').length },
        { value: 'blocked', label: 'Blocked', count: allTasks.filter(t => t.status === 'blocked').length },
        { value: 'completed', label: 'Completed', count: allTasks.filter(t => t.status === 'completed').length }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'urgent', label: 'Urgent', count: allTasks.filter(t => t.priority === 'urgent').length },
        { value: 'high', label: 'High', count: allTasks.filter(t => t.priority === 'high').length },
        { value: 'medium', label: 'Medium', count: allTasks.filter(t => t.priority === 'medium').length },
        { value: 'low', label: 'Low', count: allTasks.filter(t => t.priority === 'low').length }
      ]
    },
    {
      key: 'assignee',
      label: 'Assignee',
      options: uniqueAssignees.map(assignee => ({
        value: assignee,
        label: assignee,
        count: allTasks.filter(t => t.assignee === assignee).length
      }))
    },
    {
      key: 'source',
      label: 'Source',
      options: [
        { value: 'work_order', label: 'Work Order', count: allTasks.filter(t => t.source === 'work_order').length },
        { value: 'project', label: 'Project', count: allTasks.filter(t => t.source === 'project').length },
        { value: 'message', label: 'Message', count: allTasks.filter(t => t.source === 'message').length }
      ]
    }
  ];

  const handleViewSelect = (view: SavedView) => {
    updateState({
      ...view.filters,
      view: view.id
    });
  };

  const handleFilterChange = (key: string, values: string[]) => {
    updateState({ [key]: values });
  };

  const handleClearFilters = () => {
    updateState(defaultState);
  };

  const handleColumnToggle = (key: string, visible: boolean) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible } : col
    ));
  };

  const handleResetColumns = () => {
    setColumns(defaultColumns);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatSource = (task: Task) => {
    const SourceIcon = SOURCE_ICONS[task.source];
    return (
      <div className="flex items-center gap-1">
        <SourceIcon className="w-4 h-4 t-dim" />
        <span className="text-xs t-dim capitalize">
          {task.source.replace('_', ' ')}
        </span>
      </div>
    );
  };

  const visibleColumns = columns.filter(col => col.visible);

  return (
    <PageSection 
      title="Tasks" 
      subtitle={`${filteredTasks.length} tasks found`}
    >
      <div className="space-y-6">
        {/* Saved Views */}
        <SavedViews
          views={savedViews}
          activeViewId={state.view}
          onViewSelect={handleViewSelect}
        />

        {/* Filters */}
        <FilterBar
          searchQuery={state.search}
          onSearchChange={(search) => updateState({ search })}
          searchPlaceholder="Search tasks..."
          filters={filterOptions}
          activeFilters={{
            status: state.status,
            priority: state.priority,
            source: state.source,
            assignee: state.assignee
          }}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Column Selector */}
        <div className="flex justify-end">
          <ColumnSelector
            columns={columns}
            onColumnToggle={handleColumnToggle}
            onResetColumns={handleResetColumns}
          />
        </div>

        {/* Tasks Table */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="No tasks match your current filters. Try adjusting your search or filters."
            icon={<CheckCircle2 className="w-8 h-8" />}
            action={{
              label: 'Clear Filters',
              onClick: handleClearFilters,
              variant: 'primary'
            }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key}>
                        {column.key === 'title' && (
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm t-dim">{task.description}</div>
                          </div>
                        )}
                        {column.key === 'status' && (
                          <div className="flex items-center gap-2">
                            {React.createElement(STATUS_ICONS[task.status], {
                              className: cn('w-4 h-4', STATUS_COLORS[task.status])
                            })}
                            <Badge variant="secondary" className="capitalize">
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        )}
                        {column.key === 'priority' && (
                          <div className="flex items-center gap-2">
                            {React.createElement(PRIORITY_ICONS[task.priority], {
                              className: cn('w-4 h-4', PRIORITY_COLORS[task.priority])
                            })}
                            <span className={cn('capitalize', PRIORITY_COLORS[task.priority])}>
                              {task.priority}
                            </span>
                          </div>
                        )}
                        {column.key === 'assignee' && task.assignee}
                        {column.key === 'project' && (task.project || '-')}
                        {column.key === 'dueDate' && formatDate(task.dueDate)}
                        {column.key === 'source' && formatSource(task)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageSection>
  );
}