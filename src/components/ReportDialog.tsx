import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const reportSchema = z.object({
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
});

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

const reportReasons = [
  { value: "fake", label: "Anúncio falso ou enganoso" },
  { value: "duplicate", label: "Anúncio duplicado" },
  { value: "inappropriate", label: "Conteúdo inapropriado" },
  { value: "sold", label: "Imóvel já vendido" },
  { value: "price", label: "Preço incorreto" },
  { value: "other", label: "Outro motivo" },
];

export function ReportDialog({ open, onOpenChange, propertyId }: ReportDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("fake");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate input
    const validation = reportSchema.safeParse({ description });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("property_reports")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          reason,
          description: description.trim() || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Denúncia enviada! Analisaremos em breve.");
      setReason("fake");
      setDescription("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar denúncia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Denunciar Imóvel</DialogTitle>
          <DialogDescription>
            Ajude-nos a manter a plataforma segura reportando problemas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Motivo da denúncia</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label htmlFor={item.value} className="font-normal cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detalhes (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Forneça mais informações sobre o problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Denúncia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
