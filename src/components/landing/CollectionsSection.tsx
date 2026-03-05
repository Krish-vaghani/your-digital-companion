import ProductCard from "./ProductCard";
import type { PublicProduct } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  products: PublicProduct[];
  loading?: boolean;
}

const SectionBlock = ({ title, subtitle, products, loading }: SectionBlockProps) => {
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const defaultVariant =
                product.colorVariants?.find((v) => v.default) ??
                product.colorVariants?.[0];
              const image    = defaultVariant?.images?.[0] ?? "";
              const colors   = (product.colorVariants ?? []).map((v) => v.colorCode);
              const tag      = product.tags?.[0] as
                | "bestseller" | "hot" | "trending" | "sale"
                | undefined;
              const badgeMap: Record<string, { text: string; type: "bestseller" | "trending" | "new" | "hot" }> = {
                bestseller: { text: "BEST SELLER", type: "bestseller" },
                hot:        { text: "HOT",         type: "hot"        },
                trending:   { text: "TRENDING",    type: "trending"   },
                sale:       { text: "SALE",        type: "new"        },
              };

              return (
                <ProductCard
                  key={product._id}
                  name={product.name}
                  description={product.shortDescription ?? product.description ?? ""}
                  price={product.price}
                  originalPrice={product.originalPrice ?? product.price}
                  rating={4}
                  reviews={`Reviews`}
                  image={image}
                  badge={tag ? badgeMap[tag] : undefined}
                  colors={colors}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── CollectionsSection ────────────────────────────────────────────────────────

interface CollectionsSectionProps {
  bestCollections:  PublicProduct[];
  elevateLook:      PublicProduct[];
  freshStyles:      PublicProduct[];
  loading?:         boolean;
}

const CollectionsSection = ({
  bestCollections,
  elevateLook,
  freshStyles,
  loading,
}: CollectionsSectionProps) => {
  return (
    <div>
      <SectionBlock
        title="Our Best Collections"
        subtitle="Discover Our Most Loved Purse Collections, Designed To Match Every Mood, Outfit, And Occasion."
        products={bestCollections}
        loading={loading}
      />
      <SectionBlock
        title="Elevate Your Look"
        subtitle="Statement pieces crafted to turn heads wherever you go."
        products={elevateLook}
        loading={loading}
      />
      <SectionBlock
        title="Fresh Styles"
        subtitle="The latest arrivals – light, vibrant, and perfect for everyday outings."
        products={freshStyles}
        loading={loading}
      />
    </div>
  );
};

export default CollectionsSection;
