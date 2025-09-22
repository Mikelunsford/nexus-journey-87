import { differenceInDays, isAfter, isBefore } from 'date-fns';

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled';
  sentDate?: Date;
  paidDate?: Date;
}

export interface ARAgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  count: number;
  totalAmount: number;
  invoices: Invoice[];
}

export interface ARAgingReport {
  totalOutstanding: number;
  totalInvoices: number;
  buckets: ARAgingBucket[];
  averageDaysOutstanding: number;
  oldestInvoice: Invoice | null;
}

export interface ARTrend {
  date: string;
  totalOutstanding: number;
  currentBucket: number;
  bucket30: number;
  bucket60: number;
  bucket90: number;
  bucketOver90: number;
}

export class ARAgingCalculator {
  private static readonly AGING_BUCKETS = [
    { label: 'Current (0-30 days)', minDays: 0, maxDays: 30 },
    { label: '31-60 days', minDays: 31, maxDays: 60 },
    { label: '61-90 days', minDays: 61, maxDays: 90 },
    { label: 'Over 90 days', minDays: 91, maxDays: null }
  ];

  static calculateARAge(invoice: Invoice, asOfDate: Date = new Date()): number {
    // Use due date as the baseline for aging
    return differenceInDays(asOfDate, invoice.dueDate);
  }

  static categorizeInvoiceByAge(invoice: Invoice, asOfDate: Date = new Date()): string {
    const age = this.calculateARAge(invoice, asOfDate);
    
    if (age <= 30) return 'current';
    if (age <= 60) return '31-60';
    if (age <= 90) return '61-90';
    return 'over90';
  }

  static generateARAgingReport(
    invoices: Invoice[], 
    asOfDate: Date = new Date()
  ): ARAgingReport {
    // Filter to only unpaid invoices
    const unpaidInvoices = invoices.filter(inv => 
      inv.status !== 'paid' && 
      inv.status !== 'cancelled' && 
      inv.status !== 'draft' &&
      inv.paidAmount < inv.totalAmount
    );

    const buckets: ARAgingBucket[] = this.AGING_BUCKETS.map(bucketDef => {
      const bucketInvoices = unpaidInvoices.filter(invoice => {
        const age = this.calculateARAge(invoice, asOfDate);
        
        if (bucketDef.maxDays === null) {
          return age >= bucketDef.minDays;
        }
        
        return age >= bucketDef.minDays && age <= bucketDef.maxDays;
      });

      const totalAmount = bucketInvoices.reduce((sum, inv) => 
        sum + (inv.totalAmount - inv.paidAmount), 0
      );

      return {
        label: bucketDef.label,
        minDays: bucketDef.minDays,
        maxDays: bucketDef.maxDays,
        count: bucketInvoices.length,
        totalAmount,
        invoices: bucketInvoices
      };
    });

    const totalOutstanding = buckets.reduce((sum, bucket) => sum + bucket.totalAmount, 0);
    const totalInvoices = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
    
    // Calculate average days outstanding
    const totalDaysWeighted = unpaidInvoices.reduce((sum, invoice) => {
      const age = this.calculateARAge(invoice, asOfDate);
      const outstandingAmount = invoice.totalAmount - invoice.paidAmount;
      return sum + (age * outstandingAmount);
    }, 0);
    
    const averageDaysOutstanding = totalOutstanding > 0 ? totalDaysWeighted / totalOutstanding : 0;
    
    // Find oldest invoice
    const oldestInvoice = unpaidInvoices.reduce((oldest, invoice) => {
      if (!oldest) return invoice;
      const currentAge = this.calculateARAge(invoice, asOfDate);
      const oldestAge = this.calculateARAge(oldest, asOfDate);
      return currentAge > oldestAge ? invoice : oldest;
    }, null as Invoice | null);

    return {
      totalOutstanding,
      totalInvoices,
      buckets,
      averageDaysOutstanding,
      oldestInvoice
    };
  }

  static generateARTrend(
    invoices: Invoice[],
    startDate: Date,
    endDate: Date,
    intervalDays: number = 7
  ): ARTrend[] {
    const trends: ARTrend[] = [];
    const totalDays = differenceInDays(endDate, startDate);
    
    for (let i = 0; i <= totalDays; i += intervalDays) {
      const snapshotDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      
      // Get invoices that existed at this snapshot date
      const relevantInvoices = invoices.filter(inv => 
        inv.invoiceDate <= snapshotDate && 
        (inv.status !== 'paid' || !inv.paidDate || inv.paidDate > snapshotDate)
      );
      
      const report = this.generateARAgingReport(relevantInvoices, snapshotDate);
      
      trends.push({
        date: snapshotDate.toISOString().split('T')[0],
        totalOutstanding: report.totalOutstanding,
        currentBucket: report.buckets[0]?.totalAmount || 0,
        bucket30: report.buckets[1]?.totalAmount || 0,
        bucket60: report.buckets[2]?.totalAmount || 0,
        bucket90: report.buckets[3]?.totalAmount || 0,
        bucketOver90: report.buckets[3]?.totalAmount || 0
      });
    }
    
    return trends;
  }

  static getHighRiskInvoices(
    invoices: Invoice[],
    riskThresholdDays: number = 60,
    asOfDate: Date = new Date()
  ): Invoice[] {
    return invoices
      .filter(inv => 
        inv.status !== 'paid' && 
        inv.status !== 'cancelled' && 
        inv.status !== 'draft'
      )
      .filter(inv => this.calculateARAge(inv, asOfDate) >= riskThresholdDays)
      .sort((a, b) => this.calculateARAge(b, asOfDate) - this.calculateARAge(a, asOfDate));
  }

  static calculateCollectionEfficiency(
    invoices: Invoice[],
    startDate: Date,
    endDate: Date
  ): {
    totalInvoiced: number;
    totalCollected: number;
    collectionRate: number;
    averageCollectionDays: number;
  } {
    const periodInvoices = invoices.filter(inv =>
      isAfter(inv.invoiceDate, startDate) && isBefore(inv.invoiceDate, endDate)
    );
    
    const totalInvoiced = periodInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = periodInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;
    
    // Calculate average collection days for paid invoices
    const paidInvoices = periodInvoices.filter(inv => inv.status === 'paid' && inv.paidDate && inv.sentDate);
    const totalCollectionDays = paidInvoices.reduce((sum, inv) => {
      if (inv.paidDate && inv.sentDate) {
        return sum + differenceInDays(inv.paidDate, inv.sentDate);
      }
      return sum;
    }, 0);
    
    const averageCollectionDays = paidInvoices.length > 0 ? totalCollectionDays / paidInvoices.length : 0;
    
    return {
      totalInvoiced,
      totalCollected,
      collectionRate,
      averageCollectionDays
    };
  }
}