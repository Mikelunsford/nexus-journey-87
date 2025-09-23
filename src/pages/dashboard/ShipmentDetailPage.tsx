import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShipments } from '@/hooks/useShipments';
import { ArrowLeft, Package, Truck, MapPin, Clock } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';
import { format } from 'date-fns';

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shipments, updateShipment } = useShipments();
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    if (shipments && id) {
      const foundShipment = shipments.find(s => s.id === id);
      setShipment(foundShipment);
    }
  }, [shipments, id]);

  const handleStatusUpdate = async (newStatus: 'created' | 'shipped' | 'in_transit' | 'delivered') => {
    if (shipment) {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'shipped' && !shipment.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      
      if (newStatus === 'delivered' && !shipment.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
      
      await updateShipment(shipment.id, updateData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'secondary';
      case 'shipped': return 'default';
      case 'in_transit': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return Package;
      case 'shipped': return Truck;
      case 'in_transit': return Truck;
      case 'delivered': return MapPin;
      default: return Package;
    }
  };

  if (!shipment) {
    return (
      <PageSection title="Shipment Details" subtitle="Loading shipment information...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shipment...</p>
          </div>
        </div>
      </PageSection>
    );
  }

  const StatusIcon = getStatusIcon(shipment.status);

  return (
    <PageSection 
      title={`Shipment #${shipment.id.slice(-6)}`}
      subtitle="Track and manage shipment details"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/dashboard/shipments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipments
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Shipment Information
              </CardTitle>
              <Badge variant={getStatusColor(shipment.status)}>
                {shipment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Carrier</label>
                  <p className="text-base">{shipment.carrier || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                  <p className="text-base font-mono">{shipment.tracking_number || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="text-base">
                    {format(new Date(shipment.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {shipment.shipped_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shipped Date</label>
                    <p className="text-base">
                      {format(new Date(shipment.shipped_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {shipment.delivered_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivered Date</label>
                    <p className="text-base">
                      {format(new Date(shipment.delivered_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {shipment.project_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Project</label>
                    <p className="text-base">Project #{shipment.project_id.slice(-6)}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                <p className="text-base whitespace-pre-wrap">{shipment.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipment.items?.length > 0 ? (
                  <div className="space-y-3">
                    {shipment.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                            {item.weight && ` • Weight: ${item.weight} lbs`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tracking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-medium">Shipment Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(shipment.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                
                {shipment.shipped_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Shipped</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(shipment.shipped_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
                
                {shipment.delivered_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-success mt-2"></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(shipment.delivered_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shipment.status === 'created' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('shipped')}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Mark as Shipped
                </Button>
              )}
              
              {(shipment.status === 'shipped' || shipment.status === 'in_transit') && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('delivered')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
              
              {shipment.tracking_number && shipment.carrier && (
                <Button variant="outline" className="w-full">
                  Track Package
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span>{shipment.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span>
                    {shipment.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Weight:</span>
                  <span>
                    {shipment.items?.reduce((sum, item) => sum + (item.weight || 0), 0).toFixed(1) || '0.0'} lbs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageSection>
  );
}