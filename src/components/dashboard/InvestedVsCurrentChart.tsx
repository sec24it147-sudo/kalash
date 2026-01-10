import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Investment } from '@/lib/types';
import { formatCompact } from '@/lib/formatters';

interface InvestedVsCurrentChartProps {
  investments: Investment[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCompact(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const InvestedVsCurrentChart = ({ investments }: InvestedVsCurrentChartProps) => {
  // Group by type
  const groupedData = investments.reduce((acc, inv) => {
    const invested = inv.quantity * inv.avg_purchase_price;
    const current = inv.quantity * inv.current_market_price;
    
    if (!acc[inv.type]) {
      acc[inv.type] = { type: inv.type, invested: 0, current: 0 };
    }
    acc[inv.type].invested += invested;
    acc[inv.type].current += current;
    
    return acc;
  }, {} as Record<string, { type: string; invested: number; current: number }>);

  const data = Object.values(groupedData).sort((a, b) => b.current - a.current);

  if (data.length === 0) {
    return (
      <div className="card-premium p-6 h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Invested vs Current Value</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatCompact(value)}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
            />
            <YAxis 
              type="category" 
              dataKey="type" 
              width={100}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(217, 33%, 14%, 0.5)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span style={{ color: 'hsl(215, 20%, 55%)' }}>{value}</span>}
            />
            <Bar 
              dataKey="invested" 
              name="Invested" 
              fill="hsl(45, 93%, 58%)" 
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
            <Bar 
              dataKey="current" 
              name="Current Value" 
              fill="hsl(158, 64%, 52%)" 
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestedVsCurrentChart;
