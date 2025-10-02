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

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !date) return;

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
          notes: notes.trim() || null,
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
              disabled={(date) => date < new Date()}
              className="rounded-md border"
              locale={ptBR}
            />
          </div>
          
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
          </div>

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
