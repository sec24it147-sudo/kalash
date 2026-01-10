import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatCompact } from '@/lib/formatters';

interface ProjectionChartProps {
  currentValue: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">Year {label}</p>
        <p className="text-primary">{formatCompact(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const ProjectionChart = ({ currentValue }: ProjectionChartProps) => {
  const [growthRate, setGrowthRate] = useState(7);
  const years = 20;

  const projectionData = Array.from({ length: years + 1 }, (_, i) => ({
    year: i,
    value: currentValue * Math.pow(1 + growthRate / 100, i),
  }));

  const finalValue = projectionData[projectionData.length - 1].value;

  if (currentValue === 0) {
    return (
      <div className="card-premium p-6 h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Add investments to see projections</p>
      </div>
    );
  }

  return (
    <div className="card-premium p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-foreground">Future Value Projection</h3>
        <div className="flex items-center gap-4">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">
            Growth Rate: <span className="text-primary font-semibold">{growthRate}%</span>
          </Label>
          <Slider
            value={[growthRate]}
            onValueChange={(value) => setGrowthRate(value[0])}
            min={1}
            max={20}
            step={1}
            className="w-32"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-xl font-bold text-foreground">{formatCompact(currentValue)}</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">In {years} Years</p>
          <p className="text-xl font-bold text-primary">{formatCompact(finalValue)}</p>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
              tickFormatter={(value) => `Y${value}`}
            />
            <YAxis 
              tickFormatter={(value) => formatCompact(value)}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(158, 64%, 52%)"
              strokeWidth={2}
              fill="url(#projectionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectionChart;
