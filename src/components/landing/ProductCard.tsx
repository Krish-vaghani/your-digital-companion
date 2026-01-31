import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: string;
  image: string;
  badge?: {
    text: string;
    type: "bestseller" | "trending" | "new" | "hot";
  };
  colors: string[];
}

const badgeStyles = {
  bestseller: "bg-red-500 text-white",
  trending: "bg-slate-800 text-white",
  new: "bg-slate-600 text-white",
  hot: "bg-orange-500 text-white",
};

const badgeIcons = {
  bestseller: "🏆",
  trending: "📈",
  new: "✨",
  hot: "🔥",
};

const ProductCard = ({
  name,
  description,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  badge,
  colors,
}: ProductCardProps) => {
  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge */}
        {badge && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badgeStyles[badge.type]}`}>
            <span>{badgeIcons[badge.type]}</span>
            {badge.text}
          </div>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white w-8 h-8"
        >
          <Heart className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="flex gap-1">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">${price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">({reviews})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
