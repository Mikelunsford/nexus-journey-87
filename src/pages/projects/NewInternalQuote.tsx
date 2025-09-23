import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calculator } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';

interface InternalQuoteFormData {
  title: string;
  description: string;
  estimated_hours: number;
  hourly_rate: number;
  materials_cost: number;
  overhead_percentage: number;
}

export default function NewInternalQuote() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InternalQuoteFormData>({
    defaultValues: {
      title: '',
      description: '',
      estimated_hours: 0,
      hourly_rate: 75,
      materials_cost: 0,
      overhead_percentage: 15,
    },
  });

  const watchedValues = form.watch();

  const calculateLaborCost = () => {
    return watchedValues.estimated_hours * watchedValues.hourly_rate;
  };

  const calculateOverhead = () => {
    const laborCost = calculateLaborCost();
    return laborCost * (watchedValues.overhead_percentage / 100);
  };

  const calculateTotal = () => {
    return calculateLaborCost() + watchedValues.materials_cost + calculateOverhead();
  };

  const onSubmit = async (data: InternalQuoteFormData) => {
    setIsSubmitting(true);
    try {
      // Here we would typically save the internal quote
      // For now, we'll just show a success message
      
      toast({
        title: 'Success',
        description: 'Internal quote created successfully',
      });
      
      navigate('/dashboard/projects');
    } catch (error) {
      console.error('Error creating internal quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageSection 
      title="New Internal Quote" 
      subtitle="Create an internal cost estimate"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
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
                  <CardTitle>Quote Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: 'Quote title is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quote Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter quote title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the work to be done..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estimated_hours"
                      rules={{ required: 'Estimated hours is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Hours</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourly_rate"
                      rules={{ required: 'Hourly rate is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="75.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="materials_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materials Cost ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overhead_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overhead (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              placeholder="15"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Cost Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Labor Cost:</span>
                      <span className="font-medium">${calculateLaborCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Materials:</span>
                      <span className="font-medium">${watchedValues.materials_cost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Overhead ({watchedValues.overhead_percentage}%):
                      </span>
                      <span className="font-medium">${calculateOverhead().toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span className="text-lg">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hours:</span>
                      <span>{watchedValues.estimated_hours || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate/Hour:</span>
                      <span>${watchedValues.hourly_rate || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overhead:</span>
                      <span>{watchedValues.overhead_percentage || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is an internal cost estimate for planning purposes. 
                    It can be used as a basis for creating customer quotes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/projects')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Internal Quote'}
            </Button>
          </div>
        </form>
      </Form>
    </PageSection>
  );
}