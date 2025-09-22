import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeSeriesPoint } from '@/lib/analytics/metricsCalculator';

interface ThroughputChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  showGrid?: boolean;
  color?: string;
}

const chartConfig = {
  throughput: {
    label: 'Throughput',
    color: 'hsl(var(--primary))',
  },
};

export function ThroughputChart({ 
  data, 
  height = 300, 
  showGrid = true,
  color = 'hsl(var(--primary))'
}: ThroughputChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
            className="text-muted-foreground"
          />
          <YAxis className="text-muted-foreground" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}