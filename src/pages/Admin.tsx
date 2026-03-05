import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  LogOut, Layout, Package, Image, Upload, DollarSign,
  Star, MessageSquare, Loader2, Save, ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { clearAuthToken, getAuthToken, landingApi, uploadApi } from "@/lib/api";
import AdminProductManager from "@/components/admin/AdminProductManager";
import OrderManager from "@/components/admin/OrderManager";
import TestimonialManager from "@/components/admin/TestimonialManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Hero section state ─────────────────────────────────────────────────────
  const [heroImage,        setHeroImage]        = useState<string | null>(null);
  const [heroPrice,        setHeroPrice]        = useState("");
  const [rating,           setRating]           = useState(5);
  const [numberOfReviews,  setNumberOfReviews]  = useState("");
  const [isUploading,      setIsUploading]      = useState(false);
  const [isSavingHero,     setIsSavingHero]     = useState(false);
  const [heroExists,       setHeroExists]       = useState(false);
  const [landingLoading,   setLandingLoading]   = useState(true);

  // ── Auth guard + load hero config ─────────────────────────────────────────
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
          setHeroImage((hero.images ?? [])[0] ?? null);
          if (hero.price          != null) setHeroPrice(String(hero.price));
          if (hero.rating         != null) setRating(Number(hero.rating));
          if (hero.numberOfReviews != null) setNumberOfReviews(String(hero.numberOfReviews));
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

  // ── Hero image upload ──────────────────────────────────────────────────────
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

  // ── Save hero banner config ────────────────────────────────────────────────
  const handleSaveHeroSection = async () => {
    setIsSavingHero(true);
    try {
      const body = {
        images:          heroImage ? [heroImage] : [],
        price:           heroPrice ? parseFloat(heroPrice) : undefined,
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
      toast({ title: "Hero section saved", description: "Changes saved successfully." });
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

  // ── Render ─────────────────────────────────────────────────────────────────
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

          {/* ── Web UI Tab (Hero banner config only) ── */}
          <TabsContent value="webui" className="space-y-6">
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="max-w-xs">
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Hero Banner
                </TabsTrigger>
              </TabsList>

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
                        {isSavingHero ? "Saving…" : "Save Changes"}
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
                                  {isUploading ? "Uploading…" : "Click to upload hero image"}
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5 MB</p>
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

                        {/* Price */}
                        <div className="space-y-3">
                          <Label htmlFor="heroPrice">Display Price</Label>
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
                            Price shown on the hero banner
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Reviews */}
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Reviews Display
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label>Rating (1–5)</Label>
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
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="numberOfReviews">Total Review Count</Label>
                            <Input
                              id="numberOfReviews"
                              type="number"
                              placeholder="1234"
                              value={numberOfReviews}
                              onChange={(e) => setNumberOfReviews(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ── Products Tab (with landing section assignment) ── */}
          <TabsContent value="products" className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-5 pb-4">
                <p className="text-sm text-muted-foreground">
                  Manage all products and assign them to landing page sections using the
                  <strong className="text-foreground mx-1">Landing Section</strong>
                  dropdown on each row. Changes take effect immediately on the storefront.
                </p>
              </CardContent>
            </Card>
            <AdminProductManager />
          </TabsContent>

          {/* ── Orders Tab ── */}
          <TabsContent value="orders" className="space-y-6">
            <OrderManager />
          </TabsContent>

          {/* ── Testimonials Tab ── */}
          <TabsContent value="testimonials" className="space-y-6">
            <TestimonialManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
