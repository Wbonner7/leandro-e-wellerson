import { Droppable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface PipelineColumnProps {
  id: string;
  title: string;
  count: number;
  icon: LucideIcon;
  colorClass: string;
  children: React.ReactNode;
}

export const PipelineColumn = ({
  id,
  title,
  count,
  icon: Icon,
  colorClass,
  children,
}: PipelineColumnProps) => {
  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-t-lg p-4 ${colorClass}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <Badge variant="secondary">{count}</Badge>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[500px] p-4 rounded-t-none border-t-0 ${
              snapshot.isDraggingOver ? 'bg-muted/50 ring-2 ring-primary' : ''
            }`}
          >
            {children}
            {provided.placeholder}
          </Card>
        )}
      </Droppable>
    </div>
  );
};
