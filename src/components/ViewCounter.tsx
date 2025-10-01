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
      // Get current views
      const { data } = await supabase
        .from("properties")
        .select("views_count")
        .eq("id", propertyId)
        .single();

      if (data) {
        const newCount = (data.views_count || 0) + 1;
        
        // Update views
        await supabase
          .from("properties")
          .update({ views_count: newCount })
          .eq("id", propertyId);

        setViews(newCount);
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
