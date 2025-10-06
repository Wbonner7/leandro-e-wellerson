import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PropertyActions } from "@/components/PropertyActions";
import { PropertyReviews } from "@/components/PropertyReviews";
import { PropertyMap } from "@/components/PropertyMap";
import { ViewCounter } from "@/components/ViewCounter";
import { LiveViewCounter } from "@/components/LiveViewCounter";
import { BrokerReviews } from "@/components/BrokerReviews";
import { SimilarProperties } from "@/components/SimilarProperties";
import {
  ArrowLeft,
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Car,
  Wifi,
} from "lucide-react";
import property1 from "@/assets/property-1.jpg";

const PropertyDetail = () => {
  const { id } = useParams();

  // Mock data - in real app, fetch based on id
  const property = {
    id: id || "1",
    title: "Apartamento Moderno Vista Mar",
    location: "Barra da Tijuca, Rio de Janeiro - RJ",
    price: "R$ 1.850.000",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    parking: 2,
    latitude: -23.0042,
    longitude: -43.3653,
    image: property1,
    description:
      "Apartamento espetacular com vista panorâmica para o mar, totalmente mobiliado com acabamento de alto padrão. Localizado em condomínio clube com completa infraestrutura de lazer e segurança 24h. Possui varanda gourmet ampla, suíte master com closet, cozinha planejada e muito mais.",
    amenities: [
      "Piscina",
      "Academia",
      "Salão de Festas",
      "Quadra Esportiva",
      "Playground",
      "Sauna",
      "Churrasqueira",
      "Portaria 24h",
    ],
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        {/* Back Navigation */}
        <div className="bg-secondary/30 py-4">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para listagem
            </Link>
          </div>
        </div>

        {/* Property Images */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-[400px] lg:h-[600px] object-cover rounded-xl shadow-elegant"
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <img
                  src={property.image}
                  alt="View 2"
                  className="w-full h-[190px] lg:h-[290px] object-cover rounded-xl shadow-card"
                />
                <img
                  src={property.image}
                  alt="View 3"
                  className="w-full h-[190px] lg:h-[290px] object-cover rounded-xl shadow-card"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {property.title}
                      </h1>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                  </div>
                  <LiveViewCounter propertyId={property.id} />
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                    <Bed className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{property.bedrooms} Quartos</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                    <Bath className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{property.bathrooms} Banheiros</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                    <Square className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{property.area}m²</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{property.parking} Vagas</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Sobre o Imóvel</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Comodidades</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="justify-start p-3">
                        <Wifi className="h-4 w-4 mr-2" />
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <PropertyMap 
                  latitude={property.latitude}
                  longitude={property.longitude}
                  address={property.location}
                />

                <div className="mt-6">
                  <PropertyReviews propertyId={property.id} />
                </div>

                <Separator className="my-6" />

                <div className="mt-6">
                  <BrokerReviews brokerId="default-broker-id" />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-elegant">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-primary mb-1">{property.price}</div>
                    <div className="text-sm text-muted-foreground">à venda</div>
                  </div>

                  <Separator className="my-6" />

                  <PropertyActions propertyId={property.id} />

                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Disponível para visitação</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seg-Sex: 8h às 18h | Sáb: 8h às 16h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SimilarProperties currentPropertyId={property.id} />

        <Footer />
      </div>
    </div>
  );
};

export default PropertyDetail;
