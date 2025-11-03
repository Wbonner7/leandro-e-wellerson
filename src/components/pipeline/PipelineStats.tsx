import { Card } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

interface PipelineStatsProps {
  totalLeads: number;
  conversionRate: number;
  totalValue: number;
  avgTime: string;
}

export const PipelineStats = ({
  totalLeads,
  conversionRate,
  totalValue,
  avgTime,
}: PipelineStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Leads Ativos</p>
            <p className="text-2xl font-bold">{totalLeads}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor em Negociação</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
              }).format(totalValue)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
            <p className="text-2xl font-bold">{avgTime}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
