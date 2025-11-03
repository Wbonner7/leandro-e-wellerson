import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, Clock, TrendingUp, Smartphone, Monitor, Tablet, MapPin, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Property {
  id: string;
  title: string;
  location: string;
}

interface AnalyticsData {
  totalViews: number;
  uniqueViews: number;
  avgDuration: number;
  conversionRate: number;
  viewsByDay: { date: string; views: number }[];
  deviceBreakdown: { name: string; value: number }[];
  referrerBreakdown: { name: string; value: number }[];
  locationBreakdown: { city: string; state: string; count: number }[];
  recentViews: { created_at: string; device_type: string; city: string; duration_seconds: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function PropertyAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    loadAnalytics();
  }, [id, user, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load property info
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("id, title, location, owner_id")
        .eq("id", id)
        .single();

      if (propertyError) throw propertyError;

      if (propertyData.owner_id !== user?.id) {
        navigate("/meus-imoveis");
        return;
      }

      setProperty(propertyData);

      // Load analytics data
      const daysAgo = parseInt(period);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("property_analytics")
        .select("*")
        .eq("property_id", id)
        .gte("created_at", startDate.toISOString());

      if (analyticsError) throw analyticsError;

      // Process analytics data
      const viewEvents = analyticsData.filter(a => a.event_type === "view");
      const uniqueSessions = new Set(viewEvents.map(a => a.session_id)).size;
      const totalViews = viewEvents.length;
      const avgDuration = viewEvents.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / (viewEvents.filter(v => v.duration_seconds).length || 1);

      const conversions = analyticsData.filter(a => ['show_interest', 'schedule_visit', 'whatsapp_click'].includes(a.event_type)).length;
      const conversionRate = totalViews > 0 ? (conversions / totalViews) * 100 : 0;

      // Views by day
      const viewsByDay: { [key: string]: number } = {};
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "dd/MM", { locale: ptBR });
        viewsByDay[date] = 0;
      }
      viewEvents.forEach(v => {
        const date = format(new Date(v.created_at), "dd/MM", { locale: ptBR });
        if (viewsByDay[date] !== undefined) {
          viewsByDay[date]++;
        }
      });

      // Device breakdown
      const deviceCounts: { [key: string]: number } = {};
      viewEvents.forEach(v => {
        const device = v.device_type || "Desconhecido";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      // Referrer breakdown
      const referrerCounts: { [key: string]: number } = {};
      viewEvents.forEach(v => {
        let ref = "Direto";
        if (v.referrer) {
          if (v.referrer.includes("google")) ref = "Google";
          else if (v.referrer.includes("instagram") || v.referrer.includes("facebook")) ref = "Redes Sociais";
          else ref = "Outros";
        }
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });

      // Location breakdown
      const locationCounts: { [key: string]: { city: string; state: string; count: number } } = {};
      viewEvents.forEach(v => {
        if (v.city && v.state) {
          const key = `${v.city}, ${v.state}`;
          if (!locationCounts[key]) {
            locationCounts[key] = { city: v.city, state: v.state, count: 0 };
          }
          locationCounts[key].count++;
        }
      });

      setAnalytics({
        totalViews,
        uniqueViews: uniqueSessions,
        avgDuration: Math.round(avgDuration),
        conversionRate: Math.round(conversionRate * 10) / 10,
        viewsByDay: Object.entries(viewsByDay).map(([date, views]) => ({ date, views })),
        deviceBreakdown: Object.entries(deviceCounts).map(([name, value]) => ({ name, value })),
        referrerBreakdown: Object.entries(referrerCounts).map(([name, value]) => ({ name, value })),
        locationBreakdown: Object.values(locationCounts).sort((a, b) => b.count - a.count).slice(0, 10),
        recentViews: viewEvents.slice(-20).reverse().map(v => ({
          created_at: v.created_at,
          device_type: v.device_type || "Desconhecido",
          city: v.city ? `${v.city}, ${v.state}` : "Não disponível",
          duration_seconds: v.duration_seconds || 0
        }))
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property || !analytics) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button variant="ghost" onClick={() => navigate("/meus-imoveis")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Meus Imóveis
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-muted-foreground">{property.location}</p>
          </div>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as "7" | "30" | "90")} className="mb-6">
            <TabsList>
              <TabsTrigger value="7">Últimos 7 dias</TabsTrigger>
              <TabsTrigger value="30">Últimos 30 dias</TabsTrigger>
              <TabsTrigger value="90">Últimos 90 dias</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalViews}</div>
                <p className="text-xs text-muted-foreground">{analytics.uniqueViews} visitantes únicos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgDuration}s</div>
                <p className="text-xs text-muted-foreground">Por visita</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">Visualização → Interesse</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dispositivo Principal</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {analytics.deviceBreakdown[0]?.name || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.deviceBreakdown[0]?.value || 0} visualizações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Visualizações por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.viewsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.deviceBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="hsl(var(--primary))" dataKey="value">
                      {analytics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origem do Tráfego</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.referrerBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interesse por Região</CardTitle>
                <CardDescription>Top 10 cidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {analytics.locationBreakdown.map((loc, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{loc.city}, {loc.state}</span>
                      </div>
                      <span className="text-sm font-medium">{loc.count} views</span>
                    </div>
                  ))}
                  {analytics.locationBreakdown.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum dado de localização disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Views Table */}
          <Card>
            <CardHeader>
              <CardTitle>Visualizações Recentes</CardTitle>
              <CardDescription>Últimas 20 visualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Data/Hora</th>
                      <th className="text-left py-3 px-4 font-medium">Dispositivo</th>
                      <th className="text-left py-3 px-4 font-medium">Localização</th>
                      <th className="text-left py-3 px-4 font-medium">Duração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentViews.map((view, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(view.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="py-3 px-4 text-sm capitalize">{view.device_type}</td>
                        <td className="py-3 px-4 text-sm">{view.city}</td>
                        <td className="py-3 px-4 text-sm">{view.duration_seconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analytics.recentViews.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma visualização recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}