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
  Building2,
  Mail,
  Phone,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
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

      loadClients();
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    }
  };

  const loadClients = async () => {
    try {
      // TODO: Execute database-schema-fixed.sql no Backend SQL Editor primeiro
      console.log("Clients loading disabled until schema is created");
      
      /* DESCOMENTAR APÓS EXECUTAR O SQL:
      const { data, error } = await supabase
        .from("clients")
        .select("*, subscription_plans(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClients(data || []);
      */
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { label: string; variant: any } } = {
      incorporador: { label: "Incorporador", variant: "default" },
      corretor: { label: "Corretor", variant: "secondary" },
      imobiliaria: { label: "Imobiliária", variant: "default" },
    };

    const typeInfo = typeMap[type] || { label: type, variant: "default" };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
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
                  Gestão de Clientes
                </h1>
                <p className="text-muted-foreground">
                  Total de {clients.length} clientes ativos
                </p>
              </div>
              <Button onClick={() => navigate("/admin")}>
                Voltar ao Dashboard
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar por empresa ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </Card>
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    {getClientTypeBadge(client.client_type)}
                  </div>

                  <h3 className="font-semibold text-xl mb-3">{client.company_name}</h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {client.subscription_plans?.name || "Sem plano"}
                    </div>
                  </div>

                  {client.subscription_plans && (
                    <div className="bg-primary/5 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Leads/mês:</span>
                        <span className="font-semibold">{client.subscription_plans.leads_quota}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-muted-foreground">Mensalidade:</span>
                        <span className="font-semibold text-primary">
                          R$ {Number(client.subscription_plans.monthly_price).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Ver Leads
                    </Button>
                    <Button size="sm" className="flex-1">
                      Editar
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

export default ClientsManagement;
