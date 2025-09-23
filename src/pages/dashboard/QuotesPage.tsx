import React, { useState } from 'react';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestButton } from '@/components/ui/TestButton';
import { Plus, FileText, DollarSign, Calendar, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default function QuotesPage() {
  const { quotes, loading } = useQuotes();
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter quotes based on status
  const filteredQuotes = quotes.filter(quote => {
    if (statusFilter === 'all') return true;
    return quote.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'outline';
      case 'approved': return 'default';
      case 'declined': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quotes</h1>
          <div className="flex gap-2">
            <TestButton type="quote" />
            <Button asChild>
              <Link to="/dashboard/quotes/new">
                <Plus className="h-4 w-4 mr-2" />
                New Quote
              </Link>
            </Button>
          </div>
        </div>
        <div className="text-center py-8">Loading quotes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">
            Manage your project quotes and proposals
          </p>
        </div>
        <div className="flex gap-2">
          <TestButton type="quote" />
          <Button asChild>
            <Link to="/dashboard/quotes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
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
            {['all', 'draft', 'sent', 'approved', 'declined'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No quotes found</p>
                <p className="text-muted-foreground">
                  {statusFilter === 'all' 
                    ? "Get started by creating your first quote"
                    : `No quotes with status "${statusFilter}"`
                  }
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <TestButton type="quote" variant="outline" />
                <Button asChild>
                  <Link to="/dashboard/quotes/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quote
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map(quote => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={`/dashboard/quotes/${quote.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Quote #{quote.id.slice(-6)}
                    </CardTitle>
                    <Badge variant={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {quote.customer?.name || 'Unknown Customer'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-semibold flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(quote.total)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {quote.expires_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expires</span>
                        <span className="text-sm text-orange-600">
                          {format(new Date(quote.expires_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    {quote.line_items && Array.isArray(quote.line_items) && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          {quote.line_items.length} item{quote.line_items.length !== 1 ? 's' : ''}
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