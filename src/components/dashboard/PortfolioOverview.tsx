import { Wallet, TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';
import MetricCard from './MetricCard';
import { PortfolioSummary } from '@/lib/types';

interface PortfolioOverviewProps {
  summary: PortfolioSummary;
}

const PortfolioOverview = ({ summary }: PortfolioOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="Total Net Worth"
        value={summary.totalNetWorth}
        icon={Wallet}
        variant="default"
      />
      <MetricCard
        title="Total Invested"
        value={summary.totalInvested}
        icon={PiggyBank}
        variant="accent"
      />
      <MetricCard
        title="Market Value"
        value={summary.totalMarketValue}
        icon={BarChart3}
        variant="default"
      />
      <MetricCard
        title="Unrealized P&L"
        value={summary.totalUnrealizedPL}
        change={summary.percentChange}
        icon={TrendingUp}
        variant={summary.totalUnrealizedPL >= 0 ? 'success' : 'warning'}
      />
    </div>
  );
};

export default PortfolioOverview;
