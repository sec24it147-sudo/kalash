import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Investment, InvestmentType, INVESTMENT_TYPES } from '@/lib/types';

interface AddInvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  editingInvestment?: Investment | null;
  onUpdate?: (id: string, updates: Partial<Investment>) => Promise<{ error: any }>;
}

const AddInvestmentModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editingInvestment,
  onUpdate 
}: AddInvestmentModalProps) => {
  const [formData, setFormData] = useState({
    asset_name: '',
    type: 'Stock' as InvestmentType,
    ticker_symbol: '',
    quantity: '',
    avg_purchase_price: '',
    current_market_price: '',
    manual_price_override: false,
    notes: '',
    purchase_date: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingInvestment) {
      setFormData({
        asset_name: editingInvestment.asset_name,
        type: editingInvestment.type,
        ticker_symbol: editingInvestment.ticker_symbol || '',
        quantity: String(editingInvestment.quantity),
        avg_purchase_price: String(editingInvestment.avg_purchase_price),
        current_market_price: String(editingInvestment.current_market_price),
        manual_price_override: editingInvestment.manual_price_override,
        notes: editingInvestment.notes || '',
        purchase_date: editingInvestment.purchase_date || '',
      });
    } else {
      setFormData({
        asset_name: '',
        type: 'Stock',
        ticker_symbol: '',
        quantity: '',
        avg_purchase_price: '',
        current_market_price: '',
        manual_price_override: false,
        notes: '',
        purchase_date: '',
      });
    }
  }, [editingInvestment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const investmentData = {
      asset_name: formData.asset_name.trim(),
      type: formData.type,
      ticker_symbol: formData.ticker_symbol.trim() || null,
      quantity: parseFloat(formData.quantity) || 0,
      avg_purchase_price: parseFloat(formData.avg_purchase_price) || 0,
      current_market_price: parseFloat(formData.current_market_price) || parseFloat(formData.avg_purchase_price) || 0,
      manual_price_override: formData.manual_price_override,
      notes: formData.notes.trim() || null,
      purchase_date: formData.purchase_date || null,
    };

    let result;
    if (editingInvestment && onUpdate) {
      result = await onUpdate(editingInvestment.id, investmentData);
    } else {
      result = await onSubmit(investmentData);
    }

    setIsLoading(false);

    if (!result.error) {
      onOpenChange(false);
    }
  };

  const needsManualPrice = ['Real Estate', 'Fixed Deposit', 'Cash', 'Other'].includes(formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
          </DialogTitle>
          <DialogDescription>
            {editingInvestment 
              ? 'Update the details of your investment below.'
              : 'Enter the details of your investment below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="asset_name" className="text-base">Asset Name *</Label>
              <Input
                id="asset_name"
                placeholder="e.g., Reliance Industries"
                value={formData.asset_name}
                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-base">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: InvestmentType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticker_symbol" className="text-base">Ticker Symbol</Label>
              <Input
                id="ticker_symbol"
                placeholder="e.g., RELIANCE.NS"
                value={formData.ticker_symbol}
                onChange={(e) => setFormData({ ...formData, ticker_symbol: e.target.value.toUpperCase() })}
                className="h-11 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.0001"
                min="0"
                placeholder="e.g., 100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date" className="text-base">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg_purchase_price" className="text-base">Avg. Purchase Price (₹) *</Label>
              <Input
                id="avg_purchase_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 2500.00"
                value={formData.avg_purchase_price}
                onChange={(e) => setFormData({ ...formData, avg_purchase_price: e.target.value })}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_market_price" className="text-base">
                Current Price (₹) {needsManualPrice && '*'}
              </Label>
              <Input
                id="current_market_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 2800.00"
                value={formData.current_market_price}
                onChange={(e) => setFormData({ ...formData, current_market_price: e.target.value })}
                className="h-11"
                required={needsManualPrice}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="manual_price_override"
              checked={formData.manual_price_override || needsManualPrice}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, manual_price_override: checked as boolean })
              }
              disabled={needsManualPrice}
            />
            <Label htmlFor="manual_price_override" className="text-sm text-muted-foreground">
              Manual price entry (no auto-update from market)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading 
                ? (editingInvestment ? 'Updating...' : 'Adding...') 
                : (editingInvestment ? 'Update Investment' : 'Add Investment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvestmentModal;
