import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeadsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      loadLeads();
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    }
  };

  const loadLeads = async () => {
    try {
      // TODO: Execute database-schema-fixed.sql no Backend SQL Editor primeiro
      console.log("Leads loading disabled until schema is created");
      
      /* DESCOMENTAR APÓS EXECUTAR O SQL:
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLeads(data || []);
      */
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lead_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: any } } = {
      novo: { label: "Novo", variant: "default" },
      contatado: { label: "Contatado", variant: "secondary" },
      em_negociacao: { label: "Em Negociação", variant: "default" },
      proposta: { label: "Proposta Enviada", variant: "default" },
      vendido: { label: "Vendido", variant: "default" },
      perdido: { label: "Perdido", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Gestão de Leads
                </h1>
                <p className="text-muted-foreground">
                  Total de {leads.length} leads registrados
                </p>
              </div>
              <Button onClick={() => navigate("/admin")}>
                Voltar ao Dashboard
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Nenhum lead encontrado</p>
              </Card>
            ) : (
              filteredLeads.map((lead) => (
                <Card key={lead.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-xl">{lead.full_name}</h3>
                        <Badge variant="outline">{lead.lead_id || "ID pendente"}</Badge>
                        {getStatusBadge(lead.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </div>
                        {lead.interest_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {lead.interest_location}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>

                      {(lead.budget_min || lead.budget_max) && (
                        <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-primary">
                          <DollarSign className="h-4 w-4" />
                          R$ {Number(lead.budget_min || 0).toLocaleString("pt-BR")} - 
                          R$ {Number(lead.budget_max || 0).toLocaleString("pt-BR")}
                        </div>
                      )}

                      {lead.notes && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          <strong>Obs:</strong> {lead.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Atribuir Cliente
                    </Button>
                    <Button size="sm" variant="outline">
                      Atualizar Status
                    </Button>
                    <Button size="sm">
                      Ver Histórico
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LeadsManagement;
