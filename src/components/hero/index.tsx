import { cn } from "@/lib/utils";
import { BookOpen, Bookmark } from "lucide-react";
import { AnimatedShinyText } from "../ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shorter } from "../ui/sort-toggle";
import { SearchBar } from "./search-bar";

export const HeroSection = () => {
  return (
    <div>
      <div className="z-10 flex items-center justify-center w-full flex-col gap-8 mt-4   rounded-lg p-8">
        {/* Tagline */}
        <div
          className={cn(
            "rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex items-center justify-center",
          )}
        >
          <AnimatedShinyText className="inline-flex items-center justify-center gap-2 px-6 py-0.5 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
            <BookOpen className="size-5" />
            <span className="text-sm max-sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">
              <span className="tracking-wider">
                سَلَـٰمٌ عَلَيْكُمْ طِبْتُمْ
              </span>
            </span>
          </AnimatedShinyText>
        </div>

        {/* Reference */}
        {/* <p className="text-zinc-500 text-base max-sm:text-sm uppercase tracking-[0.2em] font-medium px-8">
        40:60
      </p> */}

        {/* Text */}
        <h1 className="text-xl smooth-fade sm:text-2xl md:text-3xl lg:text-4xl">
          <span className="bg-clip-text text-transparent bg-linear-to-b from-white via-zinc-200 to-zinc-400 leading-[1.4]">
            إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ
            الْمُحْسِنِينَ
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base lg:text-lg text-zinc-400 max-w-3xl  leading-relaxed font-light text-center">
          Indeed, whoever fears Allah and is patient—Allah does not allow the
          reward of the doers of good to be lost ( 40:60 ).
        </p>

        {/* tags */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 max-sm:gap-4 text-zinc-500 text-sm max-sm:text-xs">
            <span className="hover:text-zinc-300 transition-colors cursor-default">
              40+ Languages
            </span>
            <span className="text-zinc-700">•</span>
            <span className="hover:text-zinc-300 transition-colors cursor-default">
              20+ Reciters
            </span>
            <span className="text-zinc-700">•</span>
            <span className="hover:text-zinc-300 transition-colors cursor-default ">
              24/7 Access
            </span>
          </div>
        </div>

        {/* button */}
        <div className="flex items-center justify-center gap-8">
          <Button className="flex items-center justify-between gap-2">
            <BookOpen /> Continue reading
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between gap-2 py-[1.15rem]"
          >
            <Bookmark /> Bookmarks
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-8 flex items-center justify-between w-full">
        <div
          className="flex flex-1 items-center justify-items-start gap-2"
          id="search"
        >
          <SearchBar />
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <Tabs defaultValue="surah">
            <TabsList>
              <TabsTrigger value="surah">Surah</TabsTrigger>
              <TabsTrigger value="juz">Juz</TabsTrigger>
              <TabsTrigger value="Revelation_Order">
                Revelation Order
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Shorter a="Ascending" b="Descending" className="text-sm" />
        </div>
      </div>
    </div>
  );
};
