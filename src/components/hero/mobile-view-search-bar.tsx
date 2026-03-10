import { X, Search, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { SearchResult } from "./search-result";
import { useForm } from "@tanstack/react-form";

interface MobileViewSearchBarProps {
  onClose: () => void;
  history: string[];
  onRemoveHistory: (item: string) => void;
  data: any;
  isLoading: boolean;
  isFetching: boolean;
  onSearch: (query: string) => void;
  submittedSearch: string;
}

export const MobileViewSearchBar = ({
  onClose,
  history,
  onRemoveHistory,
  data,
  isLoading,
  isFetching,
  onSearch,
  submittedSearch,
}: MobileViewSearchBarProps) => {
  const form = useForm({
    defaultValues: { query: submittedSearch || "" },
    onSubmit: async ({ value }) => {
      onSearch(value.query.trim());
    },
  });

  return (
    <div className="fixed inset-0 h-screen w-full bg-background z-100 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header with Input */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="query"
            children={(field) => (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  autoFocus
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Search Surahs..."
                  className="py-6 pl-10 pr-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-700"
                />
                {field.state.value && (
                  <X
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
                    onClick={() => field.handleChange("")}
                  />
                )}
              </div>
            )}
          />
        </form>
        <button
          onClick={onClose}
          className="text-sm font-medium text-zinc-400 hover:text-white px-2"
        >
          Cancel
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            <p className="text-xs text-zinc-500 animate-pulse">Searching...</p>
          </div>
        ) : (
          <SearchResult
            data={data}
            history={history}
            isSearching={!!submittedSearch}
            onRemoveHistory={onRemoveHistory}
            onSelectHistory={(item) => {
              form.setFieldValue("query", item);
              onSearch(item);
            }}
          />
        )}
      </div>
    </div>
  );
};
