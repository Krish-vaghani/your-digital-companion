import { ArrowUpIcon } from "@/components/icons/ArrowUpIcon";

export const FloatingChatInput = () => (
  <div className="absolute bottom-1/3 right-12 w-80 animate-fade-in" style={{ animationDelay: "0.3s" }}>
    <div className="bg-card rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3">
      <span className="text-muted-foreground text-sm flex-1">
        Ask Lovable to build your saas
        <span className="animate-pulse">|</span>
      </span>
      <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
        <ArrowUpIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
);
