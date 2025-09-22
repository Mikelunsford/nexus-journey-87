import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { Badge } from '@/components/ui/badge';

export default function ShippingPage() {
  const quickActions: QAItem[] = [
    {
      label: 'Create Shipment',
      to: '/dashboard/shipping/new',
      caption: 'Schedule new shipment',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: 'Track Package',
      to: '/dashboard/shipping/tracking',
      caption: 'Track shipment status',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Manage Routes',
      to: '/dashboard/shipping/routes',
      caption: 'Optimize delivery routes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      label: 'Carrier Rates',
      to: '/dashboard/carriers',
      caption: 'Compare shipping rates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
  ];

  const shipments = [
    { id: 'SH-001', customer: 'ACME Corp', destination: 'New York, NY', status: 'In Transit', carrier: 'FedEx', trackingId: 'FX123456789' },
    { id: 'SH-002', customer: 'TechStart Inc', destination: 'Los Angeles, CA', status: 'Delivered', carrier: 'UPS', trackingId: 'UP987654321' },
    { id: 'SH-003', customer: 'Global Industries', destination: 'Chicago, IL', status: 'Pending', carrier: 'DHL', trackingId: 'DH456789123' },
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'In Transit': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="t-primary text-2xl md:text-3xl font-semibold">Shipping</h1>
        <p className="t-dim mt-1">
          Manage shipments, track deliveries, and optimize logistics operations.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="panel p-5">
        <h2 className="t-primary text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Shipping KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">156</div>
            <div className="kpi-label">Active Shipments</div>
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
            <div className="kpi-label">On-Time Delivery</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">2.1</div>
            <div className="kpi-label">Avg Transit Days</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">$8,450</div>
            <div className="kpi-label">Monthly Costs</div>
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Shipment ID</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Destination</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Carrier</th>
                  <th className="text-left p-4 font-semibold">Tracking ID</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{shipment.id}</td>
                    <td className="p-4">{shipment.customer}</td>
                    <td className="p-4">{shipment.destination}</td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </td>
                    <td className="p-4">{shipment.carrier}</td>
                    <td className="p-4 font-mono text-sm">{shipment.trackingId}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">Track</Button>
                        <Button variant="ghost" size="sm">Details</Button>
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