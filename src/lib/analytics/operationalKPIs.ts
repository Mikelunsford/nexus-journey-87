import { differenceInDays, isAfter, isBefore } from 'date-fns';
import { MetricsCalculator, KPIMetric, DateRange } from './metricsCalculator';
import type { Project, WorkOrder } from '@/lib/types';

export interface ThroughputData {
  projects: Project[];
  workOrders: WorkOrder[];
}

export interface CycleTimeData {
  items: Array<{
    id: string;
    startDate: Date;
    completionDate: Date;
    type: 'project' | 'workOrder';
  }>;
}

export interface SLAData {
  items: Array<{
    id: string;
    dueDate: Date;
    completionDate: Date;
    isCompleted: boolean;
  }>;
}

export class OperationalKPIs {
  static calculateThroughput(
    data: ThroughputData,
    range: DateRange,
    previousRange: DateRange
  ): KPIMetric {
    const completedInRange = this.getCompletedItemsInRange(data, range);
    const completedInPrevious = this.getCompletedItemsInRange(data, previousRange);
    
    const current = completedInRange.length;
    const previous = completedInPrevious.length;
    const change = current - previous;
    const changePercent = MetricsCalculator.calculateChangePercent(current, previous);
    const trend = MetricsCalculator.calculateTrend(current, previous);
    
    // Generate time series data
    const timeSeriesData = completedInRange.map(item => ({
      date: item.completionDate,
      value: 1
    }));
    
    const timeSeries = MetricsCalculator.generateTimeSeries(timeSeriesData, range);
    
    return {
      current,
      previous,
      change,
      changePercent,
      trend,
      timeSeries
    };
  }

  static calculateCycleTime(
    data: CycleTimeData,
    range: DateRange,
    previousRange: DateRange
  ): KPIMetric {
    const itemsInRange = data.items.filter(item =>
      isAfter(item.completionDate, range.start) && isBefore(item.completionDate, range.end)
    );
    
    const itemsInPrevious = data.items.filter(item =>
      isAfter(item.completionDate, previousRange.start) && isBefore(item.completionDate, previousRange.end)
    );
    
    const current = this.calculateAverageCycleTime(itemsInRange);
    const previous = this.calculateAverageCycleTime(itemsInPrevious);
    const change = current - previous;
    const changePercent = MetricsCalculator.calculateChangePercent(current, previous);
    const trend = MetricsCalculator.calculateTrend(current, previous);
    
    // Generate time series data
    const timeSeriesData = itemsInRange.map(item => ({
      date: item.completionDate,
      value: differenceInDays(item.completionDate, item.startDate)
    }));
    
    const timeSeries = MetricsCalculator.generateTimeSeries(timeSeriesData, range);
    
    return {
      current,
      previous,
      change,
      changePercent,
      trend,
      timeSeries
    };
  }

  static calculateSLACompliance(
    data: SLAData,
    range: DateRange,
    previousRange: DateRange
  ): KPIMetric {
    const itemsInRange = data.items.filter(item =>
      item.isCompleted &&
      isAfter(item.completionDate, range.start) && 
      isBefore(item.completionDate, range.end)
    );
    
    const itemsInPrevious = data.items.filter(item =>
      item.isCompleted &&
      isAfter(item.completionDate, previousRange.start) && 
      isBefore(item.completionDate, previousRange.end)
    );
    
    const current = this.calculateSLAPercentage(itemsInRange);
    const previous = this.calculateSLAPercentage(itemsInPrevious);
    const change = current - previous;
    const changePercent = MetricsCalculator.calculateChangePercent(current, previous);
    const trend = MetricsCalculator.calculateTrend(current, previous);
    
    // Generate time series data
    const timeSeriesData = itemsInRange.map(item => ({
      date: item.completionDate,
      value: isBefore(item.completionDate, item.dueDate) || item.completionDate.getTime() === item.dueDate.getTime() ? 1 : 0
    }));
    
    const timeSeries = MetricsCalculator.generateTimeSeries(timeSeriesData, range);
    
    return {
      current,
      previous,
      change,
      changePercent,
      trend,
      timeSeries
    };
  }

  private static getCompletedItemsInRange(data: ThroughputData, range: DateRange) {
    const completedProjects = data.projects
      .filter(p => p.status === 'completed')
      .filter(p => {
        // Use updatedAt as completion date for completed projects
        const completionDate = new Date(p.updatedAt);
        return isAfter(completionDate, range.start) && isBefore(completionDate, range.end);
      })
      .map(p => ({ ...p, completionDate: new Date(p.updatedAt), type: 'project' as const }));
    
    const completedWorkOrders = data.workOrders
      .filter(wo => wo.status === 'done')
      .filter(wo => {
        // Use createdAt as completion date for done work orders
        const completionDate = new Date(wo.createdAt);
        return isAfter(completionDate, range.start) && isBefore(completionDate, range.end);
      })
      .map(wo => ({ ...wo, completionDate: new Date(wo.createdAt), type: 'workOrder' as const }));
    
    return [...completedProjects, ...completedWorkOrders];
  }

  private static calculateAverageCycleTime(items: CycleTimeData['items']): number {
    if (items.length === 0) return 0;
    
    const totalDays = items.reduce((sum, item) => 
      sum + differenceInDays(item.completionDate, item.startDate), 0
    );
    
    return totalDays / items.length;
  }

  private static calculateSLAPercentage(items: SLAData['items']): number {
    if (items.length === 0) return 0;
    
    const onTimeItems = items.filter(item =>
      isBefore(item.completionDate, item.dueDate) || 
      item.completionDate.getTime() === item.dueDate.getTime()
    );
    
    return (onTimeItems.length / items.length) * 100;
  }
}