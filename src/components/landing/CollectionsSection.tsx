import ProductCard from "./ProductCard";

const products = [
  {
    name: "Aurora Mini Purse",
    description: "Structured Crossbody With Top Handle",
    price: 500,
    originalPrice: 800,
    rating: 4,
    reviews: "125k Reviews",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    badge: { text: "BEST SELLER", type: "bestseller" as const },
    colors: ["#374151", "#D4A574", "#E5C8A8"],
  },
  {
    name: "Velora Crossbody",
    description: "Modern Structured Handheld Bag",
    price: 3299,
    originalPrice: 4025,
    rating: 4,
    reviews: "125k Reviews",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
    badge: { text: "TRENDING", type: "trending" as const },
    colors: ["#1F2937", "#94A3B8", "#FCD34D"],
  },
  {
    name: "Bloom Mini Tote",
    description: "Compact Tote With Spacious Interior",
    price: 2199,
    originalPrice: 3250,
    rating: 4,
    reviews: "125k Reviews",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=500&fit=crop",
    badge: { text: "NEW", type: "new" as const },
    colors: ["#374151", "#F472B6", "#FB923C"],
  },
  {
    name: "Nova Chain Purse",
    description: "Premium Quilted Evening Bag",
    price: 2799,
    originalPrice: 29999,
    rating: 4,
    reviews: "125k Reviews",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop",
    badge: { text: "HOT", type: "hot" as const },
    colors: ["#FCD34D", "#FB923C", "#F472B6"],
  },
];

const CollectionsSection = () => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Our Best <span className="text-orange-400">Collections</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm">
            Discover Our Most Loved Purse Collections, Designed To Match Every Mood, Outfit, And Occasion.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
