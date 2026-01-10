import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Investment, PortfolioSummary, AssetAllocation, InvestmentType } from '@/lib/types';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Investment type
      const transformedData: Investment[] = (data || []).map(item => ({
        ...item,
        quantity: Number(item.quantity),
        avg_purchase_price: Number(item.avg_purchase_price),
        current_market_price: Number(item.current_market_price),
      }));
      
      setInvestments(transformedData);
    } catch (error: any) {
      toast({
        title: "Error fetching investments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Investment = {
        ...data,
        quantity: Number(data.quantity),
        avg_purchase_price: Number(data.avg_purchase_price),
        current_market_price: Number(data.current_market_price),
      };

      setInvestments(prev => [transformedData, ...prev]);
      toast({
        title: "Investment added",
        description: `${investment.asset_name} has been added to your portfolio.`,
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error adding investment",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setInvestments(prev => 
        prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv)
      );
      
      toast({
        title: "Investment updated",
        description: "Your investment has been updated successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error updating investment",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvestments(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "Investment deleted",
        description: "The investment has been removed from your portfolio.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting investment",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const bulkAddInvestments = async (investmentsData: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const dataWithUserId = investmentsData.map(inv => ({
        ...inv,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('investments')
        .insert(dataWithUserId)
        .select();

      if (error) throw error;

      const transformedData: Investment[] = (data || []).map(item => ({
        ...item,
        quantity: Number(item.quantity),
        avg_purchase_price: Number(item.avg_purchase_price),
        current_market_price: Number(item.current_market_price),
      }));

      setInvestments(prev => [...transformedData, ...prev]);
      toast({
        title: "Bulk upload successful",
        description: `${investmentsData.length} investments have been added.`,
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error in bulk upload",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Calculate portfolio summary
  const getPortfolioSummary = (): PortfolioSummary => {
    const totalInvested = investments.reduce(
      (sum, inv) => sum + (inv.quantity * inv.avg_purchase_price), 
      0
    );
    const totalMarketValue = investments.reduce(
      (sum, inv) => sum + (inv.quantity * inv.current_market_price), 
      0
    );
    const totalUnrealizedPL = totalMarketValue - totalInvested;
    const percentChange = totalInvested > 0 
      ? ((totalMarketValue - totalInvested) / totalInvested) * 100 
      : 0;

    return {
      totalNetWorth: totalMarketValue,
      totalInvested,
      totalMarketValue,
      totalUnrealizedPL,
      percentChange,
    };
  };

  // Calculate asset allocation
  const getAssetAllocation = (): AssetAllocation[] => {
    const totalValue = investments.reduce(
      (sum, inv) => sum + (inv.quantity * inv.current_market_price), 
      0
    );

    const allocationMap = investments.reduce((acc, inv) => {
      const value = inv.quantity * inv.current_market_price;
      acc[inv.type] = (acc[inv.type] || 0) + value;
      return acc;
    }, {} as Record<InvestmentType, number>);

    return Object.entries(allocationMap)
      .map(([type, value]) => ({
        type: type as InvestmentType,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  return {
    investments,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    bulkAddInvestments,
    getPortfolioSummary,
    getAssetAllocation,
    refetch: fetchInvestments,
  };
};
