import { Languages, Search, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils.ts";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

interface ActionBtnProps {
  className?: string;
  mounted: boolean;
}

export const ActionButtons = ({ className = "", mounted }: ActionBtnProps) => {
  return (
    <>
      <div className={cn("flex items-center gap-1", className)}>
        <Button variant="ghost" size="icon" className="rounded-full">
          <a href="#search">
            <Search className="w-5 h-5" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Languages className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
        {mounted && (
          <AnimatedThemeToggler className="bg-transparent rounded-full" />
        )}
      </div>
    </>
  );
};
