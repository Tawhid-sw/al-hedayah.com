import { getQuran } from "@/lib/quran-client/quran";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sampel")({
  component: RouteComponent,
  loader: async () => {
    const verse = await getQuran.chapters.findById("1");
    return verse;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  console.log(data);
  return <div>Hello "/sampel"!</div>;
}
