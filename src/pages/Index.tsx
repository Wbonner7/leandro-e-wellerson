import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SearchFilters } from "@/components/SearchFilters";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <SearchFilters />
        <FeaturedProperties />
        <Features />
        <Footer />
        <CookieConsent />
      </div>
    </div>
  );
};

export default Index;
