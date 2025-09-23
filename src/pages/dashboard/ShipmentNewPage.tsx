import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProjects } from '@/hooks/useProjects';
import { useShipments } from '@/hooks/useShipments';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';

interface ShipmentFormData {
  project_id?: string;
  address: string;
  carrier?: string;
  tracking_number?: string;
  items: Array<{
    description: string;
    quantity: number;
    weight?: number;
  }>;
}

const carriers = [
  'UPS',
  'FedEx', 
  'USPS',
  'DHL',
  'Local Delivery',
  'Customer Pickup'
];

export default function ShipmentNewPage() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { createShipment } = useShipments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShipmentFormData>({
    defaultValues: {
      project_id: '',
      address: '',
      carrier: '',
      tracking_number: '',
      items: [{ description: '', quantity: 1, weight: 0 }],
    },
  });

  const watchedItems = form.watch('items');

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      { description: '', quantity: 1, weight: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: ShipmentFormData) => {
    setIsSubmitting(true);
    try {
      await createShipment({
        ...data,
        status: 'created',
        metadata: {
          total_items: data.items.length,
          total_weight: data.items.reduce((sum, item) => sum + (item.weight || 0), 0)
        }
      });
      
      toast({
        title: 'Success',
        description: 'Shipment created successfully',
      });
      
      navigate('/dashboard/shipments');
    } catch (error) {
      console.error('Error creating shipment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageSection 
      title="New Shipment" 
      subtitle="Create a new shipment"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard/shipments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shipments
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shipment Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No Project</SelectItem>
                            {projectsLoading ? (
                              <SelectItem value="" disabled>Loading projects...</SelectItem>
                            ) : (
                              projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ required: 'Delivery address is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter full delivery address..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carrier</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select carrier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {carriers.map((carrier) => (
                                <SelectItem key={carrier} value={carrier}>
                                  {carrier}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tracking_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tracking Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tracking number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchedItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-6">
                          <Label htmlFor={`item-${index}-description`}>Description</Label>
                          <Input
                            id={`item-${index}-description`}
                            placeholder="Item description"
                            {...form.register(`items.${index}.description`)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                          <Input
                            id={`item-${index}-quantity`}
                            type="number"
                            min="1"
                            {...form.register(`items.${index}.quantity`, {
                              valueAsNumber: true
                            })}
                          />
                        </div>
                        <div className="col-span-3">
                          <Label htmlFor={`item-${index}-weight`}>Weight (lbs)</Label>
                          <Input
                            id={`item-${index}-weight`}
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            {...form.register(`items.${index}.weight`, {
                              valueAsNumber: true
                            })}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={watchedItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span>{watchedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Quantity:</span>
                      <span>{watchedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Weight:</span>
                      <span>{watchedItems.reduce((sum, item) => sum + (item.weight || 0), 0).toFixed(1)} lbs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This shipment will be created with status: <span className="font-medium">Created</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/shipments')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </Form>
    </PageSection>
  );
}