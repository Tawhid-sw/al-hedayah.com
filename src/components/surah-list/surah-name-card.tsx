import { type SimpleChapter } from "@/lib/quran/chapters";
import { BookOpen, MapPin } from "lucide-react";
import { AnimatedCircularProgressBar } from "../ui/animated-circular-progress-bar.tsx";

export const Surah_Name_Card = ({ data }: { data: SimpleChapter }) => {
  const { id, name, translatedName, versesCount, revelationPlace } = data;

  return (
    <div className="flex items-center justify-between w-full md:rounded-lg bg-background text-foreground relative md:border border-[.5px] md:border-foreground/20 border-foreground/10 p-4 overflow-hidden isolate">
      {/* BACKGROUND TEXT - Changed z-index and opacity */}
      <div
        className="font-surahname pointer-events-none select-none absolute inset-0 -right-2 z-[-1] flex items-center justify-end text-[7rem] text-muted-foreground/20 tracking-widest
      "
      >
        surah{id > 99 ? id : id > 9 ? `0${id}` : `00${id}`}
      </div>

      {/* LEFT CONTENT */}
      <div className="flex items-center justify-start gap-2">
        <AnimatedCircularProgressBar
          value={0}
          number={id}
          gaugePrimaryColor={"#ffffff"}
          gaugeSecondaryColor={"#18181b"}
          className="size-40 font-semibold w-10 h-10 text-sm"
        />

        <div>
          <h1 className="font-semibold leading-7">{name}</h1>
          <p className="text-muted-foreground text-sm">{translatedName}</p>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex items-center justify-end flex-col">
        <span className="text-muted-foreground text-sm flex items-center justify-center gap-2 leading-7">
          <BookOpen size={16} />
          {versesCount} Ayah
        </span>
        <span className="text-muted-foreground text-sm flex items-center justify-center gap-2 capitalize">
          <MapPin size={16} />
          {revelationPlace}
        </span>
      </div>
    </div>
  );
};
