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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const interestSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido").max(15),
  income: z.string().min(1, "Renda familiar é obrigatória"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  message: z.string().max(1000, "Mensagem muito longa").optional(),
});

interface InterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

export function InterestDialog({ open, onOpenChange, propertyId }: InterestDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    income: "",
    cpf: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate input
    const validation = interestSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("property_interests")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          message: formData.message.trim() || null,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          income: formData.income,
          cpf: formData.cpf,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Interesse registrado! Nossa equipe de Inside Sales entrará em contato em breve.");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        income: "",
        cpf: "",
        message: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar interesse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manifestar Interesse</DialogTitle>
          <DialogDescription>
            Nossa equipe de Inside Sales entrará em contato para ajudá-lo com este imóvel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                placeholder="Seu nome completo"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Renda Familiar *</Label>
              <Input
                id="income"
                placeholder="R$ 10.000"
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Conte-nos mais sobre seu interesse neste imóvel..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Interesse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
