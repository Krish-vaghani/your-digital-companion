import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CollectionsSection from "@/components/landing/CollectionsSection";
import { publicLandingApi, type PublicLandingData, type PublicProduct } from "@/lib/api";

const Index = () => {
  const [landing, setLanding]   = useState<PublicLandingData | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    publicLandingApi
      .getLanding()
      .then(setLanding)
      .catch(() => setLanding(null))
      .finally(() => setLoading(false));
  }, []);

  const bestCollections: PublicProduct[] = publicLandingApi.extractProducts(landing?.best_collections);
  const elevateLook:     PublicProduct[] = publicLandingApi.extractProducts(landing?.elevate_look);
  const freshStyles:     PublicProduct[] = publicLandingApi.extractProducts(landing?.fresh_styles);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection heroData={landing?.hero} />
      <CollectionsSection
        bestCollections={bestCollections}
        elevateLook={elevateLook}
        freshStyles={freshStyles}
        loading={loading}
      />
    </div>
  );
};

export default Index;
