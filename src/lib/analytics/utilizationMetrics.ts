import { isAfter, isBefore, differenceInHours } from 'date-fns';
import { MetricsCalculator, KPIMetric, DateRange } from './metricsCalculator';
import type { User, Project, WorkOrder } from '@/lib/types';

export interface UtilizationData {
  employees: User[];
  projects: Project[];
  workOrders: WorkOrder[];
  timeEntries: Array<{
    id: string;
    employeeId: string;
    projectId?: string;
    workOrderId?: string;
    startTime: Date;
    endTime: Date;
    hours: number;
  }>;
  workingHours: {
    hoursPerDay: number;
    daysPerWeek: number;
  };
}

export interface EmployeeUtilization {
  employeeId: string;
  employeeName: string;
  role: string;
  availableHours: number;
  activeHours: number;
  utilizationRate: number;
  projectCount: number;
  taskCount: number;
}

export class UtilizationMetrics {
  static calculateOverallUtilization(
    data: UtilizationData,
    range: DateRange,
    previousRange: DateRange
  ): KPIMetric {
    const currentUtilization = this.calculatePeriodUtilization(data, range);
    const previousUtilization = this.calculatePeriodUtilization(data, previousRange);
    
    const current = currentUtilization.averageUtilization;
    const previous = previousUtilization.averageUtilization;
    const change = current - previous;
    const changePercent = MetricsCalculator.calculateChangePercent(current, previous);
    const trend = MetricsCalculator.calculateTrend(current, previous);
    
    // Generate time series data
    const timeSeriesData = currentUtilization.dailyUtilization.map(item => ({
      date: item.date,
      value: item.utilizationRate
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

  static calculateEmployeeUtilization(
    data: UtilizationData,
    range: DateRange
  ): EmployeeUtilization[] {
    const workingDays = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
    const availableHoursPerEmployee = workingDays * data.workingHours.hoursPerDay;
    
    return data.employees.map(employee => {
      const timeEntries = data.timeEntries.filter(entry =>
        entry.employeeId === employee.id &&
        isAfter(entry.startTime, range.start) &&
        isBefore(entry.endTime, range.end)
      );
      
      const activeHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const utilizationRate = availableHoursPerEmployee > 0 ? (activeHours / availableHoursPerEmployee) * 100 : 0;
      
      const projectIds = new Set(timeEntries.map(entry => entry.projectId).filter(Boolean));
      const workOrderIds = new Set(timeEntries.map(entry => entry.workOrderId).filter(Boolean));
      
      return {
        employeeId: employee.id,
        employeeName: employee.name || employee.email,
        role: employee.role,
        availableHours: availableHoursPerEmployee,
        activeHours,
        utilizationRate,
        projectCount: projectIds.size,
        taskCount: workOrderIds.size
      };
    });
  }

  static calculateDepartmentUtilization(
    data: UtilizationData,
    range: DateRange
  ): Array<{
    department: string;
    employeeCount: number;
    averageUtilization: number;
    totalActiveHours: number;
    totalAvailableHours: number;
  }> {
    const employeeUtilization = this.calculateEmployeeUtilization(data, range);
    const departments = new Map<string, EmployeeUtilization[]>();
    
    // Group by role (treating role as department)
    employeeUtilization.forEach(emp => {
      const dept = emp.role;
      if (!departments.has(dept)) {
        departments.set(dept, []);
      }
      departments.get(dept)!.push(emp);
    });
    
    return Array.from(departments.entries()).map(([department, employees]) => {
      const totalActiveHours = employees.reduce((sum, emp) => sum + emp.activeHours, 0);
      const totalAvailableHours = employees.reduce((sum, emp) => sum + emp.availableHours, 0);
      const averageUtilization = employees.reduce((sum, emp) => sum + emp.utilizationRate, 0) / employees.length;
      
      return {
        department,
        employeeCount: employees.length,
        averageUtilization,
        totalActiveHours,
        totalAvailableHours
      };
    });
  }

  private static calculatePeriodUtilization(data: UtilizationData, range: DateRange) {
    const workingDays = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
    const totalAvailableHours = data.employees.length * workingDays * data.workingHours.hoursPerDay;
    
    const timeEntriesInRange = data.timeEntries.filter(entry =>
      isAfter(entry.startTime, range.start) && isBefore(entry.endTime, range.end)
    );
    
    const totalActiveHours = timeEntriesInRange.reduce((sum, entry) => sum + entry.hours, 0);
    const averageUtilization = totalAvailableHours > 0 ? (totalActiveHours / totalAvailableHours) * 100 : 0;
    
    // Calculate daily utilization for time series
    const dailyUtilization = [];
    for (let i = 0; i < workingDays; i++) {
      const date = new Date(range.start.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEntries = timeEntriesInRange.filter(entry => {
        const entryDate = new Date(entry.startTime.getFullYear(), entry.startTime.getMonth(), entry.startTime.getDate());
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return entryDate.getTime() === targetDate.getTime();
      });
      
      const dayActiveHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const dayAvailableHours = data.employees.length * data.workingHours.hoursPerDay;
      const utilizationRate = dayAvailableHours > 0 ? (dayActiveHours / dayAvailableHours) * 100 : 0;
      
      dailyUtilization.push({
        date,
        utilizationRate,
        totalHours: dayActiveHours
      });
    }
    
    return {
      averageUtilization,
      totalActiveHours,
      totalAvailableHours,
      dailyUtilization
    };
  }
}