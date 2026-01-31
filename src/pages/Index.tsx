import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CollectionsSection from "@/components/landing/CollectionsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CollectionsSection />
    </div>
  );
};

export default Index;
