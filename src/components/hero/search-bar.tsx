import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import { useSearchQuery } from "@/lib/search";
import { SearchResult } from "./search-result";
import { useMediaQueryDisplay } from "@/hooks/use-media-query-display";
import { MobileViewSearchBar } from "./mobile-view-search-bar";

export const SearchBar = () => {
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const breakpoint = useMediaQueryDisplay();
  const isDesktop = ["lg", "xl", "2xl"].includes(breakpoint);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const form = useForm({
    defaultValues: { query: "" },
    onSubmit: async ({ value }) => {
      handleSearch(value.query.trim());
    },
  });

  const handleSearch = (query: string) => {
    // FIX: Instead of returning, set it to empty so SearchResult knows to hide
    if (!query) {
      setSubmittedSearch("");
      return;
    }

    setSubmittedSearch(query);
    setShowResults(true);

    // Update local and state history
    const updated = [query, ...history.filter((i) => i !== query)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const removeHistoryItem = (item: string) => {
    const updated = history.filter((i) => i !== item);
    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const selectHistoryItem = (item: string) => {
    form.setFieldValue("query", item); // Put text in input
    handleSearch(item); // Trigger search
  };

  const { data, isLoading, isFetching } = useSearchQuery(submittedSearch);

  // Logic: Show history when input is focused/clicked, but hide it if we have a real result showing
  const handleInputInteraction = () => {
    if (isDesktop) {
      // On Desktop: Open the dropdown (History or Results)
      setShowResults(true);
    } else {
      // On Mobile: This is where you'll eventually open your Drawer/Modal
      setIsMobileView(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="lg:w-1/2 md:w-[70%] w-full flex items-center justify-center flex-col relative"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isDesktop) form.handleSubmit();
        }}
        className="w-full flex items-center gap-2"
      >
        <div className="relative w-full">
          <form.Field
            name="query"
            children={(field) => (
              <div className="relative w-full">
                <Input
                  name={field.name}
                  value={field.state.value}
                  onFocus={handleInputInteraction}
                  onClick={handleInputInteraction}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    if (e.target.value === "") {
                      setSubmittedSearch("");
                      if (isDesktop) setShowResults(false);
                    }
                  }}
                  placeholder="Search Surahs (e.g. '1' or '2:255')..."
                  className={`py-5 pr-10 bg-zinc-950/50 border-zinc-800 transition-all ${!isDesktop && "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none cursor-pointer"}`}
                  readOnly={!isDesktop}
                />
                {field.state.value &&
                  isDesktop && ( // Hide X on mobile main bar to keep it clean
                    <X
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 cursor-pointer"
                      onClick={() => {
                        form.setFieldValue("query", "");
                        setSubmittedSearch("");
                      }}
                    />
                  )}
              </div>
            )}
          />
        </div>
        <Button
          className="max-md:hidden flex py-5"
          type="submit"
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Search size={18} />
          )}
        </Button>
      </form>

      {isDesktop && showResults && (
        <SearchResult
          data={data}
          history={history}
          isSearching={!!submittedSearch}
          onRemoveHistory={removeHistoryItem}
          onSelectHistory={selectHistoryItem}
        />
      )}

      {/* Mobile View with Props Passed */}
      {isMobileView && (
        <MobileViewSearchBar
          onClose={() => setIsMobileView(false)}
          history={history}
          onRemoveHistory={removeHistoryItem}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          onSearch={handleSearch}
          submittedSearch={submittedSearch}
        />
      )}
    </div>
  );
};
