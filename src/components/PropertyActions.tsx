import { useState, useEffect } from "react";
import { Heart, Calendar, MessageSquare, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InterestDialog } from "./InterestDialog";
import { VisitScheduleDialog } from "./VisitScheduleDialog";
import { ReportDialog } from "./ReportDialog";

interface PropertyActionsProps {
  propertyId: string;
}

export function PropertyActions({ propertyId }: PropertyActionsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const checkIfFavorite = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();
    
    setIsFavorite(!!data);
  };

  useEffect(() => {
    checkIfFavorite();
  }, [propertyId, user]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);
        
        toast.success("Removido dos favoritos");
        setIsFavorite(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: propertyId });
        
        toast.success("Adicionado aos favoritos");
        setIsFavorite(true);
      }
    } catch (error) {
      toast.error("Erro ao atualizar favoritos");
    } finally {
      setLoading(false);
    }
  };

  const handleInterestClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setInterestOpen(true);
  };

  const handleScheduleClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setScheduleOpen(true);
  };

  const handleReportClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setReportOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={toggleFavorite}
          disabled={loading}
          className="flex-1"
        >
          <Heart className={`h-5 w-5 mr-2 ${isFavorite ? "fill-current text-red-500" : ""}`} />
          {isFavorite ? "Favoritado" : "Favoritar"}
        </Button>
        
        <Button
          variant="hero"
          size="lg"
          onClick={handleInterestClick}
          className="flex-1"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Tenho Interesse
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleScheduleClick}
          className="flex-1"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Agendar Visita
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReportClick}
          title="Denunciar imóvel"
        >
          <Flag className="h-5 w-5" />
        </Button>
      </div>

      <InterestDialog
        open={interestOpen}
        onOpenChange={setInterestOpen}
        propertyId={propertyId}
      />
      
      <VisitScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        propertyId={propertyId}
      />
      
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        propertyId={propertyId}
      />
    </>
  );
}
