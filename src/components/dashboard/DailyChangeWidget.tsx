import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatPercentage, formatCompact } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DailyChangeWidgetProps {
  change: number;
  changePercent: number;
}

const DailyChangeWidget = ({ change, changePercent }: DailyChangeWidgetProps) => {
  const isPositive = change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn(
      "card-premium p-4 flex items-center gap-4",
      isPositive ? "border-success/30" : "border-destructive/30"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        isPositive ? "bg-success/10" : "bg-destructive/10"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          isPositive ? "text-success" : "text-destructive"
        )} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">24h Change</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl font-bold",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {formatPercentage(changePercent)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({isPositive ? '+' : ''}{formatCompact(change)})
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyChangeWidget;
