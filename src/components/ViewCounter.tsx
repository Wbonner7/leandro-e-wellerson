import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ViewCounterProps {
  propertyId: string;
}

export function ViewCounter({ propertyId }: ViewCounterProps) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const incrementViews = async () => {
      try {
        // Use atomic increment function to prevent race conditions
        const { data, error } = await supabase.rpc('increment_property_views', {
          property_uuid: propertyId
        });

        if (error) throw error;
        
        setViews(data || 0);
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    incrementViews();
  }, [propertyId]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span>{views} {views === 1 ? "visualização" : "visualizações"}</span>
    </div>
  );
}
