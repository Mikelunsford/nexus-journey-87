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
import { useCustomers } from '@/hooks/useCustomers';
import { useQuotes } from '@/hooks/useQuotes';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';

interface QuoteFormData {
  customer_id: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  notes?: string;
  expires_at?: string;
}

export default function QuoteNewPage() {
  const navigate = useNavigate();
  const { customers, loading: customersLoading } = useCustomers();
  const { createQuote } = useQuotes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteFormData>({
    defaultValues: {
      customer_id: '',
      line_items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
      notes: '',
      expires_at: '',
    },
  });

  const watchedLineItems = form.watch('line_items');

  const addLineItem = () => {
    const currentItems = form.getValues('line_items');
    form.setValue('line_items', [
      ...currentItems,
      { description: '', quantity: 1, unit_price: 0, total: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues('line_items');
    if (currentItems.length > 1) {
      form.setValue('line_items', currentItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const currentItems = form.getValues('line_items');
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      unit_price: unitPrice,
      total: quantity * unitPrice
    };
    form.setValue('line_items', updatedItems);
  };

  const calculateTotal = () => {
    return watchedLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      await createQuote({
        ...data,
        total,
        status: 'draft'
      });
      
      toast({
        title: 'Success',
        description: 'Quote created successfully',
      });
      
      navigate('/dashboard/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageSection 
      title="New Quote" 
      subtitle="Create a new quote for a customer"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard/quotes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotes
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quote Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    rules={{ required: 'Please select a customer' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customersLoading ? (
                              <SelectItem value="" disabled>Loading customers...</SelectItem>
                            ) : (
                              customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
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
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Line Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchedLineItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label htmlFor={`item-${index}-description`}>Description</Label>
                          <Input
                            id={`item-${index}-description`}
                            placeholder="Item description"
                            {...form.register(`line_items.${index}.description`)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`item-${index}-quantity`}>Qty</Label>
                          <Input
                            id={`item-${index}-quantity`}
                            type="number"
                            min="1"
                            {...form.register(`line_items.${index}.quantity`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                const quantity = parseFloat(e.target.value) || 0;
                                const unitPrice = form.getValues(`line_items.${index}.unit_price`);
                                updateLineItemTotal(index, quantity, unitPrice);
                              }
                            })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`item-${index}-price`}>Unit Price</Label>
                          <Input
                            id={`item-${index}-price`}
                            type="number"
                            step="0.01"
                            min="0"
                            {...form.register(`line_items.${index}.unit_price`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                const unitPrice = parseFloat(e.target.value) || 0;
                                const quantity = form.getValues(`line_items.${index}.quantity`);
                                updateLineItemTotal(index, quantity, unitPrice);
                              }
                            })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Total</Label>
                          <Input
                            value={`$${(item.total || 0).toFixed(2)}`}
                            disabled
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={watchedLineItems.length === 1}
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
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/quotes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </form>
      </Form>
    </PageSection>
  );
}