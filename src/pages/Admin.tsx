import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Layout, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { clearAuthToken, getAuthToken } from "@/lib/api";
import BestCollectionManager, { CollectionProduct } from "@/components/admin/BestCollectionManager";
import ProductList from "@/components/admin/ProductList";
import ProductForm, { ProductData } from "@/components/admin/ProductForm";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bestCollection, setBestCollection] = useState<CollectionProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);

  // Check auth on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
    }
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
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="webui" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Web UI
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              All Products
            </TabsTrigger>
          </TabsList>

          {/* Web UI Tab - Best Collection */}
          <TabsContent value="webui" className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Manage the <strong>Best Collection</strong> section that appears on your website. 
                  You can add up to <strong>4 products</strong> to showcase in this featured collection.
                </p>
              </CardContent>
            </Card>
            
            <BestCollectionManager
              products={bestCollection}
              onProductsChange={setBestCollection}
            />
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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
