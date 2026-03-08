import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { getQuran } from "../quran-client/quran";
import type { ChapterId } from "@quranjs/api";

const searchProps = z.object({
  searchParams: z.string(),
});

export const getSearch = createServerFn({ method: "POST" })
  .inputValidator(searchProps)
  .handler(async ({ data }) => {
    const { searchParams } = data;
    const isNumber = /\b\d+\b(?![:\s;]\d)/g;
    const isBridgedNumber = /\d+[:\s;]\d+/g;
    try {
      // search surah by number
      if (searchParams.match(isNumber)) {
        const searchResult = await getQuran.chapters.findById(
          searchParams as ChapterId,
        );
        if (!searchResult)
          return { message: "surah not found. search between 1 - 114" };
        const { id, nameArabic, versesCount } = searchResult;
        return {
          id,
          nameArabic,
          translatedName: searchResult.translatedName.name,
          versesCount,
        };
      }
      // serach spcific ayah ( 2:255 )
      if (searchParams.match(isBridgedNumber)) {
        const searchResult = await getQuran.verses.findByKey("2:255", {
          translations: [20],
          words: true,
        });
        if (!searchResult)
          return { message: "verse not found. search between 1 - 114" };
      }
    } catch (error: any) {}
  });
