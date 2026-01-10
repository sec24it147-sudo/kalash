import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AssetAllocation, TYPE_COLORS } from '@/lib/types';
import { formatCompact, formatPercentage } from '@/lib/formatters';

interface AssetAllocationChartProps {
  data: AssetAllocation[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.type}</p>
        <p className="text-muted-foreground">{formatCompact(data.value)}</p>
        <p className="text-primary font-medium">{data.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const AssetAllocationChart = ({ data }: AssetAllocationChartProps) => {
  if (data.length === 0) {
    return (
      <div className="card-premium p-6 h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  const chartColors = data.map(item => TYPE_COLORS[item.type]);

  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Asset Allocation</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="type"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetAllocationChart;
