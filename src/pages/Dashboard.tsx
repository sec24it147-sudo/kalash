import { useState } from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { Investment } from '@/lib/types';
import Header from '@/components/dashboard/Header';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import DailyChangeWidget from '@/components/dashboard/DailyChangeWidget';
import InvestmentTable from '@/components/dashboard/InvestmentTable';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import InvestedVsCurrentChart from '@/components/dashboard/InvestedVsCurrentChart';
import ProjectionChart from '@/components/dashboard/ProjectionChart';
import AddInvestmentModal from '@/components/dashboard/AddInvestmentModal';
import BulkUploadModal from '@/components/dashboard/BulkUploadModal';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { 
    investments, 
    loading, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment,
    bulkAddInvestments,
    getPortfolioSummary, 
    getAssetAllocation 
  } = useInvestments();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const summary = getPortfolioSummary();
  const allocation = getAssetAllocation();

  // Simulate 24h change (in production, you'd track this from price history)
  const dailyChange = summary.totalMarketValue * 0.0125; // Simulated 1.25%
  const dailyChangePercent = 1.25;

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setAddModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setAddModalOpen(open);
    if (!open) {
      setEditingInvestment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onAddInvestment={() => {}} onBulkUpload={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddInvestment={() => setAddModalOpen(true)} 
        onBulkUpload={() => setBulkModalOpen(true)} 
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <section className="mb-8 animate-fade-in">
          <PortfolioOverview summary={summary} />
        </section>

        {/* Daily Change Widget + Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <DailyChangeWidget change={dailyChange} changePercent={dailyChangePercent} />
          </div>
          <div className="lg:col-span-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <ProjectionChart currentValue={summary.totalMarketValue} />
          </div>
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <AssetAllocationChart data={allocation} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
            <InvestedVsCurrentChart investments={investments} />
          </div>
        </section>

        {/* Investment Table */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <InvestmentTable 
            investments={investments} 
            onDelete={deleteInvestment}
            onEdit={handleEdit}
          />
        </section>
      </main>

      {/* Modals */}
      <AddInvestmentModal
        open={addModalOpen}
        onOpenChange={handleCloseModal}
        onSubmit={addInvestment}
        editingInvestment={editingInvestment}
        onUpdate={updateInvestment}
      />

      <BulkUploadModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        onUpload={bulkAddInvestments}
      />
    </div>
  );
};

export default Dashboard;
