import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6" />
              <span className="font-bold text-xl">Mançores Elite</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm mb-4">
              A plataforma mais completa para encontrar o imóvel dos seus sonhos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Buscar Imóveis
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Anunciar
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/80">Compra</li>
              <li className="text-primary-foreground/80">Venda</li>
              <li className="text-primary-foreground/80">Aluguel</li>
              <li className="text-primary-foreground/80">Avaliação</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>(11) 3456-7890</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>contato@mancoreselite.com</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© 2024 Mançores Elite. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
