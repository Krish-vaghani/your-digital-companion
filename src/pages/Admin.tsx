import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Image, DollarSign, LogOut, Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroPrice, setHeroPrice] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewCount, setReviewCount] = useState("");

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving:", { heroImage, heroPrice, rating, reviewCount });
    alert("Changes saved! (Demo only - no backend)");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Hero Section
            </CardTitle>
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
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload hero image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroImageChange}
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
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Reviews Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <Label htmlFor="reviewCount">Total Review Count (Display)</Label>
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
          </CardContent>
        </Card>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Admin;
