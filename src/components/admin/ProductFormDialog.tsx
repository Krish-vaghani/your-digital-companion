import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import {
  productApi,
  uploadApi,
  type AdminProduct,
  type LandingSection,
  LANDING_SECTION_OPTIONS,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── types ────────────────────────────────────────────────────────────────────

interface ColorVariantDraft {
  id: string;
  colorCode: string;
  colorName: string;
  images: string[];
  default: boolean;
}

interface ProductDraft {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  price: string;
  salePrice: string;
  is_active: boolean;
  landingSection: LandingSection;
  tags: string[];
  heightCm: string;
  widthCm: string;
  depthCm: string;
  averageRating: string;
  numberOfReviews: string;
  colorVariants: ColorVariantDraft[];
}

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  slug: "",
  category: "purse",
  shortDescription: "",
  description: "",
  image: "",
  price: "",
  salePrice: "",
  is_active: true,
  landingSection: null,
  tags: [],
  heightCm: "",
  widthCm: "",
  depthCm: "",
  averageRating: "",
  numberOfReviews: "",
  colorVariants: [
    { id: "1", colorCode: "#374151", colorName: "Gray", images: [], default: true },
  ],
};

const TAG_OPTIONS      = ["bestseller", "hot", "trending", "sale"];
const CATEGORY_OPTIONS = ["purse", "jwellery"];

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ─── component ────────────────────────────────────────────────────────────────

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
  onSaved: (product: AdminProduct) => void;
}

