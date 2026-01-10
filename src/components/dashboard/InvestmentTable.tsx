import { useState } from 'react';
import { Search, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Investment } from '@/lib/types';
import { formatCurrencyPrecise, formatQuantity, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface InvestmentTableProps {
  investments: Investment[];
  onDelete: (id: string) => Promise<{ error: any }>;
  onEdit: (investment: Investment) => void;
}

const InvestmentTable = ({ investments, onDelete, onEdit }: InvestmentTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredInvestments = investments.filter(inv =>
    inv.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.ticker_symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Stock': 'bg-chart-1/20 text-chart-1 border-chart-1/30',
      'Mutual Fund': 'bg-chart-2/20 text-chart-2 border-chart-2/30',
      'Fixed Deposit': 'bg-chart-3/20 text-chart-3 border-chart-3/30',
      'Cash': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
      'Real Estate': 'bg-chart-7/20 text-chart-7 border-chart-7/30',
      'Bond': 'bg-chart-8/20 text-chart-8 border-chart-8/30',
      'Gold': 'bg-accent/20 text-accent border-accent/30',
      'Crypto': 'bg-chart-6/20 text-chart-6 border-chart-6/30',
      'Other': 'bg-muted text-muted-foreground border-muted',
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="card-premium p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-foreground">Investment Holdings</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ticker, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Asset</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Type</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold text-right">Qty</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold text-right">Avg. Price</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold text-right">Current Price</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold text-right">Current Value</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold text-right">P&L</TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvestments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No investments match your search' : 'No investments yet. Add your first investment!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvestments.map((investment) => {
                const currentValue = investment.quantity * investment.current_market_price;
                const investedValue = investment.quantity * investment.avg_purchase_price;
                const pl = currentValue - investedValue;
                const plPercent = investedValue > 0 ? (pl / investedValue) * 100 : 0;
                const isProfit = pl >= 0;

                return (
                  <TableRow key={investment.id} className="border-border/50 hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-base">{investment.asset_name}</p>
                        {investment.ticker_symbol && (
                          <p className="text-sm text-muted-foreground font-mono">{investment.ticker_symbol}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium", getTypeColor(investment.type))}>
                        {investment.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatQuantity(investment.quantity)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatCurrencyPrecise(investment.avg_purchase_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatCurrencyPrecise(investment.current_market_price)}
                      {investment.manual_price_override && (
                        <span className="text-xs text-muted-foreground block">Manual</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground">
                      {formatCurrencyPrecise(currentValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn("flex items-center justify-end gap-1", isProfit ? "text-success" : "text-destructive")}>
                        {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <div className="text-right">
                          <p className="font-mono font-semibold">{formatCurrencyPrecise(Math.abs(pl))}</p>
                          <p className="text-xs">{formatPercentage(plPercent)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(investment)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(investment.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvestmentTable;
