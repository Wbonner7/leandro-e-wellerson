import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { KanbanPipeline } from '@/components/pipeline/KanbanPipeline';
import { PipelineStats } from '@/components/pipeline/PipelineStats';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Pipeline() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLeads: 0,
    conversionRate: 0,
    totalValue: 0,
    avgTime: '0d',
  });

  useEffect(() => {
    checkAccess();
    loadStats();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
    }
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: interests } = await supabase
      .from('property_interests')
      .select('pipeline_stage, proposal_value, created_at')
      .eq('properties.owner_id', user.id);

    if (!interests) return;

    const total = interests.filter(
      (i) => i.pipeline_stage !== 'won' && i.pipeline_stage !== 'lost'
    ).length;
    
    const won = interests.filter((i) => i.pipeline_stage === 'won').length;
    const allLeads = interests.length;
    const conversion = allLeads > 0 ? (won / allLeads) * 100 : 0;

    const totalValue = interests
      .filter((i) => i.pipeline_stage === 'negotiating' || i.pipeline_stage === 'proposal_sent')
      .reduce((sum, i) => sum + (i.proposal_value || 0), 0);

    setStats({
      totalLeads: total,
      conversionRate: conversion,
      totalValue,
      avgTime: '7d', // Placeholder
    });
  };

  const handleExport = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/broker-dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
              <p className="text-muted-foreground">
                Gerencie seus leads visualmente
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        <PipelineStats
          totalLeads={stats.totalLeads}
          conversionRate={stats.conversionRate}
          totalValue={stats.totalValue}
          avgTime={stats.avgTime}
        />

        <KanbanPipeline />
      </main>

      <Footer />
    </div>
  );
}
