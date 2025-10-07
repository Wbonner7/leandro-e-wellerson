import { useState } from "react";
import { Search, MapPin, Bed, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-property.jpg";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Hero = () => {
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const handleSearch = () => {
    console.log({ city, neighborhood, priceRange, bedrooms });
    toast.success("Busca em desenvolvimento! Em breve você poderá filtrar imóveis.");
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Encontre seu imóvel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="max-w-4xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Encontre o imóvel
            <br />
            <span className="text-white/90">dos seus sonhos</span>
          </h1>

          {/* Search Card */}
          <Card className="p-6 shadow-2xl bg-white/95 backdrop-blur">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">Buscar Imóveis</h2>
              <p className="text-sm text-muted-foreground">Encontre o imóvel perfeito para você</p>
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Cidade
                </label>
                <Input
                  placeholder="Busque por cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Bairro
                </label>
                <Input
                  placeholder="Busque por bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor total até
                </label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Escolha o valor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300000">R$ 300.000</SelectItem>
                    <SelectItem value="500000">R$ 500.000</SelectItem>
                    <SelectItem value="800000">R$ 800.000</SelectItem>
                    <SelectItem value="1000000">R$ 1.000.000</SelectItem>
                    <SelectItem value="1500000">R$ 1.500.000</SelectItem>
                    <SelectItem value="2000000">R$ 2.000.000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Quartos
                </label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Nº de quartos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              size="lg" 
              className="w-full h-12 text-base font-semibold"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar imóveis
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
