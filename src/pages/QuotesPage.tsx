import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';

export default function QuotesPage() {
  const quickActions: QAItem[] = [
    {
      label: 'New Quote Request',
      to: '/dashboard/quotes/new',
      caption: 'Submit new quote',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: 'Quote Templates',
      to: '/dashboard/quotes/templates',
      caption: 'Reuse common quotes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  // Mock quotes data
  const quotes = [
    {
      id: '1',
      title: 'Industrial Equipment Quote',
      customer: 'ACME Manufacturing',
      status: 'pending',
      total: 15750.00,
      created_at: '2024-01-15T10:00:00Z',
      expires_at: '2024-02-15T10:00:00Z'
    },
    {
      id: '2', 
      title: 'Bulk Materials Order',
      customer: 'Steelworks Corp',
      status: 'approved',
      total: 28900.00,
      created_at: '2024-01-10T14:30:00Z',
      expires_at: '2024-02-10T14:30:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'declined': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">Quotes</h1>
        <p className="t-dim mt-2">Manage your quote requests and track their status.</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Quote KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Total Quotes</p>
              <p className="text-2xl font-bold t-primary">{quotes.length}</p>
            </div>
            <div className="w-12 h-12 bg-t1-blue/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 t1-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Pending</p>
              <p className="text-2xl font-bold t-primary">{quotes.filter(q => q.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Approved</p>
              <p className="text-2xl font-bold t-primary">{quotes.filter(q => q.status === 'approved').length}</p>
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
              <p className="text-sm t-dim">Total Value</p>
              <p className="text-2xl font-bold t-primary">${quotes.reduce((sum, q) => sum + q.total, 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quotes List */}
      <div className="card-surface panel panel-body">
        <h3 className="text-lg font-semibold t-primary mb-4">Recent Quotes</h3>
        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No quotes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium t-primary">{quote.title}</h4>
                    <p className="text-sm t-dim">Customer: {quote.customer}</p>
                    <p className="text-sm t-dim">Created: {new Date(quote.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold t-primary">${quote.total.toLocaleString()}</p>
                    <p className={`text-sm font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </p>
                    <p className="text-xs t-dim">
                      Expires: {new Date(quote.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button variant="ghost" size="sm">View</Button>
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