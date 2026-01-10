import { LucideIcon } from 'lucide-react';
import { formatCompact, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'accent';
}

const MetricCard = ({ title, value, change, icon: Icon, variant = 'default' }: MetricCardProps) => {
  const variantStyles = {
    default: 'from-primary/10 to-transparent',
    success: 'from-success/10 to-transparent',
    warning: 'from-destructive/10 to-transparent',
    accent: 'from-accent/10 to-transparent',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-destructive bg-destructive/10',
    accent: 'text-accent bg-accent/10',
  };

  return (
    <div className="metric-card group hover:border-primary/30 transition-all duration-300">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity",
        variantStyles[variant]
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconStyles[variant]
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              change >= 0 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {formatPercentage(change)}
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">
          {title}
        </p>
        
        <p className="text-3xl font-bold text-foreground currency">
          {formatCompact(value)}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
