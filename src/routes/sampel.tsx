import { getQuran } from "@/lib/quran-client/quran.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sampel")({
  component: RouteComponent,
  loader: async () => {
    const verse = await getQuran.verses.findByKey("2:255", {
      translations: [20],
      words: true,
    });
    return verse;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  console.log(data);
  return <div>Hello "/sampel"!</div>;
}
