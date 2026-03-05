import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LogOut, Layout, Package, Image, Upload, DollarSign, Star, MessageSquare, Loader2, Save, ShoppingCart, Sparkles, Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { clearAuthToken, getAuthToken, landingApi, uploadApi, type LandingProductItem } from "@/lib/api";
import BestCollectionManager, { CollectionProduct } from "@/components/admin/BestCollectionManager";
import ProductList from "@/components/admin/ProductList";
import ProductForm, { ProductData } from "@/components/admin/ProductForm";
import OrderManager from "@/components/admin/OrderManager";
import TestimonialManager from "@/components/admin/TestimonialManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bestCollection, setBestCollection] = useState<CollectionProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  
  // Hero section state (API: images[], price, rating, numberOfReviews)
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroPrice, setHeroPrice] = useState("");
  const [rating, setRating] = useState(5);
  const [numberOfReviews, setNumberOfReviews] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroExists, setHeroExists] = useState(false);

  // Best collections
  const [bestCollectionsExists, setBestCollectionsExists] = useState(false);
  const [bestCollectionsSectionId, setBestCollectionsSectionId] = useState<string | null>(null);
  const [savingBestCollections, setSavingBestCollections] = useState(false);

  // Elevate look (exactly 4 products)
  const [elevateLookProducts, setElevateLookProducts] = useState<CollectionProduct[]>([]);
  const [elevateLookExists, setElevateLookExists] = useState(false);
  const [elevateLookSectionId, setElevateLookSectionId] = useState<string | null>(null);
  const [savingElevateLook, setSavingElevateLook] = useState(false);

  // Fresh styles (multiple products)
  const [freshStylesProducts, setFreshStylesProducts] = useState<CollectionProduct[]>([]);
  const [freshStylesExists, setFreshStylesExists] = useState(false);
  const [freshStylesSectionId, setFreshStylesSectionId] = useState<string | null>(null);
  const [savingFreshStyles, setSavingFreshStyles] = useState(false);

  // Last saved product lists – used to send only newly added objects on PUT (append)
  const [lastSavedBestCollection, setLastSavedBestCollection] = useState<CollectionProduct[]>([]);
  const [lastSavedElevateLook, setLastSavedElevateLook] = useState<CollectionProduct[]>([]);
  const [lastSavedFreshStyles, setLastSavedFreshStyles] = useState<CollectionProduct[]>([]);

  const [landingLoading, setLandingLoading] = useState(true);

  /** True if current is lastSaved plus extra items at the end (same order, same ids for prefix). */
  const isOnlyAppend = (current: CollectionProduct[], lastSaved: CollectionProduct[]) => {
    if (current.length <= lastSaved.length) return false;
    for (let i = 0; i < lastSaved.length; i++) {
      if (current[i].id !== lastSaved[i].id) return false;
    }
    return true;
  };

  const mapApiProductsToCollection = (
    products: {
      product?: string;
      images?: string[];
      price?: number;
      originalPrice?: number;
      tags?: string[];
      colors?: { colorCode: string; images?: string | string[]; default?: boolean }[];
    }[]
  ): CollectionProduct[] =>
    products.map((p) => {
      const colorList = p.colors?.length
        ? p.colors.map((c, i) => ({
            id: c.colorCode + i,
            color: c.colorCode,
            colorName: "",
            images: Array.isArray(c.images) ? c.images : typeof c.images === "string" ? [c.images] : [],
            default: i === 0 ? true : !!c.default,
          }))
        : [{ id: "1", color: "#374151", colorName: "Gray", images: p.images || [], default: true }];
      if (colorList.length && !colorList.some((c) => c.default)) colorList[0].default = true;
      return {
        id: p.product || "",
        name: "",
        description: "",
        price: p.price != null ? String(p.price) : "",
        originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
        tags: p.tags || [],
        colorVariants: colorList as CollectionProduct["colorVariants"],
      };
    });

  // Check auth on mount and load landing data (GET /admin/landing)
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const loadLanding = async () => {
      setLandingLoading(true);
      try {
        const response = await landingApi.getLanding();
        const data = response.data || {};
        const hero = data.hero;
        if (hero?._id) {
          setHeroExists(true);
          const images = hero.images || [];
          setHeroImage(images[0] || null);
          if (hero.price != null) setHeroPrice(String(hero.price));
          if (hero.rating != null) setRating(Number(hero.rating));
          if (hero.numberOfReviews != null) setNumberOfReviews(String(hero.numberOfReviews));
        }
        const best = data.best_collections;
        if (best?._id) {
          setBestCollectionsExists(true);
          setBestCollectionsSectionId(best._id || null);
          const bestList = mapApiProductsToCollection((best.products || []) as Parameters<typeof mapApiProductsToCollection>[0]);
          setBestCollection(bestList);
          setLastSavedBestCollection(bestList);
        }
        const elevate = data.elevate_look;
        if (elevate?._id) {
          setElevateLookExists(true);
          setElevateLookSectionId(elevate._id || null);
          const elevateList = mapApiProductsToCollection((elevate.products || []) as Parameters<typeof mapApiProductsToCollection>[0]);
          setElevateLookProducts(elevateList);
          setLastSavedElevateLook(elevateList);
        }
        const fresh = data.fresh_styles;
        if (fresh?._id) {
          setFreshStylesExists(true);
          setFreshStylesSectionId(fresh._id || null);
          const freshList = mapApiProductsToCollection((fresh.products || []) as Parameters<typeof mapApiProductsToCollection>[0]);
          setFreshStylesProducts(freshList);
          setLastSavedFreshStyles(freshList);
        }
      } catch (error) {
        console.log("Landing load failed", error);
      } finally {
        setLandingLoading(false);
      }
    };

    loadLanding();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthToken();
    navigate("/login");
  };

  const handleProductSave = (product: ProductData) => {
    setAllProducts((prev) => [...prev, product]);
    toast({
      title: "Product added",
      description: `${product.name || "Product"} has been added successfully`,
    });
  };

  const handleProductDelete = (index: number) => {
    setAllProducts((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Product deleted",
      description: "Product has been removed",
    });
  };

  const mapCollectionToApiProduct = (p: CollectionProduct): LandingProductItem => {
    const flatImages = (p.colorVariants ?? []).flatMap((v) => v.images ?? []);
    const colors = (p.colorVariants ?? [])
      .filter((v) => (v.images?.length ?? 0) > 0)
      .map((v) => ({
        colorCode: v.color,
        images: v.images ?? [],
        default: v.default ?? false,
      }));
    if (colors.length && !colors.some((c) => c.default)) colors[0].default = true;
    return {
      product: p.id || undefined,
      images: flatImages.length ? flatImages : undefined,
      price: p.price ? parseFloat(p.price) : undefined,
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
      rating: 4,
      numberOfReviews: 0,
      tags: p.tags ?? [],
      colors: colors.length ? colors : undefined,
    };
  };

  const handleSaveBestCollections = async (productsOverride?: CollectionProduct[]) => {
    setSavingBestCollections(true);
    try {
      const list = productsOverride ?? bestCollection;
      const products: LandingProductItem[] = list.map(mapCollectionToApiProduct);
      // Use POST (create) when we have no section id; use PUT when section already exists
      if (!bestCollectionsSectionId) {
        const body = { order: 1, is_active: true, products };
        try {
          const res = await landingApi.bestCollections.create(body);
          setBestCollectionsExists(true);
          if (res?.data?._id) setBestCollectionsSectionId(res.data._id);
          setLastSavedBestCollection(list);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("409") || msg.includes("already exists")) {
            setBestCollectionsExists(true);
            await landingApi.bestCollections.update(body);
            setLastSavedBestCollection(list);
          } else throw err;
        }
      } else {
        // Section exists: when only adding new products, send only those; otherwise send full list
        const onlyAppend = isOnlyAppend(list, lastSavedBestCollection);
        if (onlyAppend && list.length > lastSavedBestCollection.length) {
          const newProducts = list.slice(lastSavedBestCollection.length).map(mapCollectionToApiProduct);
          await landingApi.bestCollections.update({ products: newProducts });
        } else {
          await landingApi.bestCollections.update({ order: 1, is_active: true, products });
        }
        setLastSavedBestCollection(list);
      }
      toast({ title: "Best collections saved", description: "Your changes have been saved." });
    } catch (error) {
      toast({
        title: "Error saving best collections",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSavingBestCollections(false);
    }
  };

  const handleSaveElevateLook = async (productsOverride?: CollectionProduct[]) => {
    setSavingElevateLook(true);
    try {
      const list = productsOverride ?? elevateLookProducts;
      const products: LandingProductItem[] = list.map(mapCollectionToApiProduct);
      if (!elevateLookSectionId) {
        const body = { order: 2, products };
        try {
          const res = await landingApi.elevateLook.create(body);
          setElevateLookExists(true);
          if (res?.data?._id) setElevateLookSectionId(res.data._id);
          setLastSavedElevateLook(list);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("409") || msg.includes("already exists")) {
            setElevateLookExists(true);
            await landingApi.elevateLook.update(body);
            setLastSavedElevateLook(list);
          } else throw err;
        }
      } else {
        const onlyAppend = isOnlyAppend(list, lastSavedElevateLook);
        if (onlyAppend && list.length > lastSavedElevateLook.length) {
          const newProducts = list.slice(lastSavedElevateLook.length).map(mapCollectionToApiProduct);
          await landingApi.elevateLook.update({ products: newProducts });
        } else {
          await landingApi.elevateLook.update({ order: 2, products });
        }
        setLastSavedElevateLook(list);
      }
      toast({ title: "Elevate look saved", description: "Your changes have been saved." });
    } catch (error) {
      toast({
        title: "Error saving elevate look",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSavingElevateLook(false);
    }
  };

  const handleSaveFreshStyles = async (productsOverride?: CollectionProduct[]) => {
    setSavingFreshStyles(true);
    try {
      const list = productsOverride ?? freshStylesProducts;
      const products: LandingProductItem[] = list.map(mapCollectionToApiProduct);
      if (!freshStylesSectionId) {
        const body = { order: 3, is_active: true, products };
        try {
          const res = await landingApi.freshStyles.create(body);
          setFreshStylesExists(true);
          if (res?.data?._id) setFreshStylesSectionId(res.data._id);
          setLastSavedFreshStyles(list);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("409") || msg.includes("already exists")) {
            setFreshStylesExists(true);
            await landingApi.freshStyles.update(body);
            setLastSavedFreshStyles(list);
          } else throw err;
        }
      } else {
        const onlyAppend = isOnlyAppend(list, lastSavedFreshStyles);
        if (onlyAppend && list.length > lastSavedFreshStyles.length) {
          const newProducts = list.slice(lastSavedFreshStyles.length).map(mapCollectionToApiProduct);
          await landingApi.freshStyles.update({ products: newProducts });
        } else {
          await landingApi.freshStyles.update({ order: 3, is_active: true, products });
        }
        setLastSavedFreshStyles(list);
      }
      toast({ title: "Fresh styles saved", description: "Your changes have been saved." });
    } catch (error) {
      toast({
        title: "Error saving fresh styles",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSavingFreshStyles(false);
    }
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setIsUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setHeroImage(url);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveHeroSection = async () => {
    setIsSavingHero(true);
    try {
      const body = {
        images: heroImage ? [heroImage] : [],
        price: heroPrice ? parseFloat(heroPrice) : undefined,
        rating,
        numberOfReviews: numberOfReviews ? parseInt(numberOfReviews, 10) : undefined,
      };
      if (heroExists) {
        await landingApi.hero.update(body);
      } else {
        try {
          await landingApi.hero.create(body);
          setHeroExists(true);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("already exists") || msg.includes("409")) {
            setHeroExists(true);
            await landingApi.hero.update(body);
          } else throw err;
        }
      }
      toast({ title: "Hero section saved", description: "Your changes have been saved successfully" });
    } catch (error) {
      toast({
        title: "Error saving hero section",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsSavingHero(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="webui" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="webui" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Web UI
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Testimonials
            </TabsTrigger>
          </TabsList>

          {/* Web UI Tab */}
          <TabsContent value="webui" className="space-y-6">
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Hero
                </TabsTrigger>
                <TabsTrigger value="collection" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Best Collections
                </TabsTrigger>
                <TabsTrigger value="elevate" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Elevate Look
                </TabsTrigger>
                <TabsTrigger value="fresh" className="flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Fresh Styles
                </TabsTrigger>
              </TabsList>

              {/* Hero Tab */}
              <TabsContent value="hero" className="space-y-6">
                {landingLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Hero Section
                    </CardTitle>
                    <Button onClick={handleSaveHeroSection} disabled={isSavingHero}>
                      {isSavingHero ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSavingHero ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Image Upload */}
                      <div className="space-y-3">
                        <Label>Hero Image</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          {heroImage ? (
                            <div className="space-y-3">
                              <img
                                src={heroImage}
                                alt="Hero preview"
                                className="max-h-48 mx-auto rounded-lg object-cover"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setHeroImage(null)}
                                disabled={isUploading}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer block">
                              {isUploading ? (
                                <Loader2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-spin" />
                              ) : (
                                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                              )}
                              <p className="text-sm text-muted-foreground mb-2">
                                {isUploading ? "Uploading..." : "Click to upload hero image"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG up to 5MB
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleHeroImageChange}
                                disabled={isUploading}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Price Field */}
                      <div className="space-y-3">
                        <Label htmlFor="heroPrice">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="heroPrice"
                            type="text"
                            placeholder="99.99"
                            value={heroPrice}
                            onChange={(e) => setHeroPrice(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter the price to display on the hero section
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Reviews Section - inside Hero */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Reviews Display
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Rating */}
                        <div className="space-y-3">
                          <Label>Rating (1-5)</Label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Select the rating to display
                          </p>
                        </div>

                        {/* Review Count */}
                        <div className="space-y-3">
                          <Label htmlFor="numberOfReviews">Total Review Count</Label>
                          <Input
                            id="numberOfReviews"
                            type="number"
                            placeholder="1234"
                            value={numberOfReviews}
                            onChange={(e) => setNumberOfReviews(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            This number will be displayed as the total review count
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
              </TabsContent>

              {/* Collection Tab */}
              <TabsContent value="collection" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Best Collection</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add up to 4 products to showcase. Use product ID from your product list.
                      </p>
                    </div>
                    <Button type="button" onClick={handleSaveBestCollections} disabled={savingBestCollections}>
                      {savingBestCollections ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {savingBestCollections ? "Saving..." : "Save Best Collections"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BestCollectionManager
                      title="Best Collection"
                      maxProducts={4}
                      products={bestCollection}
                      onProductsChange={setBestCollection}
                      onSaveRequested={(nextProducts) => {
                        setBestCollection(nextProducts);
                        void handleSaveBestCollections(nextProducts);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Elevate Look Tab – exactly 4 products */}
              <TabsContent value="elevate" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Elevate Look
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Exactly 4 products. Use product ID from your product list.
                      </p>
                    </div>
                    <Button type="button" onClick={handleSaveElevateLook} disabled={savingElevateLook}>
                      {savingElevateLook ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {savingElevateLook ? "Saving..." : "Save Elevate Look"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BestCollectionManager
                      title="Elevate Look"
                      maxProducts={4}
                      products={elevateLookProducts}
                      onProductsChange={setElevateLookProducts}
                      onSaveRequested={(nextProducts) => {
                        setElevateLookProducts(nextProducts);
                        void handleSaveElevateLook(nextProducts);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fresh Styles Tab – multiple products */}
              <TabsContent value="fresh" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shirt className="w-5 h-5" />
                        Fresh Styles
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Multiple products. Use product ID from your product list.
                      </p>
                    </div>
                    <Button type="button" onClick={handleSaveFreshStyles} disabled={savingFreshStyles}>
                      {savingFreshStyles ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {savingFreshStyles ? "Saving..." : "Save Fresh Styles"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BestCollectionManager
                      title="Fresh Styles"
                      maxProducts={null}
                      products={freshStylesProducts}
                      onProductsChange={setFreshStylesProducts}
                      onSaveRequested={(nextProducts) => {
                        setFreshStylesProducts(nextProducts);
                        void handleSaveFreshStyles(nextProducts);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* All Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Manage all your products here. Add unlimited products to your catalog.
                </p>
              </CardContent>
            </Card>

            <ProductForm onSave={handleProductSave} />
            <ProductList
              products={allProducts}
              onDelete={handleProductDelete}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <OrderManager />
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-6">
            <TestimonialManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
