import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { Badge } from '@/components/ui/badge';

export default function AccountingPage() {
  const quickActions: QAItem[] = [
    {
      label: 'Create Invoice',
      to: '/dashboard/accounting/invoices/new',
      caption: 'Generate new invoice',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: 'Record Payment',
      to: '/dashboard/accounting/payments/new',
      caption: 'Process payment entry',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      label: 'Financial Reports',
      to: '/dashboard/accounting/reports',
      caption: 'View P&L, balance sheet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Tax Documents',
      to: '/dashboard/accounting/tax',
      caption: 'Manage tax filings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const transactions = [
    { id: 'TXN-001', type: 'Invoice', customer: 'ACME Corporation', amount: 15750.00, status: 'Paid', date: '2024-01-15' },
    { id: 'TXN-002', type: 'Payment', customer: 'TechStart Inc', amount: 8900.00, status: 'Pending', date: '2024-01-14' },
    { id: 'TXN-003', type: 'Expense', customer: 'Office Supplies Co', amount: -350.00, status: 'Processed', date: '2024-01-13' },
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Processed': return 'default';
      case 'Pending': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Invoice': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Payment': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Expense': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="t-primary text-2xl md:text-3xl font-semibold">Accounting</h1>
        <p className="t-dim mt-1">
          Manage invoices, payments, and financial reporting for your business.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="panel p-5">
        <h2 className="t-primary text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">$284,750</div>
            <div className="kpi-label">Monthly Revenue</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">$42,830</div>
            <div className="kpi-label">Outstanding Invoices</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">$18,920</div>
            <div className="kpi-label">Monthly Expenses</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">$265,830</div>
            <div className="kpi-label">Net Profit</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Transaction ID</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Customer/Vendor</th>
                  <th className="text-left p-4 font-semibold">Amount</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{transaction.id}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="p-4">{transaction.customer}</td>
                    <td className="p-4">
                      <span className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{transaction.date}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
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