import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Eye, TrendingUp, Edit, Trash2, Power, PowerOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  views_count: number;
  created_at: string;
  property_images: { image_url: string; is_primary: boolean }[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

interface Stats {
  totalProperties: number;
  totalViews: number;
  activeProperties: number;
  avgViews: number;
}

const BrokerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProperties: 0, totalViews: 0, activeProperties: 0, avgViews: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          price,
          status,
          views_count,
          created_at,
          bedrooms,
          bathrooms,
          area,
          property_images (
            image_url,
            is_primary
          )
        `)
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedProperties = data || [];
      setProperties(formattedProperties);

      // Calculate stats
      const totalViews = formattedProperties.reduce((acc, prop) => acc + (prop.views_count || 0), 0);
      const activeProps = formattedProperties.filter(p => p.status === "available").length;
      
      setStats({
        totalProperties: formattedProperties.length,
        totalViews,
        activeProperties: activeProps,
        avgViews: formattedProperties.length > 0 ? Math.round(totalViews / formattedProperties.length) : 0,
      });
    } catch (error: any) {
      toast.error("Erro ao carregar imóveis: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "available" ? "unavailable" : "available";
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId);

      if (error) throw error;

      toast.success(newStatus === "available" ? "Imóvel reativado!" : "Imóvel desativado!");
      loadProperties();
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message);
    }
  };

  const confirmDelete = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const deleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete);

      if (error) throw error;

      toast.success("Imóvel excluído com sucesso!");
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      loadProperties();
    } catch (error: any) {
      toast.error("Erro ao excluir imóvel: " + error.message);
    }
  };

  const filteredProperties = selectedStatus === "all" 
    ? properties 
    : properties.filter(p => p.status === selectedStatus);

  const getPrimaryImage = (property: Property) => {
    const primaryImg = property.property_images?.find(img => img.is_primary);
    return primaryImg?.image_url || property.property_images?.[0]?.image_url || "/placeholder.svg";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      available: { variant: "default", label: "Disponível" },
      sold: { variant: "secondary", label: "Vendido" },
      rented: { variant: "secondary", label: "Alugado" },
      unavailable: { variant: "outline", label: "Indisponível" },
    };
    const config = variants[status] || variants.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Meus Imóveis</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardDescription>Total de Imóveis</CardDescription>
                <CardTitle className="text-3xl">{stats.totalProperties}</CardTitle>
              </CardHeader>
              <CardContent>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardDescription>Visualizações Totais</CardDescription>
                <CardTitle className="text-3xl">{stats.totalViews}</CardTitle>
              </CardHeader>
              <CardContent>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardDescription>Imóveis Ativos</CardDescription>
                <CardTitle className="text-3xl">{stats.activeProperties}</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardDescription>Média de Visualizações</CardDescription>
                <CardTitle className="text-3xl">{stats.avgViews}</CardTitle>
              </CardHeader>
              <CardContent>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          {/* Properties List with Filters */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Gerenciar Imóveis</CardTitle>
              <CardDescription>Visualize e gerencie todos os seus anúncios</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Todos ({properties.length})</TabsTrigger>
                  <TabsTrigger value="available">
                    Disponíveis ({properties.filter(p => p.status === "available").length})
                  </TabsTrigger>
                  <TabsTrigger value="sold">
                    Vendidos ({properties.filter(p => p.status === "sold").length})
                  </TabsTrigger>
                  <TabsTrigger value="rented">
                    Alugados ({properties.filter(p => p.status === "rented").length})
                  </TabsTrigger>
                  <TabsTrigger value="unavailable">
                    Indisponíveis ({properties.filter(p => p.status === "unavailable").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedStatus} className="space-y-4">
                  {filteredProperties.length === 0 ? (
                    <div className="text-center py-12">
                      <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nenhum imóvel encontrado
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Comece anunciando seu primeiro imóvel
                      </p>
                      <Button onClick={() => navigate("/anunciar")}>Anunciar Imóvel</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredProperties.map((property) => (
                        <Card key={property.id} className="overflow-hidden hover:shadow-hover transition-shadow">
                          <div className="flex flex-col md:flex-row">
                            <img
                              src={getPrimaryImage(property)}
                              alt={property.title}
                              className="w-full md:w-48 h-48 object-cover"
                            />
                            <div className="flex-1 p-6">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold text-foreground mb-1">
                                    {property.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                                </div>
                                {getStatusBadge(property.status)}
                              </div>

                              <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                                {property.bedrooms && <span>{property.bedrooms} quartos</span>}
                                {property.bathrooms && <span>{property.bathrooms} banheiros</span>}
                                {property.area && <span>{property.area}m²</span>}
                              </div>

                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-2xl font-bold text-primary">
                                    R$ {property.price.toLocaleString("pt-BR")}
                                  </p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Eye className="h-3 w-3" />
                                    {property.views_count || 0} visualizações
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/property/${property.id}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/anunciar?edit=${property.id}`)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => togglePropertyStatus(property.id, property.status)}
                                  >
                                    {property.status === "available" ? (
                                      <PowerOff className="h-4 w-4 mr-1" />
                                    ) : (
                                      <Power className="h-4 w-4 mr-1" />
                                    )}
                                    {property.status === "available" ? "Desativar" : "Ativar"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => confirmDelete(property.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProperty} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default BrokerDashboard;
