import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Anunciar from "./pages/Anunciar";
import Agendamentos from "./pages/Agendamentos";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import LeadsManagement from "./pages/LeadsManagement";
import ClientsManagement from "./pages/ClientsManagement";
import BrokerDashboard from "./pages/BrokerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/anunciar" element={<Anunciar />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/meus-imoveis" element={<BrokerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<LeadsManagement />} />
          <Route path="/admin/clients" element={<ClientsManagement />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
