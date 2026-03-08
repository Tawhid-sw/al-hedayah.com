import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShorterProps {
  a: string;
  b: string;
  onSortChange?: (direction: "asc" | "desc") => void;
  className?: string;
}

export function Shorter({ a, b, onSortChange, className }: ShorterProps) {
  const [isAsc, setIsAsc] = useState(true);

  const toggleSort = () => {
    const next = !isAsc;
    setIsAsc(next);
    onSortChange?.(next ? "asc" : "desc");
  };

  return (
    <button
      onClick={toggleSort}
      className={cn(
        "group relative flex items-center gap-1 py-1.5 transition-all active:scale-95 outline-none",
        className,
      )}
    >
      {/* The Text Label */}
      <span
        className={cn(
          "font-semibold tracking-tight transition-colors duration-300",
          "text-muted-foreground group-hover:text-foreground", // Control text color here
        )}
      >
        {isAsc ? a : b}
      </span>

      {/* The Icon Container */}
      <div
        className={cn(
          "relative flex h-4 w-4 items-center justify-center transition-colors duration-300",
          "text-muted-foreground/60 group-hover:text-foreground", // Icon matches hover
        )}
      >
        {isAsc ? (
          <ArrowUp className="h-3.5 w-3.5 animate-in fade-in slide-in-from-bottom-1 duration-200" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 animate-in fade-in slide-in-from-top-1 duration-200" />
        )}
      </div>

      {/* The Underline - Syncs with Text hover */}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-px w-full transition-all duration-300",
          "bg-border group-hover:bg-foreground group-hover:h-[1.5px]", // Control underline color/thickness here
          isAsc ? "origin-left" : "origin-right",
        )}
      />
    </button>
  );
}
