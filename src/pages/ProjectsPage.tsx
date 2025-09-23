import React from 'react';
import QuickActionsGrid, { QAItem } from '@/components/ui/QuickActionsGrid';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, Clock, Folder } from 'lucide-react';

export default function ProjectsPage() {
  const quickActions: QAItem[] = [
    {
      label: 'New Project',
      to: '/projects/new',
      icon: <Plus className="w-4 h-4" />,
      caption: 'Start a new project'
    },
    {
      label: 'New Internal Quote',
      to: '/projects/new-internal',
      icon: <Folder className="w-4 h-4" />,
      caption: 'Calculate project quote'
    },
    {
      label: 'Team Projects',
      to: '/projects/team',
      icon: <Users className="w-4 h-4" />,
      caption: 'Collaborative projects'
    },
    {
      label: 'Project Calendar',
      to: '/projects/calendar',
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">Projects</h1>
        <p className="t-dim mt-2">Manage and track your projects</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Project KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Total Projects</p>
              <p className="text-2xl font-bold t-primary">12</p>
            </div>
            <div className="w-12 h-12 bg-t1-blue/10 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 t1-blue" />
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Active</p>
              <p className="text-2xl font-bold t-primary">8</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">In Review</p>
              <p className="text-2xl font-bold t-primary">2</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Completed</p>
              <p className="text-2xl font-bold t-primary">2</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">

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
    </div>
  );
}