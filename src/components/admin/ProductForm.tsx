import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Loader2 } from "lucide-react";

interface ColorVariant {
  id: string;
  color: string;
  colorName: string;
  image: string | null;
}

interface ProductFormProps {
  onSave?: (product: ProductData) => void;
}

export interface ProductData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  tags: string[];
  colorVariants: ColorVariant[];
}

const tagOptions = ["BEST SELLER", "TRENDING", "NEW", "HOT", "SALE", "LIMITED"];

const ProductForm = ({ onSave }: ProductFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    { id: "1", color: "#374151", colorName: "Gray", image: null },
  ]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const addColorVariant = () => {
    const newId = Date.now().toString();
    setColorVariants([
      ...colorVariants,
      { id: newId, color: "#000000", colorName: "", image: null },
    ]);
  };

  const removeColorVariant = (id: string) => {
    if (colorVariants.length > 1) {
      setColorVariants(colorVariants.filter((v) => v.id !== id));
    }
  };

  const updateColorVariant = (
    id: string,
    field: keyof ColorVariant,
    value: string | null
  ) => {
    setColorVariants(
      colorVariants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    const reader = new FileReader();
    reader.onloadend = () => {
      updateColorVariant(id, "image", reader.result as string);
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    const productData: ProductData = {
      name,
      description,
      price,
      originalPrice,
      tags: selectedTags,
      colorVariants,
    };
    onSave?.(productData);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setSelectedTags([]);
    setColorVariants([{ id: "1", color: "#374151", colorName: "Gray", image: null }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Aurora Mini Purse"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDesc">Description</Label>
            <Input
              id="productDesc"
              placeholder="Structured Crossbody With Top Handle"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              placeholder="500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price ($)</Label>
            <Input
              id="originalPrice"
              type="number"
              placeholder="800"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Color Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Color Variants</Label>
            <Button type="button" variant="outline" size="sm" onClick={addColorVariant}>
              <Plus className="w-4 h-4 mr-1" />
              Add Color
            </Button>
          </div>

          <div className="grid gap-4">
            {colorVariants.map((variant) => (
              <div
                key={variant.id}
                className="border rounded-lg p-4 bg-muted/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={variant.color}
                      onChange={(e) =>
                        updateColorVariant(variant.id, "color", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      placeholder="Color name (e.g., Gray)"
                      value={variant.colorName}
                      onChange={(e) =>
                        updateColorVariant(variant.id, "colorName", e.target.value)
                      }
                      className="w-40"
                    />
                  </div>
                  {colorVariants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColorVariant(variant.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Image Upload for this color */}
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  {variant.image ? (
                    <div className="space-y-2">
                      <img
                        src={variant.image}
                        alt={`${variant.colorName} variant`}
                        className="max-h-32 mx-auto rounded-lg object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateColorVariant(variant.id, "image", null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      {uploadingId === variant.id ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {uploadingId === variant.id
                          ? "Uploading..."
                          : "Upload image for this color"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(variant.id, e)}
                        disabled={uploadingId === variant.id}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>Save Product</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
