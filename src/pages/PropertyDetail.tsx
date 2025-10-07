import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PropertyActions } from "@/components/PropertyActions";
import { PropertyReviews } from "@/components/PropertyReviews";
import { PropertyMap } from "@/components/PropertyMap";
import { LiveViewCounter } from "@/components/LiveViewCounter";
import { BrokerReviews } from "@/components/BrokerReviews";
import { SimilarProperties } from "@/components/SimilarProperties";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Bed,
  Bath,
  Square,
  MapPin,
  Car,
  Building,
  Check,
  Info,
  Calendar,
} from "lucide-react";
import property1 from "@/assets/property-1.jpg";

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = {
    id: id || "1",
    title: "Apartamento com 55m², 2 quartos e 1 vaga",
    location: "Pompeia, São Paulo",
    fullAddress: "Rua Doutor Augusto de Miranda",
    price: "R$ 450.000",
    pricePerM2: "R$ 8.182/m²",
    bedrooms: 2,
    bathrooms: 1,
    area: 55,
    parking: 1,
    floor: "Até 3º andar",
    furnished: "Sem mobília",
    latitude: -23.0042,
    longitude: -43.3653,
    images: [property1, property1, property1, property1],
    description:
      "Apartamento com excelente localização, próximo a comércios, transporte público e áreas de lazer. Condomínio com infraestrutura completa. Imóvel pronto para morar, com acabamento de qualidade.",
    amenities: [
      "Aceita pet",
      "Piscina",
      "Academia",
      "Salão de festas",
      "Portaria 24h",
      "Playground",
    ],
    condominium: "R$ 900",
    iptu: "R$ 150/mês",
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Image Gallery */}
        <section className="relative bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="relative h-[500px]">
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>

              {/* Actions - Top Right */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all">
                  <Share2 className="h-5 w-5 text-foreground" />
                </button>
                <button className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all">
                  <Heart className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {property.images.length} Fotos
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Início</Link>
              <span>›</span>
              <Link to="/" className="hover:text-primary">São Paulo</Link>
              <span>›</span>
              <Link to="/" className="hover:text-primary">Pompeia</Link>
              <span>›</span>
              <span className="text-foreground">Imóvel {property.id}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Property Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Badge */}
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary border-0">Exclusivo</Badge>
                  <h1 className="text-3xl font-bold text-foreground mb-3">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.fullAddress}</span>
                  </div>
                  <p className="text-muted-foreground">{property.location}</p>
                </div>

                {/* Price */}
                <div className="bg-background border rounded-lg p-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-primary">{property.price}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">{property.pricePerM2}</span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button size="lg" className="flex-1">
                      <Calendar className="h-5 w-5 mr-2" />
                      Agendar visita
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1">
                      Tenho interesse
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm text-green-900 font-medium mb-1">✓ Documentação verificada</p>
                    <p className="text-sm text-green-800">
                      Imóvel com documentação regularizada e pronto para negociação.
                    </p>
                  </div>
                </div>

                {/* Property Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Área</div>
                      <div className="font-semibold">{property.area} m²</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Quartos</div>
                      <div className="font-semibold">{property.bedrooms}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Banheiros</div>
                      <div className="font-semibold">{property.bathrooms}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Vagas</div>
                      <div className="font-semibold">{property.parking}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Andar</div>
                      <div className="font-semibold">{property.floor}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Pet</div>
                      <div className="font-semibold">Aceita pet</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Mobília</div>
                      <div className="font-semibold">{property.furnished}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Sobre o imóvel</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Comodidades</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-foreground">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Localização</h2>
                  <PropertyMap 
                    latitude={property.latitude}
                    longitude={property.longitude}
                    address={property.location}
                  />
                </div>

                {/* Reviews */}
                <div>
                  <PropertyReviews propertyId={property.id} />
                </div>

                {/* Broker Reviews */}
                <div>
                  <BrokerReviews brokerId="default-broker-id" />
                </div>
              </div>

              {/* Right Column - Pricing Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Price Breakdown Card */}
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Informações Financeiras</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Valor do imóvel</span>
                        <span className="font-semibold">{property.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Valor por m²</span>
                        <span className="font-semibold">{property.pricePerM2}</span>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Condomínio</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-semibold">{property.condominium}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">IPTU</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-semibold">{property.iptu}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button variant="outline" className="w-full">
                        Simular financiamento
                      </Button>
                    </div>
                  </div>

                  {/* Visit Info */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Visita presencial ou virtual</p>
                        <p>Agende sua visita e conheça o imóvel com nosso corretor especializado.</p>
                      </div>
                    </div>
                  </div>

                  {/* View Counter */}
                  <LiveViewCounter propertyId={property.id} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Properties */}
        <SimilarProperties currentPropertyId={property.id} />

        <Footer />
      </div>
    </div>
  );
};

export default PropertyDetail;
