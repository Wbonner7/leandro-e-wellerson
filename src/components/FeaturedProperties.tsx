import { useMemo } from "react";
import { PropertyCard } from "./PropertyCard";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: "1",
    image: property1,
    title: "Apartamento Moderno Vista Mar",
    location: "Barra da Tijuca, Rio de Janeiro - RJ",
    price: 1850000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    featured: true,
    type: "apartment",
    city: "rj",
  },
  {
    id: "2",
    image: property2,
    title: "Casa Contemporânea com Jardim",
    location: "Morumbi, São Paulo - SP",
    price: 3200000,
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    featured: true,
    type: "house",
    city: "sp",
  },
  {
    id: "3",
    image: property3,
    title: "Cobertura Luxo Centro",
    location: "Centro, Curitiba - PR",
    price: 4500000,
    bedrooms: 4,
    bathrooms: 4,
    area: 350,
    featured: true,
    type: "penthouse",
    city: "curitiba",
  },
];

interface FeaturedPropertiesProps {
  filters?: {
    propertyType: string;
    bedrooms: string;
    priceRange: string;
    location: string;
  };
}

export const FeaturedProperties = ({ filters }: FeaturedPropertiesProps) => {
  const filteredProperties = useMemo(() => {
    if (!filters) return properties;

    return properties.filter((property) => {
      // Filter by property type
      if (filters.propertyType && property.type !== filters.propertyType) {
        return false;
      }

      // Filter by bedrooms
      if (filters.bedrooms) {
        const minBedrooms = parseInt(filters.bedrooms);
        if (property.bedrooms < minBedrooms) {
          return false;
        }
      }

      // Filter by price range
      if (filters.priceRange) {
        const priceRanges = {
          "1": { min: 0, max: 300000 },
          "2": { min: 300000, max: 600000 },
          "3": { min: 600000, max: 1000000 },
          "4": { min: 1000000, max: Infinity },
        };
        const range = priceRanges[filters.priceRange as keyof typeof priceRanges];
        if (property.price < range.min || property.price > range.max) {
          return false;
        }
      }

      // Filter by location
      if (filters.location && property.city !== filters.location) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Imóveis em Destaque
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecionamos os melhores imóveis com localização privilegiada e acabamento premium
          </p>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Nenhum imóvel encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                price={`R$ ${property.price.toLocaleString("pt-BR")}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
