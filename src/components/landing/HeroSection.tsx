import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicLandingData } from "@/lib/api";

interface HeroSectionProps {
  heroData?: PublicLandingData["hero"];
}

const HeroSection = ({ heroData }: HeroSectionProps) => {
  const bannerImage = heroData?.images?.[0];
  const price       = heroData?.price;
  const rating      = heroData?.rating ?? 4.5;
  const reviews     = heroData?.numberOfReviews;

  return (
    <section className="relative bg-gradient-to-r from-amber-50 to-orange-50 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Design With{" "}
              <span className="text-orange-400">Modern Elegance</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Perfect For Work, Casual Days, And Special Moments.
            </p>

            {/* Price + rating strip */}
            {(price != null || reviews != null) && (
              <div className="flex items-center gap-4 justify-center md:justify-start">
                {price != null && (
                  <span className="text-xl font-bold text-foreground">
                    ₹{price.toLocaleString()}
                  </span>
                )}
                {reviews != null && (
                  <div className="flex items-center gap-1 text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-muted-foreground ml-1">
                      ({reviews.toLocaleString()} reviews)
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-6">
                Shop Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="rounded-full px-6">
                View More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Hero image */}
          {bannerImage && (
            <div className="flex-1 flex justify-center md:justify-end">
              <img
                src={bannerImage}
                alt="Hero banner"
                className="max-h-72 md:max-h-96 rounded-2xl object-cover shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
