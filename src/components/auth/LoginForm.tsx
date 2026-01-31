import { useState } from "react";
import { LovableLogo } from "@/components/icons/LovableLogo";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { LockIcon } from "@/components/icons/LockIcon";
import { SocialButton } from "./SocialButton";
import { Divider } from "./Divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoginForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Continue with email:", email);
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <LovableLogo className="w-10 h-10 mb-8" />
      
      <h1 className="text-3xl font-semibold text-foreground mb-8">Log in</h1>
      
      <div className="space-y-3">
        <SocialButton icon={<GoogleIcon />}>
          Continue with Google
        </SocialButton>
        
        <SocialButton icon={<GitHubIcon />}>
          Continue with GitHub
        </SocialButton>
      </div>
      
      <Divider />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-card border-border focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        
        <Button type="submit" className="w-full h-11">
          Continue
        </Button>
      </form>
      
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <a href="#" className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors">
          Create your account
        </a>
      </p>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6 pt-6 border-t border-border">
        <LockIcon className="w-4 h-4" />
        <span>
          SSO available on{" "}
          <a href="#" className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors">
            Business and Enterprise
          </a>{" "}
          plans
        </span>
      </div>
    </div>
  );
};
