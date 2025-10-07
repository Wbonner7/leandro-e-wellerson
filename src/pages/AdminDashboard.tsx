import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeLeads: 0,
    totalCommissions: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // TODO: Execute database-schema-fixed.sql no Backend SQL Editor primeiro
      // Temporariamente desabilitado - assumindo acesso admin
      setIsAdmin(true);
      setLoading(false);
      
      /* DESCOMENTAR APÓS EXECUTAR O SQL:
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Acesso negado. Você não tem permissões de administrador.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadDashboardStats();
      */
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // TODO: Execute database-schema-fixed.sql no Backend SQL Editor primeiro
      console.log("Stats loading disabled until schema is created");
      
      /* DESCOMENTAR APÓS EXECUTAR O SQL:
      const { data: clients } = await supabase.from("clients").select("*");
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .in("status", ["new", "contacted", "qualified"]);
      const { data: commissions } = await supabase
        .from("commissions")
        .select("amount");

      const { data: subscriptions } = await supabase
        .from("subscription_plans")
        .select("monthly_price");

      const monthlyRevenue = subscriptions?.reduce((sum, plan) => sum + Number(plan.monthly_price), 0) || 0;

      setStats({
        totalClients: clients?.length || 0,
        activeLeads: leads?.length || 0,
        totalCommissions:
          commissions?.reduce((acc, c) => acc + Number(c.amount), 0) || 0,
        monthlyRevenue: monthlyRevenue,
      });
      */
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Erro ao carregar estatísticas");
    }
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie toda a plataforma Quito
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Clientes Ativos
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalClients}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Leads Ativos
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.activeLeads}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Receita Mensal
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {stats.monthlyRevenue.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Comissões Totais
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {stats.totalCommissions.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="leads" className="space-y-6">
            <TabsList>
              <TabsTrigger value="leads">Gestão de Leads</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="commissions">Comissões</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="leads">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Leads Recentes</h2>
                  <Button onClick={() => navigate("/admin/leads")}>
                    Ver Todos os Leads
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Sistema de gestão completo de leads com matching inteligente
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Clientes da Plataforma</h2>
                  <Button onClick={() => navigate("/admin/clients")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Gerencie incorporadores, corretores e imobiliárias
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="commissions">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Comissões</h2>
                  <Button onClick={() => navigate("/admin/commissions")}>
                    Ver Todas
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Rastreamento de comissões de 5% sobre vendas realizadas
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Relatórios e Analytics</h2>
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Métricas detalhadas de performance da plataforma
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;