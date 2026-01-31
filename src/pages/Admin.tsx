import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image, DollarSign, Plus, Trash2, LogOut, Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroPrice, setHeroPrice] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, text: "" });

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

  const addReview = () => {
    if (newReview.author.trim() && newReview.text.trim()) {
      setReviews(prev => [
        ...prev,
        { id: Date.now().toString(), ...newReview },
      ]);
      setNewReview({ author: "", rating: 5, text: "" });
    }
  };

  const removeReview = (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id));
  };

  const handleSave = () => {
    console.log("Saving:", { heroImage, heroPrice, reviewCount, reviews });
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
              Reviews Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <Separator />

            {/* Add New Review */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Add New Review</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    placeholder="John Doe"
                    value={newReview.author}
                    onChange={(e) => setNewReview(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewText">Review Text</Label>
                <Textarea
                  id="reviewText"
                  placeholder="Write the review content..."
                  value={newReview.text}
                  onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button onClick={addReview} disabled={!newReview.author.trim() || !newReview.text.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label className="text-base font-medium">Added Reviews ({reviews.length})</Label>
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border rounded-lg p-4 relative group"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeReview(review.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.author}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
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
