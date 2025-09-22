/**
 * Standardized metric definitions for operational KPIs
 * Ensures consistent calculations across the application
 */
export interface MetricDefinition {
  name: string;
  description: string;
  formula: string;
  unit: string;
  targetRange?: { min: number; max: number };
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  throughput: {
    name: 'Throughput',
    description: 'Number of projects/work orders completed per time period',
    formula: 'COUNT(completed_items) / time_period',
    unit: 'items/day',
    targetRange: { min: 5, max: 20 }
  },
  cycleTime: {
    name: 'Cycle Time',
    description: 'Average time from project start to completion',
    formula: 'AVG(completion_date - start_date)',
    unit: 'days',
    targetRange: { min: 3, max: 14 }
  },
  slaCompliance: {
    name: 'SLA Compliance',
    description: 'Percentage of deliveries completed on or before due date',
    formula: '(on_time_deliveries / total_deliveries) * 100',
    unit: '%',
    targetRange: { min: 85, max: 100 }
  },
  utilization: {
    name: 'Utilization Rate',
    description: 'Percentage of available time spent on active work',
    formula: '(active_hours / available_hours) * 100',
    unit: '%',
    targetRange: { min: 70, max: 90 }
  },
  arAging: {
    name: 'AR Aging',
    description: 'Age of unpaid invoices in days',
    formula: 'current_date - invoice_date',
    unit: 'days',
    targetRange: { min: 0, max: 30 }
  },
  paymentCycle: {
    name: 'Average Payment Cycle',
    description: 'Average days from invoice sent to payment received',
    formula: 'AVG(payment_date - sent_date)',
    unit: 'days',
    targetRange: { min: 15, max: 45 }
  }
};

export function getMetricDefinition(metricKey: string): MetricDefinition | undefined {
  return METRIC_DEFINITIONS[metricKey];
}

export function isMetricWithinTarget(metricKey: string, value: number): boolean {
  const definition = getMetricDefinition(metricKey);
  if (!definition || !definition.targetRange) return true;
  
  return value >= definition.targetRange.min && value <= definition.targetRange.max;
}