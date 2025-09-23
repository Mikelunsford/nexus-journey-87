import { useAuth } from '@/components/auth/AuthProvider';
import { useCustomers } from '@/hooks/useCustomers';
import { useProjects } from '@/hooks/useProjects';
import { useQuotes } from '@/hooks/useQuotes';
import { useShipments } from '@/hooks/useShipments';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { useUsers } from '@/hooks/useUsers';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { TestButton } from "@/components/ui/TestButton";
import { StatusPill } from '@/components/ui/StatusPill';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { type RoleBucket } from '@/lib/rbac/roleBuckets';
import { 
  Building2, Plus, FileText, Users, Package, 
  TrendingUp, Clock, AlertTriangle, Truck, ExternalLink 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { customers } = useCustomers();
  const { projects } = useProjects();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { shipments, loading: shipmentsLoading } = useShipments();
  const { workOrders, loading: workOrdersLoading } = useWorkOrders();
  const { users, loading: usersLoading } = useUsers();
  const [brandV1Enabled] = useFeatureFlag('ui.brand_v1');

  // Calculate real-time KPIs
  const activeProjects = projects.filter(p => ['in_progress', 'approved'].includes(p.status)).length;
  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'draft').length;
  const activeShipments = shipments.filter(s => s.status === 'in_transit').length;
  
  // Calculate team members based on user role
  const userRoleBucket = profile?.role_bucket as RoleBucket;
  const teamMembers = (() => {
    if (userRoleBucket === 'external') {
      // External users (customers) should only see themselves
      return 1;
    } else if (userRoleBucket === 'admin') {
      // Admins see all users
      return users.length;
    } else {
      // Internal users (management, operational) see internal staff only
      return users.filter(u => u.role_bucket !== 'external').length;
    }
  })();

  // Get top priorities from real data
  const urgentProjects = projects
    .filter(p => p.priority === 'high' || p.priority === 'critical')
    .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
    .slice(0, 2);

  const recentShipments = shipments
    .filter(s => s.status === 'in_transit')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 1);

  const qualityIssues = workOrders
    .filter(wo => wo.status === 'paused' || wo.metadata?.quality_issues)
    .slice(0, 1);

  const isLoading = quotesLoading || shipmentsLoading || workOrdersLoading || usersLoading;

  const quickActions: QAItem[] = [
    {
      label: 'Submit New Quote to Team1',
      to: '/projects/new-internal-quote',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Add Project Information',
      to: '/projects/new',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
        </svg>
      ),
    },
    {
      label: 'Import CSV',
      to: '/settings/backup',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      label: 'Invite User',
      to: '/admin/users/invite',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">
          Welcome back, {profile?.name || 'User'}
        </h1>
        <p className="t-dim mt-2">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* KPIs Section - Now Clickable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Projects Card */}
        <Card className="overflow-hidden">
          <Link to="/dashboard/projects?status=active" className="block cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className={`h-4 w-4 ${brandV1Enabled ? 'text-brand-blue' : 'text-t1-blue'}`} />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{isLoading ? '...' : activeProjects}</div>
              <p className="text-xs text-muted-foreground mt-2">
                View all projects
                <ExternalLink className="inline ml-1 h-3 w-3" />
              </p>
            </CardContent>
          </Link>
          <CardContent className="pt-0 border-t">
            <div className="flex gap-1 mt-2">
              <TestButton type="project" size="sm" />
              <Button size="sm" variant="ghost" asChild>
                <Link to="/dashboard/projects/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Quotes Card */}
        <Card className="overflow-hidden">
          <Link to="/dashboard/quotes?status=pending" className="block cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
              <FileText className={`h-4 w-4 ${brandV1Enabled ? 'text-brand-red' : 'text-t1-red'}`} />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{isLoading ? '...' : pendingQuotes}</div>
              <p className="text-xs text-muted-foreground mt-2">
                View all quotes
                <ExternalLink className="inline ml-1 h-3 w-3" />
              </p>
            </CardContent>
          </Link>
          <CardContent className="pt-0 border-t">
            <div className="flex gap-1 mt-2">
              <TestButton type="quote" size="sm" />
              <Button size="sm" variant="ghost" asChild>
                <Link to="/dashboard/quotes/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Shipments Card */}
        <Card className="overflow-hidden">
          <Link to="/dashboard/shipments?status=active" className="block cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{isLoading ? '...' : activeShipments}</div>
              <p className="text-xs text-muted-foreground mt-2">
                View all shipments
                <ExternalLink className="inline ml-1 h-3 w-3" />
              </p>
            </CardContent>
          </Link>
          <CardContent className="pt-0 border-t">
            <div className="flex gap-1 mt-2">
              <TestButton type="shipment" size="sm" />
              <Button size="sm" variant="ghost" asChild>
                <Link to="/dashboard/shipments/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="overflow-hidden">
          <Link to="/dashboard/team" className="block cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{isLoading ? '...' : teamMembers}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Manage team
                <ExternalLink className="inline ml-1 h-3 w-3" />
              </p>
            </CardContent>
          </Link>
          <CardContent className="pt-0 border-t">
            <div className="flex gap-1 mt-2">
              <Button size="sm" variant="outline">
                <span className="text-xs">Test Invite</span>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/dashboard/team/invite">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold t-primary">
            Quick Actions
          </h2>
          <div className="flex gap-2">
            <TestButton type="message" variant="outline" size="sm" />
            <TestButton type="document" variant="outline" size="sm" />
          </div>
        </div>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Top Priorities - Expanded */}
      <div className="card-surface panel panel-body">
        <h3 className="text-lg font-semibold t-primary mb-4">
          Top Priorities
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="t-dim">Loading priorities...</div>
          ) : (
            <>
              {urgentProjects.map(project => (
                <div key={project.id} className="prio-row">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium t-primary">{project.title}</p>
                      <p className="text-sm t-dim">Priority: {project.priority === 'critical' ? 'CRITICAL' : 'High'}</p>
                    </div>
                    <StatusPill tone={project.priority === 'critical' ? 'err' : 'warn'}>
                      {project.priority === 'critical' ? 'CRITICAL' : 'High Priority'}
                    </StatusPill>
                  </div>
                </div>
              ))}
              {recentShipments.map(shipment => (
                <div key={shipment.id} className="prio-row">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium t-primary">Shipment #{shipment.tracking_number || shipment.id.slice(-6)}</p>
                      <p className="text-sm t-dim">Status: {shipment.status.replace('_', ' ')}</p>
                    </div>
                    <StatusPill tone="info">In Transit</StatusPill>
                  </div>
                </div>
              ))}
              {qualityIssues.map(workOrder => (
                <div key={workOrder.id} className="prio-row">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium t-primary">{workOrder.title}</p>
                      <p className="text-sm t-dim">Quality Review Required</p>
                    </div>
                    <StatusPill tone="err">Action Required</StatusPill>
                  </div>
                </div>
              ))}
              {urgentProjects.length === 0 && recentShipments.length === 0 && qualityIssues.length === 0 && (
                <div className="t-dim text-sm">No urgent priorities at the moment</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}