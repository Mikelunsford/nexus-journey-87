import { addDays, differenceInDays, format, subDays } from 'date-fns';

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface KPIMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  timeSeries: TimeSeriesPoint[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class MetricsCalculator {
  static getDateRange(period: '7d' | '30d' | '90d' | 'custom', customRange?: DateRange): DateRange {
    const now = new Date();
    
    switch (period) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      case 'custom':
        return customRange || { start: subDays(now, 30), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  }

  static calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const threshold = 0.05; // 5% threshold for stability
    const changePercent = previous === 0 ? 0 : (current - previous) / previous;
    
    if (Math.abs(changePercent) < threshold) return 'stable';
    return current > previous ? 'up' : 'down';
  }

  static calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  static generateTimeSeries(
    data: Array<{ date: Date; value: number }>,
    range: DateRange
  ): TimeSeriesPoint[] {
    const days = differenceInDays(range.end, range.start);
    const timeSeries: TimeSeriesPoint[] = [];
    
    for (let i = 0; i <= days; i++) {
      const date = addDays(range.start, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = data.filter(d => format(d.date, 'yyyy-MM-dd') === dateStr);
      const value = dayData.reduce((sum, d) => sum + d.value, 0);
      
      timeSeries.push({
        date: dateStr,
        value,
        label: format(date, 'MMM dd')
      });
    }
    
    return timeSeries;
  }

  static aggregateByPeriod(
    data: Array<{ date: Date; value: number }>,
    period: 'day' | 'week' | 'month'
  ): Array<{ date: Date; value: number }> {
    const grouped = new Map<string, number>();
    
    data.forEach(item => {
      let key: string;
      switch (period) {
        case 'day':
          key = format(item.date, 'yyyy-MM-dd');
          break;
        case 'week':
          key = format(item.date, 'yyyy-ww');
          break;
        case 'month':
          key = format(item.date, 'yyyy-MM');
          break;
      }
      
      grouped.set(key, (grouped.get(key) || 0) + item.value);
    });
    
    return Array.from(grouped.entries()).map(([key, value]) => ({
      date: new Date(key),
      value
    }));
  }
}