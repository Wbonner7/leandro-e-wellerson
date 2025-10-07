import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Target,
  TrendingUp,
  DollarSign,
  Package,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: string;
  lead_id: string;
  full_name: string;
  email: string;
  phone: string;
  budget_min: number;
  budget_max: number;
  interest_location: string;
  status: string;
  created_at: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    leadsThisMonth: 0,
    leadsQuota: 0,
    activeNegotiations: 0,
  });

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // TODO: Execute database-schema-fixed.sql no Backend SQL Editor primeiro
      console.log("Client dashboard disabled until schema is created");
      
      /* DESCOMENTAR APÓS EXECUTAR O SQL:
      const { data: client } = await supabase
        .from("clients")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (client) {
        setClientData(client);

        const { data: leadsData } = await supabase
          .from("leads")
          .select("*")
          .eq("assigned_client_id", client.id)
          .order("created_at", { ascending: false })
          .limit(10);

        setLeads(leadsData || []);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthCount } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("assigned_client_id", client.id)
          .gte("created_at", startOfMonth.toISOString());

        const { count: activeCount } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("assigned_client_id", client.id)
          .in("status", ["contacted", "negotiating"]);

        setStats({
          leadsThisMonth: monthCount || 0,
          leadsQuota: client.subscription_plans.leads_quota || 0,
          activeNegotiations: activeCount || 0,
        });
      }
      */
    } catch (error) {
      console.error("Error loading client data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Painel do Cliente
            </h1>
            <p className="text-muted-foreground">
              {clientData?.company_name} - {clientData?.subscription_plans?.name}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Leads Recebidos
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.leadsThisMonth} / {stats.leadsQuota}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mês
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Em Negociação
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.activeNegotiations}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leads ativos
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Plano Atual
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {clientData?.subscription_plans?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {Number(clientData?.subscription_plans?.monthly_price).toLocaleString("pt-BR")}/mês
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Leads List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Leads Recebidos</h2>
            <div className="space-y-4">
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum lead recebido ainda
                  </p>
                </div>
              ) : (
                leads.map((lead) => (
                  <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{lead.full_name}</h3>
                          <Badge variant="outline">{lead.lead_id}</Badge>
                          {getStatusBadge(lead.status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
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
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          R$ {Number(lead.budget_min).toLocaleString("pt-BR")} - 
                          R$ {Number(lead.budget_max).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        Atualizar Status
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Ver Detalhes
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientDashboard;