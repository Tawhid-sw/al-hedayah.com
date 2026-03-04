import { useState, useEffect, useRef } from "react";
import { Search, Languages, Settings, Menu } from "lucide-react";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";
import { cn } from "@/lib/utils";
import { navLinks } from "./content";
import { ProfileIcon } from "./profile-icon.tsx";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  // Avoid hydration mismatch for the dark mode icon
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 10);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
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
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full px-4 py-3 transition-all duration-300 ease-in-out transform-gpu will-change-transform",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        isAtTop
          ? "bg-transparent border-transparent py-5"
          : "bg-white/40 dark:bg-zinc-950/60 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 shadow-sm py-3",
      )}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* 1. Logo */}
        <a className="text-xl cursor-pointer font-medium tracking-wide dark:text-white text-black">
          Al-Hedayah
        </a>

        {/* 2. Desktop Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-8">
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

        {/* 3. Actions & Dark Mode */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Dark Mode Toggle */}
          {mounted && (
            <AnimatedThemeToggler className="bg-transparent rounded-full" />
          )}

          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Languages className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hidden sm:inline-flex"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <ProfileIcon />

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background/95 backdrop-blur-xl border-l border-white/10"
              >
                <SheetTitle className="text-left text-2xl font-bold mb-10">
                  Menu
                </SheetTitle>
                <div className="flex flex-col space-y-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-xl font-medium border-b border-border/50 pb-2"
                    >
                      {link.name}
                    </a>
                  ))}
                  <div className="flex items-center space-x-4 pt-4 text-muted-foreground">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
