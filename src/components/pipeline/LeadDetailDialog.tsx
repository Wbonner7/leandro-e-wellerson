import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Mail, MessageCircle, DollarSign, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
}

export const LeadDetailDialog = ({
  open,
  onOpenChange,
  leadId,
}: LeadDetailDialogProps) => {
  const [lead, setLead] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [proposalValue, setProposalValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && leadId) {
      loadLeadDetails();
      loadHistory();
    }
  }, [open, leadId]);

  const loadLeadDetails = async () => {
    const { data, error } = await supabase
      .from('property_interests')
      .select(`
        *,
        property:properties(
          id,
          title,
          location,
          price,
          property_images(image_url)
        )
      `)
      .eq('id', leadId)
      .single();

    if (error) {
      toast.error('Erro ao carregar detalhes do lead');
      return;
    }

    setLead(data);
    setNotes(data.broker_notes || '');
    setProposalValue(data.proposal_value?.toString() || '');
  };

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('pipeline_history')
      .select('*')
      .eq('interest_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('property_interests')
      .update({ 
        broker_notes: notes,
        proposal_value: proposalValue ? parseFloat(proposalValue) : null
      })
      .eq('id', leadId);

    setLoading(false);

    if (error) {
      toast.error('Erro ao salvar anotações');
      return;
    }

    toast.success('Anotações salvas com sucesso!');
  };

  const handleWhatsApp = () => {
    if (!lead?.phone) return;
    const phone = lead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      pending: 'Novo Lead',
      contacted: 'Contato Inicial',
      visit_scheduled: 'Visita Agendada',
      negotiating: 'Em Negociação',
      proposal_sent: 'Proposta Enviada',
      won: 'Venda Fechada',
      lost: 'Perdido',
    };
    return labels[stage] || stage;
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {lead.full_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-6 pr-4">
            {/* Informações do Lead */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{getStageLabel(lead.pipeline_stage)}</Badge>
                {lead.proposal_value && (
                  <Badge variant="secondary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(lead.proposal_value)}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="text-sm hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Telefone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-sm hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>

                {lead.income && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Renda</Label>
                    <p className="text-sm">{lead.income}</p>
                  </div>
                )}

                {lead.cpf && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">CPF</Label>
                    <p className="text-sm">{lead.cpf}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(`tel:${lead.phone}`, '_self')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${lead.email}`, '_blank')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            <Separator />

            {/* Imóvel de Interesse */}
            {lead.property && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold">Imóvel de Interesse</h3>
                  <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    {lead.property.property_images?.[0]?.image_url && (
                      <img
                        src={lead.property.property_images[0].image_url}
                        alt={lead.property.title}
                        className="h-20 w-20 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{lead.property.title}</h4>
                      <p className="text-sm text-muted-foreground">{lead.property.location}</p>
                      <p className="text-sm font-semibold mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(lead.property.price)}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Proposta */}
            <div className="space-y-3">
              <Label htmlFor="proposal">Valor da Proposta</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="proposal"
                    type="number"
                    placeholder="0.00"
                    value={proposalValue}
                    onChange={(e) => setProposalValue(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Anotações */}
            <div className="space-y-3">
              <Label htmlFor="notes">Anotações do Corretor</Label>
              <Textarea
                id="notes"
                placeholder="Adicione suas anotações sobre este lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSaveNotes} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Anotações'}
              </Button>
            </div>

            <Separator />

            {/* Histórico */}
            <div className="space-y-3">
              <h3 className="font-semibold">Histórico de Movimentações</h3>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">
                          {item.from_stage ? (
                            <>
                              De <strong>{getStageLabel(item.from_stage)}</strong> para{' '}
                              <strong>{getStageLabel(item.to_stage)}</strong>
                            </>
                          ) : (
                            <>
                              Criado em <strong>{getStageLabel(item.to_stage)}</strong>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                        {item.notes && (
                          <p className="text-sm mt-1 italic">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
