import React, { useState } from 'react';
import { useShipments } from '@/hooks/useShipments';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestButton } from '@/components/ui/TestButton';
import { Plus, Truck, MapPin, Calendar, Filter, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function ShipmentsPage() {
  const { shipments, loading } = useShipments();
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter shipments based on status
  const filteredShipments = shipments.filter(shipment => {
    if (statusFilter === 'all') return true;
    return shipment.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'secondary';
      case 'in_transit': return 'default';
      case 'delivered': return 'outline';
      case 'returned': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <MapPin className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shipments</h1>
          <div className="flex gap-2">
            <TestButton type="shipment" />
            <Button asChild>
              <Link to="/dashboard/shipments/new">
                <Plus className="h-4 w-4 mr-2" />
                New Shipment
              </Link>
            </Button>
          </div>
        </div>
        <div className="text-center py-8">Loading shipments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipments</h1>
          <p className="text-muted-foreground">
            Track your project deliveries and shipments
          </p>
        </div>
        <div className="flex gap-2">
          <TestButton type="shipment" />
          <Button asChild>
            <Link to="/dashboard/shipments/new">
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['all', 'created', 'in_transit', 'delivered', 'returned'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipments Grid */}
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No shipments found</p>
                <p className="text-muted-foreground">
                  {statusFilter === 'all' 
                    ? "Create your first shipment to start tracking deliveries"
                    : `No shipments with status "${statusFilter.replace('_', ' ')}"`
                  }
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <TestButton type="shipment" variant="outline" />
                <Button asChild>
                  <Link to="/dashboard/shipments/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Shipment
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShipments.map(shipment => (
            <Card key={shipment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={`/dashboard/shipments/${shipment.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(shipment.status)}
                      #{shipment.tracking_number || shipment.id.slice(-6)}
                    </CardTitle>
                    <Badge variant={getStatusColor(shipment.status)}>
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>
                    {shipment.carrier || 'Standard Delivery'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {shipment.address}
                      </span>
                    </div>
                    
                    {shipment.shipped_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Shipped</span>
                        <span className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(shipment.shipped_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    {shipment.delivered_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Delivered</span>
                        <span className="text-sm text-green-600">
                          {format(new Date(shipment.delivered_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    {shipment.items && Array.isArray(shipment.items) && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          {shipment.items.length} item{shipment.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {shipment.metadata?.estimated_delivery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ETA</span>
                        <span className="text-sm text-orange-600">
                          {format(new Date(shipment.metadata.estimated_delivery), 'MMM d')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}