import { Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, MessageCircle, MoreVertical, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadCardProps {
  lead: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    pipeline_stage: string;
    proposal_value?: number;
    updated_at: string;
    property?: {
      title: string;
      image_url?: string;
    };
  };
  index: number;
  onViewDetails: () => void;
  onAddNote: () => void;
  onMarkAsLost: () => void;
  onViewHistory: () => void;
}

export const LeadCard = ({
  lead,
  index,
  onViewDetails,
  onAddNote,
  onMarkAsLost,
  onViewHistory,
}: LeadCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleWhatsApp = () => {
    const phone = lead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
          }`}
        >
          <div className="space-y-3">
            {/* Header com Avatar e Menu */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(lead.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm truncate">
                    {lead.full_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.updated_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onViewDetails}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddNote}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Adicionar nota
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onViewHistory}>
                    Ver histórico
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMarkAsLost} className="text-destructive">
                    Marcar como perdido
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Imóvel de interesse */}
            {lead.property && (
              <div className="flex gap-2 items-center bg-muted/50 p-2 rounded-md">
                {lead.property.image_url && (
                  <img
                    src={lead.property.image_url}
                    alt={lead.property.title}
                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                  />
                )}
                <p className="text-xs font-medium truncate flex-1">
                  {lead.property.title}
                </p>
              </div>
            )}

            {/* Valor da proposta */}
            {lead.proposal_value && (
              <Badge variant="secondary" className="w-fit">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(lead.proposal_value)}
              </Badge>
            )}

            {/* Contatos */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`tel:${lead.phone}`, '_self')}
              >
                <Phone className="h-3 w-3 mr-1" />
                Ligar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
};
