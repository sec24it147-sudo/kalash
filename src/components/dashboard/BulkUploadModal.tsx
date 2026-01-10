import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { Investment, InvestmentType, INVESTMENT_TYPES } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (investments: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<{ error: any }>;
}

const BulkUploadModal = ({ open, onOpenChange, onUpload }: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'asset_name',
      'type',
      'ticker_symbol',
      'quantity',
      'avg_purchase_price',
      'current_market_price',
      'notes',
      'purchase_date'
    ];
    const exampleRow = [
      'Reliance Industries',
      'Stock',
      'RELIANCE.NS',
      '100',
      '2500.00',
      '2800.00',
      'Long term hold',
      '2024-01-15'
    ];

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investment_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setPreview([]);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setPreview(parsed.slice(0, 5));
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);

        const investments = parsed.map(row => {
          const type = INVESTMENT_TYPES.find(
            t => t.toLowerCase() === row.type?.toLowerCase()
          ) || 'Other';

          return {
            asset_name: row.asset_name || 'Unknown',
            type: type as InvestmentType,
            ticker_symbol: row.ticker_symbol || null,
            quantity: parseFloat(row.quantity) || 0,
            avg_purchase_price: parseFloat(row.avg_purchase_price) || 0,
            current_market_price: parseFloat(row.current_market_price) || parseFloat(row.avg_purchase_price) || 0,
            manual_price_override: !row.ticker_symbol,
            notes: row.notes || null,
            purchase_date: row.purchase_date || null,
          };
        }).filter(inv => inv.asset_name && inv.quantity > 0);

        if (investments.length === 0) {
          setError('No valid investments found in the CSV file');
          setIsLoading(false);
          return;
        }

        const result = await onUpload(investments);
        
        if (!result.error) {
          onOpenChange(false);
          setFile(null);
          setPreview([]);
        }
      } catch (err) {
        setError('Error processing CSV file');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk Upload Investments</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple investments at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full justify-start gap-3"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>

          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-primary" />
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {preview.length > 0 ? `${preview.length}+ rows detected` : 'Click to change file'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="font-medium text-foreground">Click to upload CSV</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">Preview (first 5 rows):</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {preview.map((row, i) => (
                  <p key={i} className="truncate">
                    {row.asset_name} - {row.type} - Qty: {row.quantity}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                setFile(null);
                setPreview([]);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1"
              disabled={!file || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Investments'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
