import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";

interface FavoriteProperty {
  id: string;
  properties: {
    id: string;
    title: string;
    location: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    property_images: Array<{ image_url: string; is_primary: boolean }>;
  };
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          properties (
            id,
            title,
            location,
            price,
            bedrooms,
            bathrooms,
            area,
            property_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites((data as any) || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-4xl font-bold">Meus Favoritos</h1>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Nenhum favorito ainda</h2>
              <p className="text-muted-foreground mb-6">
                Comece a favoritar imóveis para vê-los aqui
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => {
                const property = fav.properties;
                const primaryImage = property.property_images?.find(
                  (img) => img.is_primary
                );

                return (
                  <PropertyCard
                    key={fav.id}
                    id={property.id}
                    title={property.title}
                    location={property.location}
                    price={`R$ ${property.price.toLocaleString("pt-BR")}`}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    area={property.area}
                    image={primaryImage?.image_url || "/placeholder.svg"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
