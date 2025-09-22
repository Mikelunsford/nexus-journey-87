import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThroughputChart } from '@/components/charts/ThroughputChart';
import { ExportDialog } from '@/components/ui/ExportDialog';
import { OperationalKPIs } from '@/lib/analytics/operationalKPIs';
import { MetricsCalculator } from '@/lib/analytics/metricsCalculator';
import PageSection from '@/components/layout/PageSection';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockData = {
    projects: [
      { 
        id: '1', 
        customerId: 'cust-1',
        title: 'Sample Project Alpha',
        status: 'completed' as const, 
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
      },
      { 
        id: '2', 
        customerId: 'cust-2',
        title: 'Sample Project Beta',
        status: 'completed' as const, 
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() 
      },
    ],
    workOrders: [
      { id: '1', status: 'done' as const, createdAt: new Date().toISOString(), projectId: '1' },
      { id: '2', status: 'done' as const, createdAt: new Date().toISOString(), projectId: '2' },
    ]
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      const range = MetricsCalculator.getDateRange(selectedPeriod);
      const previousRange = {
        start: new Date(range.start.getTime() - (range.end.getTime() - range.start.getTime())),
        end: range.start
      };

      const throughputMetric = OperationalKPIs.calculateThroughput(mockData, range, previousRange);
      
      setMetrics({
        throughput: throughputMetric,
        totalProjects: mockData.projects.length,
        completedTasks: mockData.workOrders.length,
        avgCycleTime: 5.2,
        slaCompliance: 94.5
      });
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  const kpiCards = [
    {
      title: 'Throughput',
      value: metrics?.throughput.current || 0,
      change: metrics?.throughput.changePercent || 0,
      trend: metrics?.throughput.trend || 'stable',
      icon: TrendingUp,
      unit: 'items'
    },
    {
      title: 'Avg Cycle Time',
      value: metrics?.avgCycleTime || 0,
      change: -12.5,
      trend: 'down' as const,
      icon: Clock,
      unit: 'days'
    },
    {
      title: 'SLA Compliance',
      value: metrics?.slaCompliance || 0,
      change: 2.3,
      trend: 'up' as const,
      icon: Target,
      unit: '%'
    },
    {
      title: 'Active Projects',
      value: metrics?.totalProjects || 0,
      change: 0,
      trend: 'stable' as const,
      icon: Users,
      unit: 'projects'
    }
  ];

  return (
    <PageSection 
      title="Operational Reports" 
      subtitle="Analytics and performance metrics for operations"
      actions={
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: '7d' | '30d' | '90d') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <ExportDialog 
            reportType="analytics-throughput"
            data={metrics?.throughput.timeSeries || []}
            trigger={
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Export
              </Button>
            }
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.value} {kpi.unit === '%' ? '%' : ''}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant={kpi.trend === 'up' ? 'default' : kpi.trend === 'down' ? 'destructive' : 'secondary'}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                  </Badge>
                  <span>vs previous period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Throughput Trend</CardTitle>
            <CardDescription>Daily completion rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
              </div>
            ) : (
              <ThroughputChart 
                data={metrics?.throughput.timeSeries || []} 
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}