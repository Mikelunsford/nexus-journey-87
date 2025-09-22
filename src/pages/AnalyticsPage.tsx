import React from 'react';
import QuickActionsGrid, { QAItem } from '@/components/ui/QuickActionsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Download, Calendar, Users, DollarSign, Package } from 'lucide-react';

export default function AnalyticsPage() {
  const quickActions: QAItem[] = [
    {
      label: 'Generate Report',
      to: '/dashboard/analytics/reports',
      icon: <BarChart3 className="w-4 h-4" />,
      caption: 'Create custom reports'
    },
    {
      label: 'Export Data',
      to: '/dashboard/analytics/export',
      icon: <Download className="w-4 h-4" />,
      caption: 'Download analytics data'
    },
    {
      label: 'Dashboard Settings',
      to: '/dashboard/analytics/settings',
      icon: <PieChart className="w-4 h-4" />,
      caption: 'Customize your dashboard'
    },
    {
      label: 'Schedule Reports',
      to: '/dashboard/analytics/schedule',
      icon: <Calendar className="w-4 h-4" />,
      caption: 'Automated reporting'
    }
  ];

  const kpis = [
    {
      title: 'Total Revenue',
      value: '$124,560',
      change: '+12.3%',
      trend: 'up',
      icon: DollarSign,
      color: 't-primary'
    },
    {
      title: 'Active Customers',
      value: '1,234',
      change: '+5.7%',
      trend: 'up',
      icon: Users,
      color: 't-primary'
    },
    {
      title: 'Orders Processed',
      value: '856',
      change: '-2.1%',
      trend: 'down',
      icon: Package,
      color: 't-primary'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      trend: 'up',
      icon: TrendingUp,
      color: 't-primary'
    }
  ];

  const recentMetrics = [
    { name: 'Website Traffic', value: '45,231', change: '+18%', period: 'Last 30 days' },
    { name: 'Sales Volume', value: '$28,450', change: '+12%', period: 'This month' },
    { name: 'Customer Acquisition', value: '234', change: '+25%', period: 'This week' },
    { name: 'Product Returns', value: '12', change: '-8%', period: 'Last 7 days' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">Analytics</h1>
        <p className="t-dim mt-2">Gain insights from your business data with comprehensive analytics and reporting</p>
      </div>

      {/* Quick Actions */}
      <div className="card-surface panel panel-body">
        <h2 className="text-xl font-semibold t-primary mb-6">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 t-primary" />
                    ) : (
                      <TrendingDown className="h-3 w-3 t-primary" />
                    )}
                    <span className="t-primary">
                      {kpi.change}
                    </span>
                    <span>from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Overview</span>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last 30 Days
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Performance chart will be displayed here</p>
                  <p className="text-xs">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">{metric.period}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{metric.value}</div>
                      <Badge variant={metric.change.startsWith('+') ? 'default' : 'destructive'}>
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Sales Database</div>
                    <div className="text-sm text-muted-foreground">Last sync: 2 min ago</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Customer Database</div>
                    <div className="text-sm text-muted-foreground">Last sync: 5 min ago</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">External APIs</div>
                    <div className="text-sm text-muted-foreground">Last sync: 15 min ago</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}