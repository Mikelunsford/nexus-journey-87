import { CSVExporter, CSVColumn, CSVExportOptions } from './csvExporter';
import { format } from 'date-fns';

export interface ReportExportConfig {
  reportType: 'analytics' | 'financial' | 'operational';
  title: string;
  description?: string;
  defaultColumns: CSVColumn[];
  dataTransformer?: (data: any[]) => any[];
}

export interface ExportRequest {
  reportType: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, any>;
  columns?: string[];
  format: 'csv' | 'json' | 'excel';
  includeCharts?: boolean;
}

export const REPORT_CONFIGS: Record<string, ReportExportConfig> = {
  'analytics-throughput': {
    reportType: 'analytics',
    title: 'Throughput Analysis',
    description: 'Project and work order completion metrics',
    defaultColumns: [
      { key: 'date', label: 'Date', formatter: CSVExporter.FORMATTERS.date },
      { key: 'completedProjects', label: 'Completed Projects', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'completedWorkOrders', label: 'Completed Work Orders', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'totalThroughput', label: 'Total Throughput', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'averageCycleTime', label: 'Avg Cycle Time (days)', formatter: CSVExporter.FORMATTERS.decimal }
    ]
  },
  'analytics-utilization': {
    reportType: 'analytics',
    title: 'Employee Utilization',
    description: 'Resource utilization and productivity metrics',
    defaultColumns: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'role', label: 'Role' },
      { key: 'availableHours', label: 'Available Hours', formatter: CSVExporter.FORMATTERS.decimal },
      { key: 'activeHours', label: 'Active Hours', formatter: CSVExporter.FORMATTERS.decimal },
      { key: 'utilizationRate', label: 'Utilization Rate', formatter: CSVExporter.FORMATTERS.percentage },
      { key: 'projectCount', label: 'Active Projects', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'taskCount', label: 'Active Tasks', formatter: CSVExporter.FORMATTERS.integer }
    ]
  },
  'analytics-sla': {
    reportType: 'analytics',
    title: 'SLA Compliance',
    description: 'Service level agreement compliance tracking',
    defaultColumns: [
      { key: 'date', label: 'Date', formatter: CSVExporter.FORMATTERS.date },
      { key: 'totalDeliveries', label: 'Total Deliveries', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'onTimeDeliveries', label: 'On-Time Deliveries', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'complianceRate', label: 'Compliance Rate', formatter: CSVExporter.FORMATTERS.percentage },
      { key: 'averageDelayDays', label: 'Avg Delay (days)', formatter: CSVExporter.FORMATTERS.decimal }
    ]
  },
  'financial-ar-aging': {
    reportType: 'financial',
    title: 'Accounts Receivable Aging',
    description: 'Outstanding invoice aging analysis',
    defaultColumns: [
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'invoiceDate', label: 'Invoice Date', formatter: CSVExporter.FORMATTERS.date },
      { key: 'dueDate', label: 'Due Date', formatter: CSVExporter.FORMATTERS.date },
      { key: 'totalAmount', label: 'Total Amount', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'paidAmount', label: 'Paid Amount', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'remainingBalance', label: 'Balance', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'daysOutstanding', label: 'Days Outstanding', formatter: CSVExporter.FORMATTERS.integer },
      { key: 'agingBucket', label: 'Aging Bucket' },
      { key: 'status', label: 'Status', formatter: CSVExporter.FORMATTERS.status }
    ]
  },
  'financial-payments': {
    reportType: 'financial',
    title: 'Payment History',
    description: 'Payment transaction history and analysis',
    defaultColumns: [
      { key: 'paymentDate', label: 'Payment Date', formatter: CSVExporter.FORMATTERS.date },
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'amount', label: 'Amount', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'reference', label: 'Reference' },
      { key: 'status', label: 'Status', formatter: CSVExporter.FORMATTERS.status },
      { key: 'processedBy', label: 'Processed By' }
    ]
  },
  'financial-revenue': {
    reportType: 'financial',
    title: 'Revenue Analysis',
    description: 'Revenue trends and performance metrics',
    defaultColumns: [
      { key: 'period', label: 'Period' },
      { key: 'totalRevenue', label: 'Total Revenue', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'paidRevenue', label: 'Collected Revenue', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'outstandingRevenue', label: 'Outstanding Revenue', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'collectionRate', label: 'Collection Rate', formatter: CSVExporter.FORMATTERS.percentage },
      { key: 'averageInvoiceValue', label: 'Avg Invoice Value', formatter: CSVExporter.FORMATTERS.currency },
      { key: 'invoiceCount', label: 'Invoice Count', formatter: CSVExporter.FORMATTERS.integer }
    ]
  }
};

