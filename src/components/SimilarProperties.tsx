import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square } from "lucide-react";
import { Link } from "react-router-dom";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

interface SimilarProperty {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  similarity: number;
}

const similarProperties: SimilarProperty[] = [
  {
    id: "2",
    image: property2,
    title: "Casa Contemporânea com Jardim",
    location: "Morumbi, São Paulo - SP",
    price: "R$ 3.200.000",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    similarity: 92,
  },
  {
    id: "3",
    image: property3,
    title: "Cobertura Luxo Centro",
    location: "Centro, Curitiba - PR",
    price: "R$ 4.500.000",
    bedrooms: 4,
    bathrooms: 4,
    area: 350,
    similarity: 85,
  },
  {
    id: "4",
    image: property1,
    title: "Apartamento Vista Parque",
    location: "Jardins, São Paulo - SP",
    price: "R$ 2.100.000",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    similarity: 78,
  },
];

interface SimilarPropertiesProps {
  currentPropertyId: string;
}

export function SimilarProperties({ currentPropertyId }: SimilarPropertiesProps) {
  const filtered = similarProperties.filter(p => p.id !== currentPropertyId);

  return (
    <div className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Imóveis Similares</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <Link key={property.id} to={`/property/${property.id}`}>
              <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-3 right-3 bg-primary text-primary-foreground"
                  >
                    {property.similarity}% Similar
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{property.location}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{property.area}m²</span>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-primary">{property.price}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
