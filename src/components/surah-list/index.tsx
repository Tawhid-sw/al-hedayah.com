import { getChapters } from "@/lib/quran/chapters";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Surah_Name_Card } from "./surah-name-card";

export const SurahList = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["surah"],
    queryFn: async () => await getChapters(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-4 gap-0">
        {data.map((d) => (
          <Surah_Name_Card data={d} key={d.id} />
        ))}
      </div>
    </div>
  );
};
