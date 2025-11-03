import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { PipelineColumn } from './PipelineColumn';
import { LeadCard } from './LeadCard';
import { LeadDetailDialog } from './LeadDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  UserPlus,
  Phone,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

const PIPELINE_STAGES = [
  {
    id: 'pending',
    title: 'Novo Lead',
    icon: UserPlus,
    colorClass: 'bg-blue-100 text-blue-800 border-b border-blue-300',
  },
  {
    id: 'contacted',
    title: 'Contato Inicial',
    icon: Phone,
    colorClass: 'bg-purple-100 text-purple-800 border-b border-purple-300',
  },
  {
    id: 'visit_scheduled',
    title: 'Visita Agendada',
    icon: Calendar,
    colorClass: 'bg-yellow-100 text-yellow-800 border-b border-yellow-300',
  },
  {
    id: 'negotiating',
    title: 'Em Negociação',
    icon: TrendingUp,
    colorClass: 'bg-orange-100 text-orange-800 border-b border-orange-300',
  },
  {
    id: 'proposal_sent',
    title: 'Proposta Enviada',
    icon: FileText,
    colorClass: 'bg-indigo-100 text-indigo-800 border-b border-indigo-300',
  },
  {
    id: 'won',
    title: 'Venda Fechada',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-800 border-b border-green-300',
  },
  {
    id: 'lost',
    title: 'Perdido',
    icon: XCircle,
    colorClass: 'bg-gray-100 text-gray-800 border-b border-gray-300',
  },
];

export const KanbanPipeline = () => {
  const [leads, setLeads] = useState<Record<string, any[]>>({});
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lossReason, setLossReason] = useState('');
  const [leadToMarkLost, setLeadToMarkLost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('property_interests')
      .select(`
        *,
        property:properties(
          id,
          title,
          property_images(image_url)
        )
      `)
      .eq('properties.owner_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar leads');
      setLoading(false);
      return;
    }

    // Agrupar leads por stage
    const groupedLeads: Record<string, any[]> = {
      pending: [],
      contacted: [],
      visit_scheduled: [],
      negotiating: [],
      proposal_sent: [],
      won: [],
      lost: [],
    };

    data?.forEach((lead) => {
      const stage = lead.pipeline_stage || 'pending';
      if (groupedLeads[stage]) {
        groupedLeads[stage].push({
          ...lead,
          property: lead.property ? {
            title: lead.property.title,
            image_url: lead.property.property_images?.[0]?.image_url,
          } : null,
        });
      }
    });

    setLeads(groupedLeads);
    setLoading(false);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const fromStage = source.droppableId;
    const toStage = destination.droppableId;

    // Não permitir mover de won ou lost
    if (fromStage === 'won' || fromStage === 'lost') {
      toast.error('Não é possível mover leads finalizados');
      return;
    }

    // Se mover para lost, pedir motivo
    if (toStage === 'lost') {
      setLeadToMarkLost(draggableId);
      setShowLostDialog(true);
      return;
    }

    // Atualizar UI otimisticamente
    const newLeads = { ...leads };
    const [movedLead] = newLeads[fromStage].splice(source.index, 1);
    newLeads[toStage].splice(destination.index, 0, movedLead);
    setLeads(newLeads);

    // Atualizar banco de dados
    const { error: updateError } = await supabase
      .from('property_interests')
      .update({ pipeline_stage: toStage })
      .eq('id', draggableId);

    if (updateError) {
      toast.error('Erro ao atualizar lead');
      loadLeads(); // Recarregar para reverter
      return;
    }

    // Registrar histórico
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('pipeline_history').insert({
      interest_id: draggableId,
      from_stage: fromStage,
      to_stage: toStage,
      moved_by: user?.id,
    });

    toast.success('Lead movido com sucesso!');
  };

  const handleMarkAsLost = async () => {
    if (!leadToMarkLost || !lossReason.trim()) {
      toast.error('Por favor, informe o motivo da perda');
      return;
    }

    const { error: updateError } = await supabase
      .from('property_interests')
      .update({ 
        pipeline_stage: 'lost',
        loss_reason: lossReason,
      })
      .eq('id', leadToMarkLost);

    if (updateError) {
      toast.error('Erro ao marcar como perdido');
      return;
    }

    // Registrar histórico
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('pipeline_history').insert({
      interest_id: leadToMarkLost,
      from_stage: leads.pending.find(l => l.id === leadToMarkLost)?.pipeline_stage,
      to_stage: 'lost',
      moved_by: user?.id,
      notes: lossReason,
    });

    setShowLostDialog(false);
    setLossReason('');
    setLeadToMarkLost(null);
    loadLeads();
    toast.success('Lead marcado como perdido');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              count={leads[stage.id]?.length || 0}
              icon={stage.icon}
              colorClass={stage.colorClass}
            >
              {leads[stage.id]?.map((lead, index) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  index={index}
                  onViewDetails={() => setSelectedLead(lead.id)}
                  onAddNote={() => setSelectedLead(lead.id)}
                  onMarkAsLost={() => {
                    setLeadToMarkLost(lead.id);
                    setShowLostDialog(true);
                  }}
                  onViewHistory={() => setSelectedLead(lead.id)}
                />
              ))}
            </PipelineColumn>
          ))}
        </div>
      </DragDropContext>

      {selectedLead && (
        <LeadDetailDialog
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
          leadId={selectedLead}
        />
      )}

      <AlertDialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Perdido</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo da perda deste lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Ex: Cliente desistiu da compra, encontrou imóvel melhor, etc."
            value={lossReason}
            onChange={(e) => setLossReason(e.target.value)}
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setLossReason('');
              setLeadToMarkLost(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsLost}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
