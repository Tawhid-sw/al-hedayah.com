import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { BookOpen } from "lucide-react";

interface SearchResultProps {
  className?: string;
  data: any;
}

export const SearchResult = ({ className, data }: SearchResultProps) => {
  if (!data) return null;

  return (
    <div
      className={cn(
        "w-full mt-4 animate-in fade-in slide-in-from-top-2 cursor-pointer",
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

// --- Sub-component for Surah/Chapter Results ---
const ChapterCard = ({ data }: { data: any }) => (
  <Card
    className="group relative overflow-hidden border-zinc-800 bg-background
   px-5 py-2 text-zinc-100 transition-all hover:border-zinc-700"
  >
    <div className="flex items-center gap-4 justify-between">
      <div className="flex items-center gap-4 justify-start">
        <AnimatedCircularProgressBar
          className="w-10 h-10 text-sm font-medium"
          value={0}
          number={data.id}
          gaugePrimaryColor={"#ffffff"}
          gaugeSecondaryColor={"#171717"}
        />
        <div className="flex items-baseline flex-col justify-start gap-1">
          <h1 className="text-base font-medium text-foreground tracking-widest">
            <span>{data.nameComplex} </span>
            <span className="text-sm text-zinc-500 font-medium">
              ( {data.translatedName} )
            </span>
          </h1>

          <p className="flex text-sm text-zinc-500 font-medium items-center justify-start gap-2">
            <BookOpen size={14} />
            {data.versesCount} Verses
          </p>
        </div>
      </div>

      <div>
        <h1 className="text-base font-medium text-foreground text-center"></h1>
        <p className="text-sm text-zinc-500 font-medium"></p>
      </div>
    </div>
  </Card>
);

// --- Sub-component for Ayah/Verse Results ---
const VerseCard = ({ data }: { data: any }) => {
  // Regex to strip footnote tags
  const cleanText =
    data.translation?.replace(/<sup[^>]*>.*?<\/sup>/g, "") ?? "";

  return (
    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-mono">
            Verse {data.verseKey}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="text-sm font-arabic leading-[1.8] text-right" dir="rtl">
          {data.ayah}
        </div>
        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Translation
          </span>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {cleanText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
