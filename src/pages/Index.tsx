import { LoginForm } from "@/components/auth/LoginForm";
import { GradientPanel } from "@/components/auth/GradientPanel";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 lg:p-16">
        <LoginForm />
      </div>
      
      {/* Right Panel - Gradient Hero */}
      <div className="hidden lg:flex flex-1 p-3">
        <GradientPanel />
      </div>
    </div>
  );
};

export default Index;
