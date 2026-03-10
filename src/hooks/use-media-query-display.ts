import { useSyncExternalStore } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export const useMediaQueryDisplay = (): Breakpoint => {
  // This function tells React how to subscribe to the change
  const subscribe = (callback: () => void) => {
    const mqls = Object.values(breakpoints).map((q) => window.matchMedia(q));
    mqls.forEach((mql) => mql.addEventListener("change", callback));
    return () =>
      mqls.forEach((mql) => mql.removeEventListener("change", callback));
  };

  // This function tells React how to get the current value
  const getSnapshot = (): Breakpoint => {
    if (window.matchMedia(breakpoints["2xl"]).matches) return "2xl";
    if (window.matchMedia(breakpoints.xl).matches) return "xl";
    if (window.matchMedia(breakpoints.lg).matches) return "lg";
    if (window.matchMedia(breakpoints.md).matches) return "md";
    if (window.matchMedia(breakpoints.sm).matches) return "sm";
    return "xs";
  };

  // This function tells React what to show on the Server (SSR)
  const getServerSnapshot = (): Breakpoint => "xs";

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
