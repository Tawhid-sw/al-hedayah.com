import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { AnimatedShinyText } from "../ui/animated-shiny-text";

export const HeroText = () => {
  return (
    <div className="z-10 flex items-center justify-center w-full flex-col gap-6 mt-4 border rounded-2xl p-8 relative overflow-hidden">
      <img
        src="/public/bg-image.webp"
        alt="background"
        className="absolute -top-80 left-0 object-cover bg-center -z-10 brightness-50 "
      />
      {/* Tagline */}
      <div
        className={cn(
          "rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex items-center justify-center",
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center gap-2 px-6 py-0.5 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <BookOpen className="size-5" />
          <span className="text-sm max-sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">
            <span className="tracking-wider">سَلَـٰمٌ عَلَيْكُمْ طِبْتُمْ</span>
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
    </div>
  );
};
