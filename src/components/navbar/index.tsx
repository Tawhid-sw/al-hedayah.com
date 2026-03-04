import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { ActionButtons } from "./action-buttons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navLinks } from "./content";
import { ProfileIcon } from "./profile-icon";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 10);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full px-4 transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        isAtTop
          ? "bg-transparent py-5"
          : "bg-white/40 dark:bg-zinc-950/60 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 shadow-sm py-3",
      )}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto relative">
        {/* 1. Logo - Left */}
        <div className="z-60">
          <a className="text-xl cursor-pointer font-medium tracking-wide dark:text-white text-black">
            Al-Hedayah
          </a>
        </div>

        {/* 2. Desktop Navigation (Centered) & Mobile Menu */}
        <div
          className={cn(
            "md:flex md:flex-1 md:justify-center transition-all duration-300",
            "max-md:fixed max-md:top-[3.7rem] max-md:left-0 max-md:w-full max-md:h-[calc(100vh-3.7rem)] max-md:bg-background max-md:p-6 max-md:z-50 max-md:flex-col max-md:items-baseline",
            isOpen ? "max-md:flex" : "max-md:hidden",
          )}
        >
          {/* Nav Links */}
          <div className="flex items-center space-x-8 max-md:flex-col max-md:space-x-0 max-md:items-baseline max-md:gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <ActionButtons
            mounted={mounted}
            className="md:hidden mt-8 pt-6 border-t border-border w-full justify-between"
          />
        </div>

        {/* 3. Right Side: Desktop Actions + Profile */}
        <div className="flex items-center space-x-2 z-60">
          <ActionButtons mounted={mounted} className="hidden md:flex" />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <ProfileIcon />
        </div>
      </div>
    </nav>
  );
}
