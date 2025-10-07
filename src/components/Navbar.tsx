import { useState } from "react";
import { Building2, Menu, User, LogOut, Settings, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <Building2 className="h-6 w-6" />
          <span>Quinto</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Comprar
          </Link>
          <Link to="/anunciar" className="text-foreground hover:text-primary transition-colors">
            Anunciar
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Comprar
                </Link>
                <Link 
                  to="/anunciar" 
                  className="text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Anunciar
                </Link>
                {user ? (
                  <>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        navigate("/favoritos");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2 text-left"
                    >
                      <Heart className="h-4 w-4" />
                      Meus Favoritos
                    </button>
                    <button
                      onClick={() => {
                        navigate("/agendamentos");
                        setMobileMenuOpen(false);
                      }}
                      className="text-foreground hover:text-primary transition-colors py-2 text-left"
                    >
                      Meus Agendamentos
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-2" />
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Entrar
                    </Button>
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Anunciar Imóvel
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Menu */}
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden md:flex">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/favoritos")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Meus Favoritos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/agendamentos")}>
                    Meus Agendamentos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="hero" className="hidden md:flex">
                Anunciar Imóvel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="hidden md:flex" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                <span>Entrar</span>
              </Button>
              <Button variant="hero" className="hidden md:flex" onClick={() => navigate("/auth")}>
                Anunciar Imóvel
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
