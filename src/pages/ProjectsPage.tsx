import React from 'react';
import PageSection from '@/components/layout/PageSection';
import QuickActionsGrid, { QAItem } from '@/components/ui/QuickActionsGrid';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, Clock, Folder } from 'lucide-react';

export default function ProjectsPage() {
  const quickActions: QAItem[] = [
    {
      label: 'New Project',
      to: '/dashboard/projects/new',
      icon: <Plus className="w-4 h-4" />,
      caption: 'Start a new project'
    },
    {
      label: 'Project Templates',
      to: '/dashboard/projects/templates',
      icon: <Folder className="w-4 h-4" />,
      caption: 'Use existing templates'
    },
    {
      label: 'Team Projects',
      to: '/dashboard/projects/team',
      icon: <Users className="w-4 h-4" />,
      caption: 'Collaborative projects'
    },
    {
      label: 'Project Calendar',
      to: '/dashboard/projects/calendar',
      icon: <Calendar className="w-4 h-4" />,
      caption: 'View project timeline'
    }
  ];

  const projects = [
    {
      id: '1',
      name: 'E-Commerce Platform Redesign',
      status: 'In Progress',
      progress: 65,
      dueDate: '2024-12-15',
      team: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
      priority: 'High'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      status: 'Planning',
      progress: 15,
      dueDate: '2025-02-20',
      team: ['David Wilson', 'Eve Brown'],
      priority: 'Medium'
    },
    {
      id: '3',
      name: 'API Integration',
      status: 'Review',
      progress: 90,
      dueDate: '2024-11-30',
      team: ['Frank Miller', 'Grace Lee'],
      priority: 'High'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'info';
      case 'Planning': return 'warn';
      case 'Review': return 'info';
      case 'Completed': return 'ok';
      default: return 'warn';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'err';
      case 'Medium': return 'warn';
      case 'Low': return 'ok';
      default: return 'warn';
    }
  };

  return (
    <PageSection
      title="Projects"
      subtitle="Manage and track your projects"
      actions={
        <div className="flex gap-3">
          <QuickActionsGrid items={quickActions} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-value">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-value">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-value">2</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{project.name}</h4>
                        <StatusPill tone={getStatusColor(project.status) as 'ok' | 'warn' | 'info' | 'err'}>{project.status}</StatusPill>
                        <StatusPill tone={getPriorityColor(project.priority) as 'ok' | 'warn' | 'info' | 'err'}>{project.priority}</StatusPill>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due: {new Date(project.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.team.length} members
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageSection>
  );
}