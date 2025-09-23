import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { useShipments } from '@/hooks/useShipments';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function ShipmentsPage() {
  const [testSeedsEnabled] = useFeatureFlag('ui.enable_test_seeds');
  const { shipments, loading, error } = useShipments(testSeedsEnabled);
  const quickActions: QAItem[] = [
    {
      label: 'Track Shipment',
      to: '/dashboard/shipments/tracking',
      caption: 'Track existing shipment',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      label: 'Schedule Pickup',
      to: '/dashboard/shipments/schedule',
      caption: 'Arrange carrier pickup',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6M3 21h18a2 2 0 002-2V9a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'text-blue-600';
      case 'in_transit': return 'text-yellow-600';
      case 'delivered': return 'text-green-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created': return 'Created';
      case 'shipped': return 'Shipped';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'delayed': return 'Delayed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold t-primary">Shipments</h1>
          <p className="t-dim mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold t-primary">Shipments</h1>
          <p className="t-dim mt-2 text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">Shipments</h1>
        <p className="t-dim mt-2">Track and manage your shipments and deliveries.</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Shipment KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Total Shipments</p>
              <p className="text-2xl font-bold t-primary">{shipments.length}</p>
            </div>
            <div className="w-12 h-12 bg-t1-blue/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 t1-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">In Transit</p>
              <p className="text-2xl font-bold t-primary">{shipments.filter(s => s.status === 'in_transit').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Delivered</p>
              <p className="text-2xl font-bold t-primary">{shipments.filter(s => s.status === 'delivered').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">On Time Rate</p>
              <p className="text-2xl font-bold t-primary">94%</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="card-surface panel panel-body">
        <h3 className="text-lg font-semibold t-primary mb-4">Recent Shipments</h3>
        {shipments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No shipments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium t-primary">{shipment.tracking_number || `#${shipment.id.slice(0, 8)}`}{(shipment as any).is_test ? ' (Test)' : ''}</h4>
                      <span className={`text-sm font-medium ${getStatusColor(shipment.status)}`}>
                        {getStatusBadge(shipment.status)}
                      </span>
                    </div>
                    <p className="text-sm t-dim">Carrier: {shipment.carrier || 'Not assigned'}</p>
                    <p className="text-sm t-dim">To: {shipment.address}</p>
                    {shipment.projects?.customers?.name && (
                      <p className="text-sm t-dim">Customer: {shipment.projects.customers.name}</p>
                    )}
                    <p className="text-sm t-dim">
                      Created: {new Date(shipment.created_at).toLocaleDateString()}
                    </p>
                    {shipment.shipped_at && (
                      <p className="text-sm t-dim">
                        Shipped: {new Date(shipment.shipped_at).toLocaleDateString()}
                      </p>
                    )}
                    {shipment.delivered_at && (
                      <p className="text-sm text-green-600">
                        Delivered: {new Date(shipment.delivered_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button variant="ghost" size="sm">Track</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}