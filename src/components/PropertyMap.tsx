import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  address: string;
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  const initializeMap = async (token: string) => {
    if (!mapContainer.current || !latitude || !longitude) return;

    try {
      // Dynamically import mapbox
      const mapboxgl = await import("mapbox-gl");
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.default.accessToken = token;

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 15,
      });

      // Add marker
      new mapboxgl.default.Marker({ color: "#FF0000" })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.default.NavigationControl());

      setShowTokenInput(false);
      toast.success("Mapa carregado com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar o mapa. Verifique o token.");
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken) {
      localStorage.setItem("mapbox_token", mapboxToken);
      initializeMap(mapboxToken);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken && latitude && longitude) {
      setMapboxToken(savedToken);
      initializeMap(savedToken);
      setShowTokenInput(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (!latitude || !longitude) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Coordenadas GPS não disponíveis para este imóvel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
          </div>

          {showTokenInput ? (
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Configure o Mapbox</p>
                <p className="text-xs text-muted-foreground">
                  Para visualizar o mapa, você precisa de um token público do Mapbox.
                  Obtenha gratuitamente em{" "}
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
              <Input
                type="text"
                placeholder="Cole seu token público do Mapbox aqui"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Carregar Mapa
              </Button>
            </form>
          ) : (
            <div
              ref={mapContainer}
              className="w-full h-[400px] rounded-lg overflow-hidden border"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
