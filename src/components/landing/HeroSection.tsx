import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-amber-50 to-orange-50 py-12 px-4">
      <div className="container mx-auto">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Design With Modern Elegance – Perfect For Work, Casual Days, And Special Moments.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-6">
              Shop Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              View More <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
