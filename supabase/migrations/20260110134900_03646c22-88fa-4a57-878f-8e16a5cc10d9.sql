-- Create enum for investment types
CREATE TYPE public.investment_type AS ENUM ('Stock', 'Mutual Fund', 'Fixed Deposit', 'Cash', 'Real Estate', 'Bond', 'Gold', 'Crypto', 'Other');

-- Create investments table
CREATE TABLE public.investments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    asset_name TEXT NOT NULL,
    type investment_type NOT NULL DEFAULT 'Stock',
    ticker_symbol TEXT,
    quantity DECIMAL(18, 4) NOT NULL DEFAULT 0,
    avg_purchase_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    current_market_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    manual_price_override BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    purchase_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price history table for tracking daily changes
CREATE TABLE public.price_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments"
ON public.investments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
ON public.investments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
ON public.investments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
ON public.investments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for price_history
CREATE POLICY "Users can view price history for their investments"
ON public.price_history FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.investments 
    WHERE investments.id = price_history.investment_id 
    AND investments.user_id = auth.uid()
));

CREATE POLICY "Users can insert price history for their investments"
ON public.price_history FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.investments 
    WHERE investments.id = price_history.investment_id 
    AND investments.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();