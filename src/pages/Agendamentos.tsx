import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  notes: string | null;
  property_id: string;
  properties: {
    title: string;
    location: string;
    price: number;
  };
}

export default function Agendamentos() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadVisits();
  }, []);

  const checkAuthAndLoadVisits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await loadVisits();
  };

  const loadVisits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("property_visits")
        .select(`
          *,
          properties (
            title,
            location,
            price
          )
        `)
        .eq("user_id", user.id)
        .order("visit_date", { ascending: true });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const cancelVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from("property_visits")
        .update({ status: "cancelled" })
        .eq("id", visitId);

      if (error) throw error;
      
      toast.success("Visita cancelada com sucesso");
      await loadVisits();
    } catch (error: any) {
      toast.error("Erro ao cancelar visita");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-800 border-blue-200" },
      completed: { label: "Concluído", className: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-800 border-gray-200" },
    };
    
    const variant = variants[status] || variants.scheduled;
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8">Meus Agendamentos</h1>

            {visits.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma visita agendada</h3>
                  <p className="text-muted-foreground mb-6">
                    Comece a agendar visitas aos imóveis que você gostou!
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Explorar Imóveis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {visits.map((visit) => (
                  <Card key={visit.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {visit.properties.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{visit.properties.location}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {format(new Date(visit.visit_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {format(new Date(visit.visit_date), "HH:mm")}
                              </span>
                            </div>
                            {getStatusBadge(visit.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-2">
                            R$ {visit.properties.price.toLocaleString('pt-BR')}
                          </div>
                          {visit.status === "scheduled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelVisit(visit.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {visit.notes && (
                      <CardContent className="pt-0">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                          <p className="text-sm">{visit.notes}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
