import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { SearchFilters } from "@/components/SearchFilters";

const Index = () => {
  const [filters, setFilters] = useState({
    propertyType: "",
    bedrooms: "",
    priceRange: "",
    location: "",
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <SearchFilters onFilterChange={setFilters} />
        <FeaturedProperties filters={filters} />
        <Features />
        <Footer />
        <CookieConsent />
      </div>
    </div>
  );
};

export default Index;
