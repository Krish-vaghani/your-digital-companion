import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LogOut, Layout, Package, Image, Upload, DollarSign, Star, MessageSquare, Loader2, Save, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { clearAuthToken, getAuthToken, landingApi, uploadApi } from "@/lib/api";
import BestCollectionManager, { CollectionProduct } from "@/components/admin/BestCollectionManager";
import ProductList from "@/components/admin/ProductList";
import ProductForm, { ProductData } from "@/components/admin/ProductForm";
import OrderManager from "@/components/admin/OrderManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bestCollection, setBestCollection] = useState<CollectionProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  
  // Hero section state
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroPrice, setHeroPrice] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewCount, setReviewCount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroSectionId, setHeroSectionId] = useState<string | null>(null);

  // Check auth on mount and load hero data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Load existing hero section data
    const loadHeroSection = async () => {
      try {
        const response = await landingApi.getSection("hero");
        if (response.data) {
          const data = response.data;
          setHeroSectionId(data._id || data.id);
          if (data.image) setHeroImage(data.image);
          if (data.price) setHeroPrice(data.price.toString());
          if (data.rating) setRating(data.rating);
          if (data.reviewCount) setReviewCount(data.reviewCount.toString());
        }
      } catch (error) {
        console.log("Hero section not found, will create new one");
      }
    };

    loadHeroSection();
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

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setHeroFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setHeroImage(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHeroSection = async () => {
    setIsSavingHero(true);
    try {
      let imageUrl = heroImage;

      // Upload image if a new file was selected
      if (heroFile) {
        const uploadResponse = await uploadApi.uploadImage(heroFile);
        imageUrl = uploadResponse.data?.url || uploadResponse.url;
      }

      const heroData = {
        key: "hero",
        image: imageUrl,
        price: heroPrice ? parseFloat(heroPrice) : undefined,
        rating: rating,
        reviewCount: reviewCount ? parseInt(reviewCount) : undefined,
      };

      if (heroSectionId) {
        await landingApi.updateSection(heroSectionId, heroData);
      } else {
        const response = await landingApi.addSection(heroData);
        setHeroSectionId(response.data?._id || response.data?.id);
      }

      setHeroFile(null);
      toast({
        title: "Hero section saved",
        description: "Your changes have been saved successfully",
      });
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
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
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
          </TabsList>

          {/* Web UI Tab */}
          <TabsContent value="webui" className="space-y-6">
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Hero Section
                </TabsTrigger>
                <TabsTrigger value="collection" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Collection
                </TabsTrigger>
              </TabsList>

              {/* Hero Tab */}
              <TabsContent value="hero" className="space-y-6">
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
                          <Label htmlFor="reviewCount">Total Review Count</Label>
                          <Input
                            id="reviewCount"
                            type="number"
                            placeholder="1234"
                            value={reviewCount}
                            onChange={(e) => setReviewCount(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            This number will be displayed as the total review count
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Collection Tab */}
              <TabsContent value="collection" className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Manage the <strong>Best Collection</strong> section. Add up to <strong>4 products</strong> to showcase.
                    </p>
                  </CardContent>
                </Card>
                
                <BestCollectionManager
                  products={bestCollection}
                  onProductsChange={setBestCollection}
                />
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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
