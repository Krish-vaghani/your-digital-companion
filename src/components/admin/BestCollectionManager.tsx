import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Loader2, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ColorVariant {
  id: string;
  color: string;
  colorName: string;
  images: string[];
  default?: boolean;
}

export interface CollectionProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  tags: string[];
  colorVariants: ColorVariant[];
}

interface BestCollectionManagerProps {
  title?: string;
  /** Max products (e.g. 4 for best collection / elevate look). null = unlimited */
  maxProducts?: number | null;
  products: CollectionProduct[];
  onProductsChange: (products: CollectionProduct[]) => void;
  /** Called after add or update so parent can call save API immediately */
  onSaveRequested?: (products: CollectionProduct[]) => void;
}

// Must match backend Joi: .items(Joi.string().valid("bestseller", "hot", "trending", "sale"))
const tagOptions = ["bestseller", "hot", "trending", "sale"];
const tagLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1);

const BestCollectionManager = ({
  title = "Best Collection",
  maxProducts = 4,
  products,
  onProductsChange,
  onSaveRequested,
}: BestCollectionManagerProps) => {
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    { id: "1", color: "#374151", colorName: "Gray", images: [], default: true },
  ]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const limit = maxProducts ?? 999;
  const canAddMore = products.length < limit;

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setSelectedTags([]);
    setColorVariants([{ id: "1", color: "#374151", colorName: "Gray", images: [], default: true }]);
    setEditingIndex(null);
  };

  const addColorVariant = () => {
    const newId = Date.now().toString();
    setColorVariants([
      ...colorVariants,
      { id: newId, color: "#000000", colorName: "", images: [], default: false },
    ]);
  };

  const removeColorVariant = (id: string) => {
    if (colorVariants.length > 1) {
      const next = colorVariants.filter((v) => v.id !== id);
      const hadDefault = colorVariants.some((v) => v.id === id && v.default);
      if (hadDefault && next.length) next[0].default = true;
      setColorVariants(next);
    }
  };

  const updateColorVariant = (id: string, field: keyof ColorVariant, value: string | null | string[] | boolean) => {
    setColorVariants(
      colorVariants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const setDefaultVariant = (id: string) => {
    setColorVariants(
      colorVariants.map((v) => ({ ...v, default: v.id === id }))
    );
  };

  const addImageToVariant = (variantId: string, url: string) => {
    setColorVariants(
      colorVariants.map((v) =>
        v.id === variantId ? { ...v, images: [...(v.images || []), url] } : v
      )
    );
  };

  const removeImageFromVariant = (variantId: string, index: number) => {
    setColorVariants(
      colorVariants.map((v) =>
        v.id === variantId
          ? { ...v, images: v.images.filter((_, i) => i !== index) }
          : v
      )
    );
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setUploadingId(id);
    try {
      const url = await uploadApi.uploadImage(file);
      addImageToVariant(id, url);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    const newProduct: CollectionProduct = {
      id: editingIndex !== null ? products[editingIndex].id : Date.now().toString(),
      name,
      description,
      price,
      originalPrice,
      tags: selectedTags,
      colorVariants,
    };

    const nextProducts =
      editingIndex !== null
        ? products.map((p, i) => (i === editingIndex ? newProduct : p))
        : [...products, newProduct];
    onProductsChange(nextProducts);
    onSaveRequested?.(nextProducts);
    resetForm();
  };

  const handleEdit = (index: number) => {
    const product = products[index];
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setOriginalPrice(product.originalPrice);
    setSelectedTags(product.tags);
    const variants = product.colorVariants.map((v) => ({
      ...v,
      images: Array.isArray(v.images) ? v.images : (v as { image?: string | null }).image ? [(v as { image: string }).image] : [],
      default: v.default ?? false,
    }));
    if (variants.length && !variants.some((v) => v.default)) variants[0].default = true;
    setColorVariants(variants);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    onProductsChange(products.filter((_, i) => i !== index));
    if (editingIndex === index) resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title} ({products.length}{maxProducts != null ? `/${maxProducts}` : ""})</span>
            {maxProducts != null && (
              <Badge variant={canAddMore ? "secondary" : "destructive"}>
                {canAddMore ? `${maxProducts - products.length} slots left` : "Full"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products in collection</p>
              <p className="text-sm">Add products using the form below{maxProducts != null ? ` (max ${maxProducts})` : ""}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  {(() => {
                  const firstImg = product.colorVariants.find((v) => v.default)?.images?.[0]
                    ?? product.colorVariants[0]?.images?.[0];
                  return firstImg ? (
                    <img
                      src={firstImg}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                  );
                })()}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">${product.price || "0"}</p>
                    {product.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tagLabel(tag)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(canAddMore || editingIndex !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {editingIndex !== null ? "Edit Product" : "Add Product to Collection"}
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
                    {tagLabel(tag)}
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
                  <div key={variant.id} className="border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={variant.color}
                          onChange={(e) => updateColorVariant(variant.id, "color", e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          placeholder="Color name (e.g., Gray)"
                          value={variant.colorName}
                          onChange={(e) => updateColorVariant(variant.id, "colorName", e.target.value)}
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

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`default-${variant.id}`}
                        checked={!!variant.default}
                        onCheckedChange={() => setDefaultVariant(variant.id)}
                      />
                      <Label htmlFor={`default-${variant.id}`} className="text-sm font-normal cursor-pointer">
                        Default variant
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Images</Label>
                      <div className="flex flex-wrap gap-2">
                        {(variant.images || []).map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt=""
                              className="h-20 w-20 rounded-lg object-cover border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-90 group-hover:opacity-100"
                              onClick={() => removeImageFromVariant(variant.id, idx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <label className="h-20 w-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                          {uploadingId === variant.id ? (
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          ) : (
                            <Plus className="w-6 h-6 text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(variant.id, e)}
                            disabled={uploadingId === variant.id}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingIndex !== null ? "Update Product" : "Add to Collection"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BestCollectionManager;
