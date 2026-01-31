import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Image, DollarSign, Plus, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingImage {
  id: string;
  name: string;
  preview: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroPrice, setHeroPrice] = useState("");
  const [landingImages, setLandingImages] = useState<LandingImage[]>([
    { id: "1", name: "", preview: null },
  ]);

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

  const handleLandingImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLandingImages(prev =>
          prev.map(img =>
            img.id === id ? { ...img, name: file.name, preview: reader.result as string } : img
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addLandingImage = () => {
    setLandingImages(prev => [
      ...prev,
      { id: Date.now().toString(), name: "", preview: null },
    ]);
  };

  const removeLandingImage = (id: string) => {
    setLandingImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = () => {
    console.log("Saving:", { heroImage, heroPrice, landingImages });
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

        {/* Landing Page Images Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Landing Page Images
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addLandingImage}>
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {landingImages.map((img, index) => (
                <div
                  key={img.id}
                  className="border rounded-lg p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Image {index + 1}
                    </span>
                    {landingImages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeLandingImage(img.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    {img.preview ? (
                      <div className="space-y-2">
                        <img
                          src={img.preview}
                          alt={`Landing ${index + 1}`}
                          className="max-h-32 mx-auto rounded object-cover"
                        />
                        <p className="text-xs text-muted-foreground truncate">
                          {img.name}
                        </p>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Upload image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLandingImageChange(img.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
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
