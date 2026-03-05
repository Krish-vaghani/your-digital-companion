import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  productApi,
  type AdminProduct,
  type LandingSection,
  LANDING_SECTION_OPTIONS,
  landingSectionLabel,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ProductFormDialog from "./ProductFormDialog";

// ─── filter state ──────────────────────────────────────────────────────────────

interface Filters {
  landingSection: string;
  is_active: string;
  category: string;
  tag: string;
}

const DEFAULT_FILTERS: Filters = {
  landingSection: "",
  is_active: "",
  category: "",
  tag: "",
};

const CATEGORY_OPTIONS = ["purse", "jwellery"];
const TAG_OPTIONS      = ["bestseller", "hot", "trending", "sale"];

// ─── badge variant helper ──────────────────────────────────────────────────────

const sectionBadgeVariant = (
  section: LandingSection
): "default" | "secondary" | "outline" | "destructive" => {
  if (!section) return "outline";
  const map: Record<string, "default" | "secondary"> = {
    hero:             "default",
    best_collections: "secondary",
    elevate_look:     "secondary",
    fresh_styles:     "secondary",
  };
  return map[section] ?? "outline";
};

// ─── component ─────────────────────────────────────────────────────────────────

const AdminProductManager = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);

  const [filters,  setFilters]  = useState<Filters>(DEFAULT_FILTERS);
  const [search,   setSearch]   = useState("");

  // landing-section inline save
  const [savingId,   setSavingId]   = useState<string | null>(null);

  // add / edit dialog
  const [formOpen,   setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<AdminProduct | null>(null);

  // delete confirm
  const [deleteTarget,  setDeleteTarget]  = useState<AdminProduct | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  const LIMIT = 20;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ─── load ─────────────────────────────────────────────────────────────────

  const loadProducts = useCallback(
    async (p: number, f: Filters) => {
      setLoading(true);
      try {
        const params: Parameters<typeof productApi.list>[0] = {
          page:  p,
          limit: LIMIT,
        };
        if (f.category)                   params.category = f.category;
        if (f.tag)                        params.tag      = f.tag;
        if (f.is_active === "true")       params.is_active = true;
        else if (f.is_active === "false") params.is_active = false;
        if (f.landingSection && f.landingSection !== "null") {
          params.landingSection = f.landingSection as LandingSection;
        }
        const res = await productApi.list(params);
        const list: AdminProduct[] = res.data ?? res.products ?? [];
        setProducts(list);
        setTotal(res.total ?? list.length);
      } catch (err) {
        toast({
          title: "Failed to load products",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadProducts(page, filters);
  }, [page, filters, loadProducts]);

  // ─── filters ──────────────────────────────────────────────────────────────

  const applyFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setPage(1);
  };

  // ─── landing section inline change ────────────────────────────────────────

  const handleSectionChange = async (productId: string, rawValue: string) => {
    const newSection: LandingSection =
      rawValue === "null" ? null : (rawValue as LandingSection);

    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, landingSection: newSection } : p))
    );
    setSavingId(productId);
    try {
      await productApi.updateLandingSection(productId, newSection);
      toast({
        title: "Landing section updated",
        description: `Moved to "${landingSectionLabel(newSection)}"`,
      });
    } catch (err) {
      await loadProducts(page, filters);
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Could not update landing section",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  // ─── add ──────────────────────────────────────────────────────────────────

  const handleAddClick = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  // ─── edit ─────────────────────────────────────────────────────────────────

  const handleEditClick = (product: AdminProduct) => {
    setEditTarget(product);
    setFormOpen(true);
  };

  const handleFormSaved = (saved: AdminProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setTotal((t) => (editTarget ? t : t + 1));
  };

  // ─── delete ───────────────────────────────────────────────────────────────

  const handleDeleteClick = (product: AdminProduct) => {
    setDeleteTarget(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    try {
      await productApi.delete(deleteTarget._id);
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setTotal((t) => Math.max(0, t - 1));
      toast({ title: "Product deleted", description: `"${deleteTarget.name}" has been removed.` });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Could not delete product",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // ─── client-side search ───────────────────────────────────────────────────

  const displayed = search.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : products;

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* ── Filter bar ── */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[180px] space-y-1">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-8 h-8 text-sm"
                    placeholder="Name or category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Landing Section */}
              <div className="space-y-1">
                <Label className="text-xs">Landing Section</Label>
                <Select
                  value={filters.landingSection}
                  onValueChange={(v) =>
                    applyFilter("landingSection", v === "__all__" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All sections</SelectItem>
                    {LANDING_SECTION_OPTIONS.filter((o) => o.value !== null).map((o) => (
                      <SelectItem key={o.value!} value={o.value!}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.is_active}
                  onValueChange={(v) =>
                    applyFilter("is_active", v === "__all__" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(v) =>
                    applyFilter("category", v === "__all__" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag */}
              <div className="space-y-1">
                <Label className="text-xs">Tag</Label>
                <Select
                  value={filters.tag}
                  onValueChange={(v) =>
                    applyFilter("tag", v === "__all__" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {TAG_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset + Refresh */}
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => loadProducts(page, filters)}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Table ── */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              Products
              {!loading && (
                <span className="text-muted-foreground font-normal text-sm ml-1">
                  ({total} total)
                </span>
              )}
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin ml-1 text-muted-foreground" />
              )}
            </CardTitle>
            <Button size="sm" onClick={handleAddClick}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Product
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="text-left px-4 py-3 w-16">Image</th>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Price</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-3 min-w-[180px]">Landing Section</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Updated</th>
                    <th className="text-left px-4 py-3 w-24">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {displayed.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p>No products found</p>
                      </td>
                    </tr>
                  )}

                  {displayed.map((product) => {
                    const firstImage =
                      product.colorVariants?.find((v) => v.default)?.images?.[0] ??
                      product.colorVariants?.[0]?.images?.[0];

                    const isSaving   = savingId   === product._id;
                    const isDeleting = deletingId === product._id;

                    return (
                      <tr
                        key={product._id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        {/* Image */}
                        <td className="px-4 py-3">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </td>

                        {/* Name + tags */}
                        <td className="px-4 py-3">
                          <p className="font-medium leading-tight">
                            {product.name || "Untitled"}
                          </p>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground capitalize">
                          {product.category ?? "—"}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="font-semibold">
                            ₹{product.price?.toLocaleString() ?? "—"}
                          </span>
                          {product.originalPrice != null &&
                            product.originalPrice > product.price && (
                              <span className="text-xs text-muted-foreground line-through ml-1">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge
                            variant={product.is_active ? "default" : "secondary"}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {/* Landing Section dropdown */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Select
                              value={product.landingSection ?? "null"}
                              onValueChange={(v) =>
                                handleSectionChange(product._id, v)
                              }
                              disabled={isSaving}
                            >
                              <SelectTrigger className="h-8 w-44 text-xs">
                                {isSaving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
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
                            {product.landingSection && (
                              <Badge
                                variant={sectionBadgeVariant(product.landingSection)}
                                className="text-xs whitespace-nowrap hidden lg:inline-flex"
                              >
                                {landingSectionLabel(product.landingSection)}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Updated at */}
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditClick(product)}
                              title="Edit product"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(product)}
                              disabled={isDeleting}
                              title="Delete product"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Add / Edit dialog ── */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        product={editTarget}
        onSaved={handleFormSaved}
      />

      {/* ── Delete confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminProductManager;
