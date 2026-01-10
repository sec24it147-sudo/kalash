export type InvestmentType = 
  | 'Stock' 
  | 'Mutual Fund' 
  | 'Fixed Deposit' 
  | 'Cash' 
  | 'Real Estate' 
  | 'Bond' 
  | 'Gold' 
  | 'Crypto' 
  | 'Other';

export interface Investment {
  id: string;
  user_id: string;
  asset_name: string;
  type: InvestmentType;
  ticker_symbol: string | null;
  quantity: number;
  avg_purchase_price: number;
  current_market_price: number;
  manual_price_override: boolean;
  notes: string | null;
  purchase_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  investment_id: string;
  price: number;
  recorded_at: string;
}

export interface PortfolioSummary {
  totalNetWorth: number;
  totalInvested: number;
  totalMarketValue: number;
  totalUnrealizedPL: number;
  percentChange: number;
}

export interface AssetAllocation {
  type: InvestmentType;
  value: number;
  percentage: number;
}

export const INVESTMENT_TYPES: InvestmentType[] = [
  'Stock',
  'Mutual Fund',
  'Fixed Deposit',
  'Cash',
  'Real Estate',
  'Bond',
  'Gold',
  'Crypto',
  'Other'
];

export const TYPE_COLORS: Record<InvestmentType, string> = {
  'Stock': 'hsl(158, 64%, 52%)',
  'Mutual Fund': 'hsl(45, 93%, 58%)',
  'Fixed Deposit': 'hsl(199, 89%, 48%)',
  'Cash': 'hsl(280, 65%, 60%)',
  'Real Estate': 'hsl(20, 90%, 56%)',
  'Bond': 'hsl(173, 80%, 40%)',
  'Gold': 'hsl(35, 91%, 48%)',
  'Crypto': 'hsl(262, 83%, 58%)',
  'Other': 'hsl(215, 20%, 55%)'
};
