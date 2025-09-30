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
    price: "R$ 8.500",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    featured: true,
  },
  {
    id: "2",
    image: property2,
    title: "Casa Contemporânea com Jardim",
    location: "Morumbi, São Paulo - SP",
    price: "R$ 12.000",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    featured: true,
  },
  {
    id: "3",
    image: property3,
    title: "Cobertura Luxo Centro",
    location: "Centro, Curitiba - PR",
    price: "R$ 15.500",
    bedrooms: 4,
    bathrooms: 4,
    area: 350,
    featured: true,
  },
];

export const FeaturedProperties = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
};
