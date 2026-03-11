import { X, ArrowLeft } from "lucide-react";
import { Input } from "../ui/input";
import { SearchResult } from "./search-result";
import { useForm } from "@tanstack/react-form";

export const MobileViewSearchBar = ({
  onClose,
  history,
  onRemoveHistory,
  data,
  isLoading,
  isFetching,
  onSearch,
  submittedSearch,
}: any) => {
  const form = useForm({
    defaultValues: { query: submittedSearch || "" },
    onSubmit: async ({ value }) => {
      onSearch(value.query.trim());
    },
  });

  return (
    <div className="fixed inset-0 h-screen w-full bg-black z-100 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="px-4 pt-6 pb-2 flex flex-col gap-4">
        {/* Navigation row */}
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 group">
            <ArrowLeft
              size={18}
              className="text-zinc-500 group-hover:text-white"
              strokeWidth={1.5}
            />
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium">
              Back
            </span>
          </button>

          {(isLoading || isFetching) && (
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">
                Syncing
              </span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="query"
            children={(field) => (
              <div className="relative">
                <Input
                  autoFocus
                  value={field.state.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.handleChange(val);
                    // If the user clears the input, immediately reset results in parent
                    if (val === "") {
                      onSearch("");
                    }
                  }}
                  placeholder="Search Surahs (e.g. '1' or '2:255')..."
                  // Added 'bg-transparent border-none' to kill the boxy look
                  className="w-full py-6 text-sm font-light shadow-none"
                />

                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-6">
                  {field.state.value && (
                    <button
                      type="button"
                      onClick={() => {
                        field.handleChange("");
                        onSearch("");
                      }}
                    >
                      <X
                        className="h-5 w-5 text-zinc-400 hover:text-white"
                        strokeWidth={1}
                      />
                    </button>
                  )}
                </div>
              </div>
            )}
          />
        </form>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {/* The SearchResult component already handles the History vs Result toggle 
            based on the isSearching (submittedSearch) prop */}
        <SearchResult
          data={data}
          history={history}
          isSearching={!!submittedSearch}
          onRemoveHistory={onRemoveHistory}
          onSelectHistory={(item: string) => {
            form.setFieldValue("query", item);
            onSearch(item);
          }}
          className="bg-transparent border-none shadow-none m-0 p-0"
        />
      </div>

      {/* Decorative Bottom Detail */}
      <div className="p-4 mt-auto pointer-events-none opacity-20">
        <div className="h-px w-8 bg-zinc-500 mb-2" />
        <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-500">
          Precision Search v3.0
        </p>
      </div>
    </div>
  );
};
