import { Building2, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <Building2 className="h-6 w-6" />
          <span>ImóvelPremium</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/search" className="text-foreground hover:text-primary transition-colors">
            Buscar
          </Link>
          <Link to="/sell" className="text-foreground hover:text-primary transition-colors">
            Vender
          </Link>
          <Link to="/about" className="text-foreground hover:text-primary transition-colors">
            Sobre
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="hidden md:flex">
            <User className="h-4 w-4" />
            <span>Entrar</span>
          </Button>
          <Button variant="hero" className="hidden md:flex">
            Anunciar Imóvel
          </Button>
        </div>
      </div>
    </nav>
  );
};