const ProductFormDialog = ({
  open,
  onClose,
  product,
  onSaved,
}: ProductFormDialogProps) => {
  const { toast }   = useToast();
  const isEdit      = !!product;

  const [draft,         setDraft]         = useState<ProductDraft>(EMPTY_DRAFT);
  const [saving,        setSaving]        = useState(false);
  const [uploadingId,   setUploadingId]   = useState<string | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);

  // ── populate when editing ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (product) {
      const variants: ColorVariantDraft[] = (product.colorVariants ?? []).map(
        (v, i) => ({
          id:        v.colorCode + i,
          colorCode: v.colorCode,
          colorName: v.colorName ?? "",
          images:    v.images ?? [],
          default:   v.default ?? i === 0,
        })
      );
      if (variants.length && !variants.some((v) => v.default)) variants[0].default = true;

      setDraft({
        name:             product.name,
        slug:             product.slug ?? "",
        category:         product.category ?? "purse",
        shortDescription: product.shortDescription ?? "",
        description:      product.description ?? "",
        image:            product.image ?? "",
        price:            product.price != null ? String(product.price) : "",
        salePrice:        product.salePrice != null ? String(product.salePrice) : "",
        is_active:        product.is_active ?? true,
        landingSection:   product.landingSection,
        tags:             product.tags ?? [],
        heightCm:         product.dimensions?.heightCm != null ? String(product.dimensions.heightCm) : "",
        widthCm:          product.dimensions?.widthCm  != null ? String(product.dimensions.widthCm)  : "",
        depthCm:          product.dimensions?.depthCm  != null ? String(product.dimensions.depthCm)  : "",
        averageRating:    product.averageRating   != null ? String(product.averageRating)   : "",
        numberOfReviews:  product.numberOfReviews != null ? String(product.numberOfReviews) : "",
        colorVariants:    variants.length ? variants : EMPTY_DRAFT.colorVariants,
      });
    } else {
      setDraft(EMPTY_DRAFT);
    }
  }, [open, product]);

  // ── field helpers ──────────────────────────────────────────────────────────

  const set = <K extends keyof ProductDraft>(key: K, val: ProductDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: val }));

  const toggleTag = (tag: string) =>
    set(
      "tags",
      draft.tags.includes(tag)
        ? draft.tags.filter((t) => t !== tag)
        : [...draft.tags, tag]
    );

  // ── main image upload ──────────────────────────────────────────────────────

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setUploadingMain(true);
    try {
      const url = await uploadApi.uploadImage(file);
      set("image", url);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingMain(false);
    }
  };

  // ── color variant helpers ──────────────────────────────────────────────────

  const addVariant = () =>
    setDraft((prev) => ({
      ...prev,
      colorVariants: [
        ...prev.colorVariants,
        { id: Date.now().toString(), colorCode: "#000000", colorName: "", images: [], default: false },
      ],
    }));

  const removeVariant = (id: string) =>
    setDraft((prev) => {
      const next = prev.colorVariants.filter((v) => v.id !== id);
      if (next.length && !next.some((v) => v.default)) next[0].default = true;
      return { ...prev, colorVariants: next };
    });

  const updateVariant = (
    id: string,
    field: keyof ColorVariantDraft,
    value: string | boolean | string[]
  ) =>
    setDraft((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));

  const setDefaultVariant = (id: string) =>
    setDraft((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((v) => ({ ...v, default: v.id === id })),
    }));

  const removeImage = (variantId: string, imgIdx: number) =>
    setDraft((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((v) =>
        v.id === variantId
          ? { ...v, images: v.images.filter((_, i) => i !== imgIdx) }
          : v
      ),
    }));

  const handleImageUpload = async (
    variantId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setUploadingId(variantId);
    try {
      const url = await uploadApi.uploadImage(file);
      setDraft((prev) => ({
        ...prev,
        colorVariants: prev.colorVariants.map((v) =>
          v.id === variantId ? { ...v, images: [...v.images, url] } : v
        ),
      }));
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

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!draft.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!draft.price || isNaN(Number(draft.price))) {
      toast({ title: "A valid price is required", variant: "destructive" });
      return;
    }

    const dimensions =
      draft.heightCm || draft.widthCm || draft.depthCm
        ? {
            heightCm: draft.heightCm ? parseFloat(draft.heightCm) : undefined,
            widthCm:  draft.widthCm  ? parseFloat(draft.widthCm)  : undefined,
            depthCm:  draft.depthCm  ? parseFloat(draft.depthCm)  : undefined,
          }
        : undefined;

    const payload: Record<string, unknown> = {
      name:             draft.name.trim(),
      slug:             draft.slug.trim() || toSlug(draft.name),
      category:         draft.category,
      shortDescription: draft.shortDescription.trim(),
      description:      draft.description.trim(),
      image:            draft.image.trim() || undefined,
      price:            parseFloat(draft.price),
      salePrice:        draft.salePrice ? parseFloat(draft.salePrice) : null,
      is_active:        draft.is_active,
      landingSection:   draft.landingSection,
      tags:             draft.tags,
      dimensions,
      averageRating:   draft.averageRating   ? parseFloat(draft.averageRating)   : undefined,
      numberOfReviews: draft.numberOfReviews ? parseInt(draft.numberOfReviews, 10) : undefined,
      colorVariants:   draft.colorVariants.map((v) => ({
        colorCode: v.colorCode,
        colorName: v.colorName,
        images:    v.images,
        default:   v.default,
      })),
    };

    setSaving(true);
    try {
      let result: AdminProduct;
      if (isEdit && product) {
        const res = await productApi.update(product._id, payload);
        result = (res.data ?? { ...product, ...payload }) as AdminProduct;
      } else {
        const res = await productApi.add(payload);
        result = (res.data ?? payload) as AdminProduct;
      }
      toast({
        title: isEdit ? "Product updated" : "Product added",
        description: `"${draft.name}" has been ${isEdit ? "updated" : "added"} successfully.`,
      });
      onSaved(result);
      onClose();
    } catch (err) {
      toast({
        title: isEdit ? "Update failed" : "Add failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* ── Name + Slug ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pf-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-name"
                placeholder="Classic Leather Crossbody Bag"
                value={draft.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!isEdit) set("slug", toSlug(e.target.value));
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pf-slug">Slug</Label>
              <Input
                id="pf-slug"
                placeholder="classic-leather-crossbody-bag"
                value={draft.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </div>
          </div>

          {/* ── Category + Landing Section ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Landing Section</Label>
              <Select
                value={draft.landingSection ?? "null"}
                onValueChange={(v) =>
                  set("landingSection", v === "null" ? null : (v as LandingSection))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANDING_SECTION_OPTIONS.map((o) => (
                    <SelectItem
                      key={String(o.value)}
                      value={o.value === null ? "null" : o.value}
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Short Description ── */}
          <div className="space-y-1">
            <Label htmlFor="pf-short">Short Description</Label>
            <Input
              id="pf-short"
              placeholder="Compact tote with spacious interior"
              value={draft.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </div>

          {/* ── Full Description ── */}
          <div className="space-y-1">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea
              id="pf-desc"
              placeholder="Designed for everyday elegance. Crafted for women who love minimal style…"
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              className="min-h-[90px] resize-none"
            />
          </div>

          {/* ── Main / Cover Image ── */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex items-start gap-3">
              {/* Preview */}
              <div className="w-20 h-20 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                {draft.image ? (
                  <img
                    src={draft.image}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                {/* URL input */}
                <Input
                  placeholder="https://… or upload below"
                  value={draft.image}
                  onChange={(e) => set("image", e.target.value)}
                  className="text-sm"
                />
                {/* Upload */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="pointer-events-none"
                      disabled={uploadingMain}
                    >
                      {uploadingMain ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-1.5" />
                      )}
                      {uploadingMain ? "Uploading…" : "Upload image"}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMainImageUpload}
                      disabled={uploadingMain}
                    />
                  </label>
                  {draft.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => set("image", "")}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pf-price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-price"
                type="number"
                placeholder="3661"
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pf-sale">Sale Price (₹)</Label>
              <Input
                id="pf-sale"
                type="number"
                placeholder="3162"
                value={draft.salePrice}
                onChange={(e) => set("salePrice", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank if no discount</p>
            </div>
          </div>

          {/* ── Rating + Reviews ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pf-rating">Average Rating</Label>
              <Input
                id="pf-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="4.1"
                value={draft.averageRating}
                onChange={(e) => set("averageRating", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pf-reviews">Number of Reviews</Label>
              <Input
                id="pf-reviews"
                type="number"
                placeholder="64"
                value={draft.numberOfReviews}
                onChange={(e) => set("numberOfReviews", e.target.value)}
              />
            </div>
          </div>

          {/* ── Dimensions ── */}
          <div className="space-y-2">
            <Label>Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pf-h" className="text-xs text-muted-foreground">Height</Label>
                <Input
                  id="pf-h"
                  type="number"
                  placeholder="19"
                  value={draft.heightCm}
                  onChange={(e) => set("heightCm", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pf-w" className="text-xs text-muted-foreground">Width</Label>
                <Input
                  id="pf-w"
                  type="number"
                  placeholder="26"
                  value={draft.widthCm}
                  onChange={(e) => set("widthCm", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pf-d" className="text-xs text-muted-foreground">Depth</Label>
                <Input
                  id="pf-d"
                  type="number"
                  placeholder="6"
                  value={draft.depthCm}
                  onChange={(e) => set("depthCm", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Status + Tags ── */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="pf-active"
                checked={draft.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
              <Label htmlFor="pf-active" className="cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {TAG_OPTIONS.map((tag) => (
                <Badge
                  key={tag}
                  variant={draft.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-colors select-none"
                  onClick={() => toggleTag(tag)}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* ── Color Variants ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Color Variants</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add Color
              </Button>
            </div>

            <div className="space-y-3">
              {draft.colorVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="border rounded-lg p-4 bg-muted/30 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 flex-wrap">
                      <input
                        type="color"
                        value={variant.colorCode}
                        onChange={(e) =>
                          updateVariant(variant.id, "colorCode", e.target.value)
                        }
                        className="w-9 h-9 rounded cursor-pointer border-0 p-0"
                      />
                      <Input
                        placeholder="Color name (e.g. Gray)"
                        value={variant.colorName}
                        onChange={(e) =>
                          updateVariant(variant.id, "colorName", e.target.value)
                        }
                        className="max-w-[160px]"
                      />
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id={`def-${variant.id}`}
                          checked={variant.default}
                          onCheckedChange={() => setDefaultVariant(variant.id)}
                        />
                        <Label
                          htmlFor={`def-${variant.id}`}
                          className="text-xs font-normal cursor-pointer"
                        >
                          Default
                        </Label>
                      </div>
                    </div>
                    {draft.colorVariants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Images */}
                  <div className="flex flex-wrap gap-2">
                    {variant.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt=""
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full opacity-90"
                          onClick={() => removeImage(variant.id, idx)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}

                    <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      {uploadingId === variant.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Upload</span>
                        </>
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
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving
              ? isEdit ? "Saving…" : "Adding…"
              : isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
