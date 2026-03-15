import { createServerFn } from "@tanstack/react-start";
import { getQuran } from "./quran";

export interface SimpleChapter {
  id: number;
  name: string;
  translatedName: string;
  versesCount: number;
  revelationOrder: number;
  revelationPlace: string;
}

export const getChapters = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const chapters = await getQuran.chapters.findAll();

      if (!Array.isArray(chapters)) {
        console.error("API did not return an array:", chapters);
        return [];
      }

      // Map to the smallest possible object for low-end mobile RAM
      return chapters.map((c: any) => ({
        id: c.id,
        name: c.nameComplex,
        translatedName: c.translatedName?.name || "",
        versesCount: c.versesCount,
        revelationOrder: c.revelationOrder,
        revelationPlace: c.revelationPlace,
      })) as SimpleChapter[];
    } catch (error) {
      console.error("Server Fetch Error:", error);
      return [];
    }
  },
);
