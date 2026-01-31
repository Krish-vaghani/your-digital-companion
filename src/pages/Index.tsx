import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">Welcome</h1>
        <p className="text-muted-foreground">
          Go to admin panel to manage your landing page
        </p>
        <Button onClick={() => navigate("/login")} size="lg">
          <Settings className="w-4 h-4 mr-2" />
          Admin Panel
        </Button>
      </div>
    </div>
  );
};

export default Index;
