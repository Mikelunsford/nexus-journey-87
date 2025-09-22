import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { Badge } from '@/components/ui/badge';

export default function CarriersPage() {
  const quickActions: QAItem[] = [
    {
      label: 'Add Carrier',
      to: '/dashboard/carriers/new',
      caption: 'Register new carrier',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: 'Rate Comparison',
      to: '/dashboard/carriers/rates',
      caption: 'Compare shipping rates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Service Areas',
      to: '/dashboard/carriers/coverage',
      caption: 'View coverage maps',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Performance Reports',
      to: '/dashboard/carriers/reports',
      caption: 'Analyze carrier metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const carriers = [
    { id: 'CAR-001', name: 'FedEx Express', type: 'Express', status: 'Active', avgRating: 4.8, totalShipments: 1250, onTimeRate: 96.5 },
    { id: 'CAR-002', name: 'UPS Ground', type: 'Ground', status: 'Active', avgRating: 4.6, totalShipments: 980, onTimeRate: 94.2 },
    { id: 'CAR-003', name: 'DHL International', type: 'International', status: 'Inactive', avgRating: 4.4, totalShipments: 420, onTimeRate: 91.8 },
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Express': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Ground': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'International': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="t-primary text-2xl md:text-3xl font-semibold">Carriers</h1>
        <p className="t-dim mt-1">
          Manage shipping carriers, compare rates, and track performance metrics.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="panel p-5">
        <h2 className="t-primary text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Carrier KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-1" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">12</div>
            <div className="kpi-label">Active Carriers</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">$3.45</div>
            <div className="kpi-label">Avg Rate/lb</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">4.6</div>
            <div className="kpi-label">Avg Rating</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">94.2%</div>
            <div className="kpi-label">On-Time Rate</div>
          </div>
        </div>
      </div>

      {/* Carriers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Carrier</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Rating</th>
                  <th className="text-left p-4 font-semibold">Shipments</th>
                  <th className="text-left p-4 font-semibold">On-Time Rate</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {carriers.map((carrier) => (
                  <tr key={carrier.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{carrier.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(carrier.type)}`}>
                        {carrier.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(carrier.status)}>
                        {carrier.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">{carrier.avgRating}</span>
                      </div>
                    </td>
                    <td className="p-4">{carrier.totalShipments.toLocaleString()}</td>
                    <td className="p-4">{carrier.onTimeRate}%</td>
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