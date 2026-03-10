import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { BookOpen, History, X, Quote } from "lucide-react";

interface SearchResultProps {
  className?: string;
  data: any;
  history: string[];
  onRemoveHistory: (item: string) => void;
  onSelectHistory: (item: string) => void;
  isSearching: boolean;
}

export const SearchResult = ({
  className,
  data,
  history,
  onRemoveHistory,
  onSelectHistory,
  isSearching,
}: SearchResultProps) => {
  // --- VIEW 1: SEARCH HISTORY ---
  // Shown when input is focused but no active search term is submitted
  if (!isSearching && history.length > 0) {
    return (
      <Card
        className={cn(
          "w-full mt-2 border-zinc-800 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl",
          className,
        )}
      >
        <div className="flex flex-col p-2">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Recent Searches
          </p>
          {history.map((item) => (
            <div
              key={item}
              className="group flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-zinc-900/80 transition-all cursor-pointer"
              onClick={() => onSelectHistory(item)}
            >
              <div className="flex items-center gap-3">
                <History
                  size={15}
                  className="text-zinc-600 group-hover:text-primary transition-colors"
                />
                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                  {item}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveHistory(item);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-red-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // --- VIEW 2: ACTUAL SEARCH RESULTS ---
  if (!data || !isSearching) return null;

  return (
    <div
      className={cn(
        "w-full mt-4 animate-in fade-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      {data.type === "chapter" ? (
        <ChapterCard data={data} />
      ) : (
        <VerseCard data={data} />
      )}
    </div>
  );
};

// --- Sub-component: Surah/Chapter Result ---
const ChapterCard = ({ data }: { data: any }) => (
  <Card className="group relative overflow-hidden border-zinc-800 bg-zinc-950/50 p-5 text-zinc-100 transition-all hover:border-zinc-700 hover:shadow-lg">
    {/* Decorative Background Arabic Name */}
    <div
      className="pointer-events-none absolute -bottom-2 -right-2 select-none text-7xl font-arabic opacity-5 transition-opacity group-hover:opacity-10"
      dir="rtl"
    >
      {data.nameArabic}
    </div>

    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <AnimatedCircularProgressBar
          className="w-11 h-11 text-xs font-bold"
          value={0}
          number={data.id}
          gaugePrimaryColor={"#ffffff"}
          gaugeSecondaryColor={"#18181b"}
        />
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            {data.nameComplex}
            <span className="text-xs text-zinc-500 font-normal">
              ({data.translatedName})
            </span>
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
            <BookOpen size={12} className="opacity-70" />
            {data.versesCount} Verses •{" "}
            <span className="capitalize">{data.revelationPlace}</span>
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-arabic text-zinc-200" dir="rtl">
          {data.nameArabic}
        </p>
      </div>
    </div>
  </Card>
);

// --- Sub-component: Ayah/Verse Result ---
const VerseCard = ({ data }: { data: any }) => {
  const cleanText =
    data.translation?.replace(/<sup[^>]*>.*?<\/sup>/g, "") ?? "";

  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
      <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/30 py-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="font-mono text-[10px] border-zinc-700 text-zinc-400"
          >
            VERSE {data.verseKey}
          </Badge>
          <Quote size={14} className="text-zinc-700" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-6">
        <div
          className="text-2xl font-arabic leading-loose text-right text-zinc-100"
          dir="rtl"
        >
          {data.ayah}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Translation
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-400 italic font-light">
            {cleanText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
