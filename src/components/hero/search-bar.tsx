import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useSearchQuery } from "@/lib/search"; // Your existing hook

export const SearchBar = () => {
  // 1. This state is the "Source of Truth" for our Query.
  // It only updates when the form successfully submits.
  const [submittedSearch, setSubmittedSearch] = useState("");

  // 2. Initialize TanStack Form
  const form = useForm({
    defaultValues: {
      query: "",
    },
    onSubmit: async ({ value }) => {
      // Trigger the query by updating the key
      setSubmittedSearch(value.query.trim());
    },
  });

  // 3. Connect to TanStack Query
  const { data, isLoading, error, isFetching } =
    useSearchQuery(submittedSearch);

  // 4. Test: Log results to console
  useEffect(() => {
    if (data) console.log("Result:", data);
    if (error) console.error("Error:", error.message);
  }, [data, error]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="w-full flex items-center justify-start"
    >
      <div className="flex items-center gap-2 w-full justify-start">
        <div className="relative w-[60%]">
          {/* Use TanStack Form Field */}
          <form.Field
            name="query"
            children={(field) => (
              <Input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Search Surahs (e.g. '1' or '2:255')..."
                className="py-5 pr-10"
              />
            )}
          />

          {/* Show spinner when fetching */}
          {(isLoading || isFetching) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <Button type="submit" disabled={isLoading || isFetching}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Validation/Error display */}
      {error && (
        <p className="text-destructive text-sm font-medium">{error.message}</p>
      )}
    </form>
  );
};
