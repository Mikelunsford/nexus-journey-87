import { differenceInDays } from 'date-fns';
import type { Invoice } from './arAging';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'ach' | 'wire' | 'other';
  reference?: string;
  notes?: string;
  processedBy: string;
  status: 'pending' | 'processed' | 'failed' | 'refunded';
  createdAt: Date;
}

export interface PaymentSummary {
  totalPaid: number;
  remainingBalance: number;
  paymentCount: number;
  lastPaymentDate?: Date;
  averagePaymentAmount: number;
  paymentMethods: Record<string, number>;
}

export interface PaymentAnalytics {
  averageDaysToPayment: number;
  paymentMethodDistribution: Array<{ method: string; count: number; percentage: number }>;
  monthlyCollections: Array<{ month: string; amount: number; count: number }>;
  partialPaymentRate: number;
  fullPaymentRate: number;
}

export class PaymentTracker {
  static calculatePaymentSummary(invoice: Invoice, payments: Payment[]): PaymentSummary {
    const invoicePayments = payments.filter(p => 
      p.invoiceId === invoice.id && p.status === 'processed'
    );
    
    const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = Math.max(0, invoice.totalAmount - totalPaid);
    const paymentCount = invoicePayments.length;
    
    const lastPaymentDate = invoicePayments.length > 0 
      ? invoicePayments.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())[0].paymentDate
      : undefined;
    
    const averagePaymentAmount = paymentCount > 0 ? totalPaid / paymentCount : 0;
    
    // Payment method distribution
    const paymentMethods: Record<string, number> = {};
    invoicePayments.forEach(p => {
      paymentMethods[p.paymentMethod] = (paymentMethods[p.paymentMethod] || 0) + p.amount;
    });
    
    return {
      totalPaid,
      remainingBalance,
      paymentCount,
      lastPaymentDate,
      averagePaymentAmount,
      paymentMethods
    };
  }

  static analyzePaymentPatterns(
    invoices: Invoice[],
    payments: Payment[],
    startDate: Date,
    endDate: Date
  ): PaymentAnalytics {
    // Filter to paid invoices in the date range
    const paidInvoices = invoices.filter(inv => 
      inv.status === 'paid' && 
      inv.paidDate &&
      inv.paidDate >= startDate && 
      inv.paidDate <= endDate
    );

    // Calculate average days to payment
    const paymentDelays = paidInvoices
      .filter(inv => inv.sentDate && inv.paidDate)
      .map(inv => differenceInDays(inv.paidDate!, inv.sentDate!));
    
    const averageDaysToPayment = paymentDelays.length > 0 
      ? paymentDelays.reduce((sum, days) => sum + days, 0) / paymentDelays.length 
      : 0;

    // Payment method distribution
    const relevantPayments = payments.filter(p => 
      p.paymentDate >= startDate && 
      p.paymentDate <= endDate && 
      p.status === 'processed'
    );

    const methodCounts: Record<string, number> = {};
    relevantPayments.forEach(p => {
      methodCounts[p.paymentMethod] = (methodCounts[p.paymentMethod] || 0) + 1;
    });

    const totalPayments = relevantPayments.length;
    const paymentMethodDistribution = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count,
      percentage: totalPayments > 0 ? (count / totalPayments) * 100 : 0
    }));

    // Monthly collections
    const monthlyData: Record<string, { amount: number; count: number }> = {};
    relevantPayments.forEach(p => {
      const monthKey = `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { amount: 0, count: 0 };
      }
      monthlyData[monthKey].amount += p.amount;
      monthlyData[monthKey].count += 1;
    });

    const monthlyCollections = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Partial vs full payment rates
    const invoicesWithPayments = invoices.filter(inv => 
      payments.some(p => p.invoiceId === inv.id && p.status === 'processed')
    );

    const partialPayments = invoicesWithPayments.filter(inv => {
      const totalPaid = payments
        .filter(p => p.invoiceId === inv.id && p.status === 'processed')
        .reduce((sum, p) => sum + p.amount, 0);
      return totalPaid < inv.totalAmount && totalPaid > 0;
    });

    const fullPayments = invoicesWithPayments.filter(inv => {
      const totalPaid = payments
        .filter(p => p.invoiceId === inv.id && p.status === 'processed')
        .reduce((sum, p) => sum + p.amount, 0);
      return totalPaid >= inv.totalAmount;
    });

    const partialPaymentRate = invoicesWithPayments.length > 0 
      ? (partialPayments.length / invoicesWithPayments.length) * 100 
      : 0;
    
    const fullPaymentRate = invoicesWithPayments.length > 0 
      ? (fullPayments.length / invoicesWithPayments.length) * 100 
      : 0;

    return {
      averageDaysToPayment,
      paymentMethodDistribution,
      monthlyCollections,
      partialPaymentRate,
      fullPaymentRate
    };
  }

  static getOutstandingPayments(invoices: Invoice[], payments: Payment[]): Array<{
    invoice: Invoice;
    totalPaid: number;
    remainingBalance: number;
    daysPastDue: number;
  }> {
    const today = new Date();
    
    return invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'draft')
      .map(invoice => {
        const totalPaid = payments
          .filter(p => p.invoiceId === invoice.id && p.status === 'processed')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const remainingBalance = invoice.totalAmount - totalPaid;
        const daysPastDue = Math.max(0, differenceInDays(today, invoice.dueDate));
        
        return {
          invoice,
          totalPaid,
          remainingBalance,
          daysPastDue
        };
      })
      .filter(item => item.remainingBalance > 0)
      .sort((a, b) => b.daysPastDue - a.daysPastDue);
  }

  static recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: Payment['paymentMethod'],
    reference?: string,
    notes?: string,
    processedBy: string = 'system'
  ): Payment {
    return {
      id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceId,
      amount,
      paymentDate: new Date(),
      paymentMethod,
      reference,
      notes,
      processedBy,
      status: 'processed',
      createdAt: new Date()
    };
  }

  static validatePayment(payment: Payment, invoice: Invoice, existingPayments: Payment[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (payment.amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    // Check if payment exceeds remaining balance
    const totalPaid = existingPayments
      .filter(p => p.invoiceId === invoice.id && p.status === 'processed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const remainingBalance = invoice.totalAmount - totalPaid;
    
    if (payment.amount > remainingBalance) {
      warnings.push(`Payment amount (${payment.amount}) exceeds remaining balance (${remainingBalance})`);
    }

    // Check for duplicate payments (same amount on same day)
    const duplicatePayments = existingPayments.filter(p =>
      p.invoiceId === invoice.id &&
      p.amount === payment.amount &&
      p.paymentDate.toDateString() === payment.paymentDate.toDateString() &&
      p.status === 'processed'
    );

    if (duplicatePayments.length > 0) {
      warnings.push('Similar payment already exists for this invoice on the same date');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}