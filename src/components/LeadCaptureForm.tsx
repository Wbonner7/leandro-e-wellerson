import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const LeadCaptureForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    monthly_income: "",
    interest_location: "",
    property_type: "apartamento",
    budget_min: "",
    budget_max: "",
    bedrooms_min: "2",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("leads").insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          monthly_income: formData.monthly_income,
          interest_location: formData.interest_location,
          property_type: formData.property_type,
          budget_min: parseFloat(formData.budget_min) || 0,
          budget_max: parseFloat(formData.budget_max) || 0,
          bedrooms_min: parseInt(formData.bedrooms_min) || 1,
          notes: formData.notes,
          status: "novo",
        },
      ]);

      if (error) throw error;

      toast.success("Obrigado! Seu interesse foi registrado. Em breve um corretor entrará em contato.");
      
      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        cpf: "",
        monthly_income: "",
        interest_location: "",
        property_type: "apartamento",
        budget_min: "",
        budget_max: "",
        bedrooms_min: "2",
        notes: "",
      });
    } catch (error: any) {
      console.error("Error submitting lead:", error);
      toast.error("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tenho Interesse</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthly_income">Renda Mensal (opcional)</Label>
            <Input
              id="monthly_income"
              type="number"
              value={formData.monthly_income}
              onChange={(e) => handleChange("monthly_income", e.target.value)}
              placeholder="5000"
            />
          </div>
          <div>
            <Label htmlFor="interest_location">Localização de Interesse *</Label>
            <Input
              id="interest_location"
              value={formData.interest_location}
              onChange={(e) => handleChange("interest_location", e.target.value)}
              placeholder="Ex: Pompeia, São Paulo"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="property_type">Tipo de Imóvel *</Label>
            <Select
              value={formData.property_type}
              onValueChange={(value) => handleChange("property_type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="cobertura">Cobertura</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="budget_min">Orçamento Mínimo *</Label>
            <Input
              id="budget_min"
              type="number"
              value={formData.budget_min}
              onChange={(e) => handleChange("budget_min", e.target.value)}
              placeholder="300000"
              required
            />
          </div>
          <div>
            <Label htmlFor="budget_max">Orçamento Máximo *</Label>
            <Input
              id="budget_max"
              type="number"
              value={formData.budget_max}
              onChange={(e) => handleChange("budget_max", e.target.value)}
              placeholder="500000"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bedrooms_min">Quartos Mínimo *</Label>
          <Select
            value={formData.bedrooms_min}
            onValueChange={(value) => handleChange("bedrooms_min", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+ Quarto</SelectItem>
              <SelectItem value="2">2+ Quartos</SelectItem>
              <SelectItem value="3">3+ Quartos</SelectItem>
              <SelectItem value="4">4+ Quartos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Conte-nos mais sobre o que você procura..."
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Interesse"
          )}
        </Button>
      </form>
    </Card>
  );
};
