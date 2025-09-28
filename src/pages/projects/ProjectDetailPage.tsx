import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageSection from '@/components/layout/PageSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MessageCircle, FileText, Truck } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  // TODO: Replace with real project data fetching
  const project = {
    id: id || '1',
    name: 'Sample Project',
    status: 'in_progress',
    customer: 'Acme Corp',
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    description: 'A sample project for demonstration purposes.',
    budget: 50000,
    progress: 65
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    quoted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Project #{project.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[project.status as keyof typeof statusColors]}>
            {project.status.replace('_', ' ')}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Basic project information and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer</label>
                <p className="text-sm">{project.customer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget</label>
                <p className="text-sm">${project.budget.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-sm">{new Date(project.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-sm">{new Date(project.end_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-1">{project.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Progress</label>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>{project.progress}%</span>
                  <span>Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common project actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/dashboard/projects/${project.id}/chat`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Project Chat
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/documents">
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/shipments">
                <Truck className="h-4 w-4 mr-2" />
                Track Shipments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Details Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Detailed project information and related data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Project Status</h3>
                  <p className="text-lg font-semibold capitalize">{project?.status || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Customer</h3>
                  <p className="text-lg">{project?.customer || 'No customer assigned'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                  <p className="text-lg">
                    {project?.start_date ? new Date(project.start_date).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                  <p className="text-lg">{project?.description || 'No description provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Budget</h3>
                  <p className="text-lg">
                    {project?.budget ? `$${project.budget.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Timeline</h3>
                  <p className="text-lg">
                    {project?.start_date && project?.end_date
                      ? `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}`
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t">
              <h3 className="font-medium text-lg mb-4">Project Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Edit Project
                </Button>
                <Button variant="outline" size="sm">
                  View Tasks
                </Button>
                <Button variant="outline" size="sm">
                  Team Members
                </Button>
                <Button variant="outline" size="sm">
                  Project Chat
                </Button>
                <Button variant="outline" size="sm">
                  Documents
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
