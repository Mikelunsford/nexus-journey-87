import React, { useMemo, useState } from 'react';
import { Users, Grid3X3, List, Mail, Calendar } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { SavedViews, SavedView } from '@/components/ui/SavedViews';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useUrlState } from '@/hooks/useUrlState';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { 
  transformTeamMembersToEmployees, 
  getRoleColor, 
  getEmployeeInitials, 
  Employee 
} from '@/lib/adapters/employeesAdapter';
import { cn } from '@/lib/utils';

interface EmployeesState {
  search: string;
  role: string[];
  department: string[];
  status: string[];
  view: string;
  layout: 'table' | 'grid';
}

const defaultState: EmployeesState = {
  search: '',
  role: [],
  department: [],
  status: [],
  view: '',
  layout: 'table'
};

export default function EmployeesPage() {
  const [state, updateState] = useUrlState(defaultState);

  // Use real team member data
  const { teamMembers, loading, error } = useTeamMembers();
  const employees: Employee[] = useMemo(() => 
    transformTeamMembersToEmployees(teamMembers), 
    [teamMembers]
  );

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => 
    [...new Set(employees.map(e => e.department))].sort()
  , [employees]);

  const uniqueRoles = useMemo(() => 
    [...new Set(employees.map(e => e.role))].sort()
  , [employees]);

  // Saved views
  const savedViews: SavedView[] = useMemo(() => [
    {
      id: 'all-employees',
      name: 'All Employees',
      filters: {},
      count: employees.length
    },
    {
      id: 'engineering',
      name: 'Engineering',
      filters: { department: ['Engineering'] },
      count: employees.filter(e => e.department === 'Engineering').length
    },
    {
      id: 'management',
      name: 'Management',
      filters: { department: ['Management', 'Leadership'] },
      count: employees.filter(e => e.department === 'Management' || e.department === 'Leadership').length
    },
    {
      id: 'active-only',
      name: 'Active',
      filters: { status: ['active'] },
      count: employees.filter(e => e.status === 'active').length
    }
  ], [employees]);

  // Filter employees based on current state
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      if (state.search) {
        const searchLower = state.search.toLowerCase();
        if (!employee.name.toLowerCase().includes(searchLower) &&
            !employee.email.toLowerCase().includes(searchLower) &&
            !employee.role.toLowerCase().includes(searchLower) &&
            !employee.department.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Role filter
      if (state.role.length > 0 && !state.role.includes(employee.role)) {
        return false;
      }

      // Department filter
      if (state.department.length > 0 && !state.department.includes(employee.department)) {
        return false;
      }

      // Status filter
      if (state.status.length > 0 && !state.status.includes(employee.status)) {
        return false;
      }

      return true;
    });
  }, [employees, state]);

  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      options: uniqueRoles.map(role => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        count: employees.filter(e => e.role === role).length
      }))
    },
    {
      key: 'department',
      label: 'Department',
      options: uniqueDepartments.map(dept => ({
        value: dept,
        label: dept,
        count: employees.filter(e => e.department === dept).length
      }))
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active', count: employees.filter(e => e.status === 'active').length },
        { value: 'away', label: 'Away', count: employees.filter(e => e.status === 'away').length },
        { value: 'inactive', label: 'Inactive', count: employees.filter(e => e.status === 'inactive').length }
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
    updateState({ ...defaultState, layout: state.layout });
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className="card-surface panel panel-body p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-brand-blue text-white">
                {getEmployeeInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <StatusIndicator status={employee.status} size="sm" />
            </div>
          </div>
          <div>
            <h3 className="font-medium t-primary">{employee.name}</h3>
            <p className="text-sm t-dim">{employee.email}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={getRoleColor(employee.role)}>
            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1).replace('_', ' ')}
          </Badge>
          <Badge variant="outline">{employee.department}</Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm t-dim">
          <Calendar className="w-4 h-4" />
          <span>Last seen: {formatLastSeen(employee.lastSeen)}</span>
        </div>
        
        <div className="flex gap-1 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button size="sm" variant="outline">
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <PageSection 
      title="Employees" 
      subtitle={`${filteredEmployees.length} employees found`}
    >
      <div className="space-y-6">
        {/* Saved Views */}
        <SavedViews
          views={savedViews}
          activeViewId={state.view}
          onViewSelect={handleViewSelect}
        />

        {/* Filters and Layout Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
          <div className="flex-1">
            <FilterBar
              searchQuery={state.search}
              onSearchChange={(search) => updateState({ search })}
              searchPlaceholder="Search employees..."
          filters={filterOptions}
          activeFilters={{
            role: state.role,
            department: state.department,
            status: state.status
          }}
          onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={state.layout === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => updateState({ layout: 'table' })}
            >
              <List className="w-4 h-4 mr-1" />
              Table
            </Button>
            <Button
              variant={state.layout === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => updateState({ layout: 'grid' })}
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Grid
            </Button>
          </div>
        </div>

        {/* Employees Display */}
        {filteredEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="No employees match your current filters. Try adjusting your search or filters."
            icon={<Users className="w-8 h-8" />}
            action={{
              label: 'Clear Filters',
              onClick: handleClearFilters,
              variant: 'primary'
            }}
          />
        ) : state.layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-brand-blue text-white">
                              {getEmployeeInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1">
                            <StatusIndicator status={employee.status} size="sm" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm t-dim">{employee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(employee.role)}>
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusIndicator status={employee.status} showLabel />
                    </TableCell>
                    <TableCell className="t-dim">
                      {formatLastSeen(employee.lastSeen)}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </TableCell>
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