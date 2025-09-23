import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuotes } from '@/hooks/useQuotes';
import { ArrowLeft, Edit, Send, CheckCircle, XCircle } from 'lucide-react';
import PageSection from '@/components/layout/PageSection';
import { format } from 'date-fns';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, updateQuote } = useQuotes();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (quotes && id) {
      const foundQuote = quotes.find(q => q.id === id);
      setQuote(foundQuote);
    }
  }, [quotes, id]);

  const handleStatusUpdate = async (newStatus: 'draft' | 'sent' | 'approved' | 'rejected') => {
    if (quote) {
      await updateQuote(quote.id, { status: newStatus });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (!quote) {
    return (
      <PageSection title="Quote Details" subtitle="Loading quote information...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quote...</p>
          </div>
        </div>
      </PageSection>
    );
  }

  const calculateSubtotal = () => {
    return quote.line_items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  };

  return (
    <PageSection 
      title={`Quote #${quote.id.slice(-6)}`}
      subtitle={`Quote for ${quote.customers?.name || 'Unknown Customer'}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/dashboard/quotes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quote Information</CardTitle>
              <Badge variant={getStatusColor(quote.status)}>
                {quote.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="text-base">{quote.customers?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Email</label>
                  <p className="text-base">{quote.customers?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="text-base">
                    {format(new Date(quote.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
                  <p className="text-base">
                    {quote.expires_at 
                      ? format(new Date(quote.expires_at), 'MMM dd, yyyy')
                      : 'No expiration'
                    }
                  </p>
                </div>
              </div>

              {quote.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-base whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.line_items?.length > 0 ? (
                  <div className="space-y-3">
                    {quote.line_items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 p-3 border rounded-lg">
                        <div className="col-span-6">
                          <p className="font-medium">{item.description}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="text-muted-foreground">${item.unit_price?.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="font-medium">${item.total?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No line items added</p>
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
              {quote.status === 'draft' && (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => handleStatusUpdate('sent')}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Quote
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Quote
                  </Button>
                </>
              )}
              
              {quote.status === 'sent' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleStatusUpdate('approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Approved
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleStatusUpdate('rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark Declined
                  </Button>
                </>
              )}
              
              {quote.status === 'approved' && (
                <Button className="w-full">
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>${quote.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{format(new Date(quote.created_at), 'MMM dd, HH:mm')}</span>
                </div>
                {quote.updated_at !== quote.created_at && (
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span>{format(new Date(quote.updated_at), 'MMM dd, HH:mm')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageSection>
  );
}