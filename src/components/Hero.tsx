import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-property.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury Property"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Encontre o Imóvel dos
          <br />
          <span className="gradient-accent bg-clip-text text-transparent">Seus Sonhos</span>
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          A plataforma mais completa para comprar e vender imóveis com tecnologia de ponta e atendimento premium.
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto bg-background rounded-xl shadow-hover p-3 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cidade, bairro ou código..."
              className="pl-10 h-12 border-0 focus-visible:ring-0 bg-transparent"
            />
          </div>
          <Button variant="hero" size="lg" className="sm:w-auto w-full">
            Buscar Imóveis
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">1.200+</div>
            <div className="text-sm text-primary-foreground/80">Imóveis Disponíveis</div>
          </div>
          <div className="text-center border-x border-primary-foreground/20">
            <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">850+</div>
            <div className="text-sm text-primary-foreground/80">Negócios Fechados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">98%</div>
            <div className="text-sm text-primary-foreground/80">Clientes Satisfeitos</div>
          </div>
        </div>
      </div>
    </section>
  );
};
