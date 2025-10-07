import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

const visitSchema = z.object({
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

interface VisitScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

export function VisitScheduleDialog({ open, onOpenChange, propertyId }: VisitScheduleDialogProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Horários comerciais: Seg-Sex: 8h-18h, Sáb: 8h-16h
  const getTimeSlots = (selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    
    // Domingo bloqueado
    if (dayOfWeek === 0) return [];
    
    // Sábado: 8h-16h
    if (dayOfWeek === 6) {
      return ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
    }
    
    // Seg-Sex: 8h-18h
    return ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  };

  const timeSlots = getTimeSlots(date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se usuário está logado
    if (!user) {
      toast.error("Faça login para agendar uma visita");
      return;
    }
    
    if (!date) {
      toast.error("Selecione uma data para a visita");
      return;
    }

    // Validate input
    const validation = visitSchema.safeParse({ notes });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = time.split(":");
      const visitDate = new Date(date);
      visitDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const { error } = await supabase
        .from("property_visits")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          visit_date: visitDate.toISOString(),
          status: "scheduled",
          notes: notes.trim() || undefined,
        });

      if (error) throw error;

      // Aqui poderia integrar com Google Calendar e WhatsApp
      toast.success(
        `Visita agendada para ${format(visitDate, "PPP 'às' HH:mm", { locale: ptBR })}!`
      );
      
      setDate(undefined);
      setTime("09:00");
      setNotes("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao agendar visita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agendar Visita</DialogTitle>
          <DialogDescription>
            Escolha o melhor dia e horário para visitar o imóvel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Data da visita</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => {
                const day = date.getDay();
                return date < new Date() || day === 0; // Bloqueia datas passadas e domingos
              }}
              className="rounded-md border"
              locale={ptBR}
            />
            {date && date.getDay() === 0 && (
              <p className="text-sm text-destructive">Visitas não são realizadas aos domingos.</p>
            )}
          </div>
          
          {timeSlots.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {date && date.getDay() === 6 
                  ? "Sábado: horário disponível das 8h às 16h"
                  : "Segunda a Sexta: horário disponível das 8h às 18h"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma data para ver os horários disponíveis.</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Alguma observação sobre a visita?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !date}>
              {loading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
