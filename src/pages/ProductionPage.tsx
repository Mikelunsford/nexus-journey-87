import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ProductionPage() {
  const quickActions: QAItem[] = [
    {
      label: 'Start Work Order',
      to: '/dashboard/production/new',
      caption: 'Create new production order',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: 'View Capacity',
      to: '/dashboard/production/capacity',
      caption: 'Check production capacity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Quality Report',
      to: '/dashboard/production/quality',
      caption: 'View quality metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Schedule Maintenance',
      to: '/dashboard/production/maintenance',
      caption: 'Plan equipment maintenance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const workOrders = [
    { id: 'WO-001', product: 'Widget A', quantity: 1000, status: 'In Progress', progress: 75, priority: 'High' },
    { id: 'WO-002', product: 'Component B', quantity: 500, status: 'Completed', progress: 100, priority: 'Medium' },
    { id: 'WO-003', product: 'Assembly C', quantity: 250, status: 'Pending', progress: 0, priority: 'Low' },
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="t-primary text-2xl md:text-3xl font-semibold">Production</h1>
        <p className="t-dim mt-1">
          Manage manufacturing operations and track production metrics.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="panel p-5">
        <h2 className="t-primary text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Production KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">24</div>
            <div className="kpi-label">Active Orders</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">87%</div>
            <div className="kpi-label">Efficiency</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">98.5%</div>
            <div className="kpi-label">Quality Rate</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">2.3h</div>
            <div className="kpi-label">Avg Cycle Time</div>
          </div>
        </div>
      </div>

      {/* Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Order ID</th>
                  <th className="text-left p-4 font-semibold">Product</th>
                  <th className="text-left p-4 font-semibold">Quantity</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Priority</th>
                  <th className="text-left p-4 font-semibold">Progress</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{order.id}</td>
                    <td className="p-4">{order.product}</td>
                    <td className="p-4">{order.quantity}</td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={getPriorityVariant(order.priority)}>
                        {order.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Progress value={order.progress} className="w-20" />
                        <span className="text-sm text-muted-foreground">{order.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}