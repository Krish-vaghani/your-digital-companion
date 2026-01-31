import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Trash2, Edit } from "lucide-react";
import { ProductData } from "./ProductForm";

interface ProductListProps {
  products: ProductData[];
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
}

const ProductList = ({ products, onDelete, onEdit }: ProductListProps) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products added yet</p>
            <p className="text-sm">Use the form above to add products</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Products ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 flex gap-4 items-start hover:bg-muted/30 transition-colors"
            >
              {/* First color variant image */}
              {product.colorVariants[0]?.image ? (
                <img
                  src={product.colorVariants[0].image}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium truncate">{product.name || "Untitled"}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(index)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold">${product.price || "0"}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Color Swatches */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Colors:</span>
                  <div className="flex gap-1">
                    {product.colorVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="w-5 h-5 rounded-full border-2 border-border"
                        style={{ backgroundColor: variant.color }}
                        title={variant.colorName}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;
