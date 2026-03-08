import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { getQuran } from "../quran-client/quran"; // Adjust path
import type { ChapterId, VerseKey } from "@quranjs/api";

const searchProps = z.object({
  searchParams: z.string(),
});

// --- SERVER FUNCTION ---
export const getSearch = createServerFn({ method: "POST" })
  .inputValidator(searchProps)
  .handler(async ({ data }) => {
    const { searchParams } = data;
    const trimmedInput = searchParams.trim();

    // Regex: Matches "2:255" or "2 255"
    const verseRegex = /^(\d+)[:\s]+(\d+)$/;
    // Regex: Matches ONLY a standalone number like "25"
    const chapterRegex = /^\d+$/;

    try {
      // 1. Check for Verse first (more specific)
      const verseMatch = trimmedInput.match(verseRegex);
      if (verseMatch) {
        const surah = verseMatch[1];
        const ayah = verseMatch[2];

        const searchResult = await getQuran.verses.findByKey(
          `${surah}:${ayah}` as VerseKey,
          { translations: [20], fields: { textUthmani: true } },
        );

        if (!searchResult) throw new Error(`Verse ${surah}:${ayah} not found.`);

        return {
          type: "verse" as const,
          ayah: searchResult.textUthmani,
          translation: searchResult.translations?.[0]?.text,
          verseKey: searchResult.verseKey,
        };
      }

      // 2. Check for Chapter second
      if (chapterRegex.test(trimmedInput)) {
        const searchResult = await getQuran.chapters.findById(
          trimmedInput as ChapterId,
        );

        if (!searchResult) throw new Error("Surah not found (1-114).");
        return {
          type: "chapter" as const,
          id: searchResult.id,
          nameArabic: searchResult.nameArabic,
          translatedName: searchResult.translatedName.name,
          versesCount: searchResult.versesCount,
        };
      }

      return null;
    } catch (error: any) {
      // Throwing allows TanStack Query to catch the error
      throw new Error(error.message || "Failed to fetch");
    }
  });

// --- CLIENT HOOK ---
export const useSearchQuery = (search: string) => {
  return useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      // Call the server function
      return await getSearch({ data: { searchParams: search } });
    },
    enabled: search.trim().length > 0,
    retry: false, // Don't retry on 404/not found errors
  });
};