export class ReportExporter {
  static async exportReport(
    reportKey: string,
    data: any[],
    request: ExportRequest
  ): Promise<void> {
    const config = REPORT_CONFIGS[reportKey];
    if (!config) {
      throw new Error(`Unknown report type: ${reportKey}`);
    }

    // Determine which columns to include
    const columnsToInclude = request.columns 
      ? config.defaultColumns.filter(col => request.columns!.includes(col.key))
      : config.defaultColumns;

    // Transform data if transformer is provided
    const transformedData = config.dataTransformer 
      ? config.dataTransformer(data)
      : data;

    // Generate filename
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    const filename = `${config.title.replace(/\s+/g, '_').toLowerCase()}_${timestamp}`;

    // Create export options
    const exportOptions: CSVExportOptions = {
      filename,
      columns: columnsToInclude,
      data: transformedData,
      dateRange: request.dateRange,
      filters: request.filters,
      includeMetadata: true
    };

    // Export based on format
    switch (request.format) {
      case 'csv':
        CSVExporter.downloadCSV(exportOptions);
        break;
      case 'json':
        this.downloadJSON(transformedData, filename, exportOptions);
        break;
      case 'excel':
        // For now, export as CSV (Excel support would require additional library)
        CSVExporter.downloadCSV(exportOptions);
        break;
      default:
        throw new Error(`Unsupported export format: ${request.format}`);
    }
  }

  static getReportConfig(reportKey: string): ReportExportConfig | undefined {
    return REPORT_CONFIGS[reportKey];
  }

  static getAvailableReports(): Array<{ key: string; config: ReportExportConfig }> {
    return Object.entries(REPORT_CONFIGS).map(([key, config]) => ({ key, config }));
  }

  static validateExportRequest(request: ExportRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate date range
    if (!request.dateRange || !request.dateRange.start || !request.dateRange.end) {
      errors.push('Date range is required');
    } else if (request.dateRange.start > request.dateRange.end) {
      errors.push('Start date must be before end date');
    }

    // Validate report type
    const config = REPORT_CONFIGS[request.reportType];
    if (!config) {
      errors.push(`Unknown report type: ${request.reportType}`);
    }

    // Validate columns if specified
    if (request.columns && config) {
      const validColumns = config.defaultColumns.map(col => col.key);
      const invalidColumns = request.columns.filter(col => !validColumns.includes(col));
      if (invalidColumns.length > 0) {
        errors.push(`Invalid columns: ${invalidColumns.join(', ')}`);
      }
    }

    // Validate format
    const supportedFormats = ['csv', 'json', 'excel'];
    if (!supportedFormats.includes(request.format)) {
      errors.push(`Unsupported format: ${request.format}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static downloadJSON(data: any[], filename: string, options: CSVExportOptions): void {
    const jsonData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRows: data.length,
        dateRange: options.dateRange ? {
          start: options.dateRange.start.toISOString(),
          end: options.dateRange.end.toISOString()
        } : undefined,
        filters: options.filters,
        version: '1.0'
      },
      data
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Helper methods for common export scenarios
  static exportAnalyticsData(
    metricsData: any[],
    dateRange: { start: Date; end: Date },
    filters: Record<string, any> = {}
  ): void {
    const request: ExportRequest = {
      reportType: 'analytics-throughput',
      dateRange,
      filters,
      format: 'csv'
    };

    this.exportReport('analytics-throughput', metricsData, request);
  }

  static exportFinancialData(
    invoiceData: any[],
    dateRange: { start: Date; end: Date },
    filters: Record<string, any> = {}
  ): void {
    const request: ExportRequest = {
      reportType: 'financial-ar-aging',
      dateRange,
      filters,
      format: 'csv'
    };

    this.exportReport('financial-ar-aging', invoiceData, request);
  }
}