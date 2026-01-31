import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SocialButtonProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export const SocialButton = ({ icon, children, onClick }: SocialButtonProps) => (
  <Button
    variant="outline"
    className="w-full h-11 justify-center gap-3 font-normal text-foreground border-border hover:bg-secondary/50 transition-colors"
    onClick={onClick}
  >
    {icon}
    {children}
  </Button>
);
