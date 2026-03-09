import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react"; // Added X
import { useSearchQuery } from "@/lib/search";
import { SearchResult } from "./search-result";

export const SearchBar = () => {
  const [submittedSearch, setSubmittedSearch] = useState("");

  const form = useForm({
    defaultValues: {
      query: "",
    },
    onSubmit: async ({ value }) => {
      setSubmittedSearch(value.query.trim());
    },
  });

  // 1. Updated Hook usage to prevent automatic re-calling
  const { data, isLoading, error, isFetching } =
    useSearchQuery(submittedSearch);

  // 3. Clear Function
  const handleClear = () => {
    form.setFieldValue("query", ""); // Clear Form
    setSubmittedSearch(""); // Clear Query/Results
  };

  return (
    <div className="w-[40%] relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="w-full flex items-center justify-center"
      >
        <div className="w-full flex items-center gap-2 justify-center">
          <div className="relative w-full">
            <form.Field
              name="query"
              children={(field) => (
                <div className="relative">
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Search Surahs (e.g. '1' or '2:255')..."
                    className="py-5 pr-10"
                  />

                  {/* 2. Clear (X) Button - Only shows if there is text */}
                  {field.state.value && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            />
          </div>

          <Button
            className="py-5 px-6"
            type="submit"
            disabled={isLoading || isFetching}
          >
            {/* Loader moved here exclusively */}
            {isLoading || isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Validation/Error display moved below the form for cleaner UI */}
      {error && (
        <p className="text-destructive text-xs font-medium mt-2 absolute">
          {error.message}
        </p>
      )}

      {/* Search Result - Positioned below */}
      <div className="mt-4">
        <SearchResult data={data} />
      </div>
    </div>
  );
};
