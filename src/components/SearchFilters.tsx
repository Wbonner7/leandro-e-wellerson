import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SearchFilters = () => {
  return (
    <section className="py-12 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="w-full lg:w-auto flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 w-full">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tipo de Imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="condo">Condomínio</SelectItem>
                <SelectItem value="penthouse">Cobertura</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Quartos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+ Quarto</SelectItem>
                <SelectItem value="2">2+ Quartos</SelectItem>
                <SelectItem value="3">3+ Quartos</SelectItem>
                <SelectItem value="4">4+ Quartos</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Faixa de Preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Até R$ 3.000</SelectItem>
                <SelectItem value="2">R$ 3.000 - R$ 6.000</SelectItem>
                <SelectItem value="3">R$ 6.000 - R$ 10.000</SelectItem>
                <SelectItem value="4">R$ 10.000+</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sp">São Paulo</SelectItem>
                <SelectItem value="rj">Rio de Janeiro</SelectItem>
                <SelectItem value="bh">Belo Horizonte</SelectItem>
                <SelectItem value="curitiba">Curitiba</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="default" className="w-full sm:w-auto">
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </section>
  );
};
